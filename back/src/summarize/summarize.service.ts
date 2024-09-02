import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RequestDto } from './dto/request.dto';
import { ResponseDto } from './dto/response.dto';
import {
  AskLlmFunction,
  Chat,
  Summary,
  UrlParsed
} from './types/summarize.types';
import {
  getDynamicWebPageContent,
  getStaticWebPageContent,
  getTranscriptContent
} from './utils/webscraping';
import { isUrl, parseUrls } from '../summarize/utils/urls';
import { getChunks } from './utils/get-chunks';
import { askChatGpt, getOpenAiInstance } from './utils/openai';
import { getJinaUrlsContent, requestJinaWithQuery } from './utils/jina';
import {
  getDetailsPart,
  getDirectivePart,
  getDisclaimerPart,
  getExpertisePart,
  getLanguagePart,
  getLengthPart
} from './utils/prompts';

import axios from 'axios';

// TODO: check new techniques of webscraping (with ai ?) to replace usage of jina which may become chargeable in the future

@Injectable()
export class SummarizeService {
  // TODO: add logs (jina request, openai requests, etc)to a file a somehow
  public async summarize(request: RequestDto): Promise<ResponseDto> {
    // TODO: add possibility to use local llm (ollama) instead of passing by chatgpt
    // for this, adapts the code and some interfaces (like Chat and AskLlmFunction, ...)
    const openai = await getOpenAiInstance(request);

    const urls: UrlParsed[] = await this.getWebscrapingContent(
      request,
      openai.contextWindow
    );

    const summaries = await this.getSummaries(request, openai, urls);
    const summary = await this.getSummary(request, openai, urls, askChatGpt);

    return {
      summary: summary,
      summaries: summaries
    };
  }

  private async getWebscrapingContent(
    request: RequestDto,
    chunkLength: number
  ): Promise<UrlParsed[]> {
    const urls: UrlParsed[] = [];

    if (request.requestType === 'Urls') {
      urls.push(...parseUrls(request.urls));

      await Promise.all(
        urls.map(async (url) => {
          let text = '';
          if (url.contentType === 'YoutubeVideo') {
            text = await getTranscriptContent(url);
          } else {
            try {
              url.axiosResponse = await axios.get(url.url);
            } catch (error) {
              url.errors.push('Content not available');
            }
            text =
              url.webPage === 'Static'
                ? await getStaticWebPageContent(url)
                : await getDynamicWebPageContent(url);
          }

          try {
            if (url.errors.length !== 0 || text === '') throw new Error();
            url.chunks = await getChunks(text, chunkLength);
          } catch (error) {
            url.errors.push('Content not available');
          }
        })
      );
    } else if (request.requestType === 'Query') {
      if (isUrl(request.query))
        throw new HttpException('Invalid query', HttpStatus.BAD_REQUEST);

      const jinaUrlsContent = await requestJinaWithQuery(request.query);
      urls.push(...(await getJinaUrlsContent(jinaUrlsContent, chunkLength)));
    }

    return urls;
  }

  private async getSummaries(
    request: RequestDto,
    openai: Chat,
    urls: UrlParsed[]
  ): Promise<Summary[]> {
    await Promise.all(
      urls.map(async (url) => {
        if (url.errors.length !== 0) return;
        try {
          url.summary =
            url.chunks.length === 1
              ? await this.summarizeInOneChunk(
                  request,
                  openai,
                  url.chunks[0],
                  askChatGpt
                )
              : await this.summarizeInSeveralChunks(
                  request,
                  openai,
                  url,
                  askChatGpt
                );
        } catch (error) {
          url.errors.push(
            'Impossible to generate a summary: ' + error.error.message
          );
        }
      })
    );

    return urls.map((url) => {
      return {
        url: url.url,
        summary: url.summary,
        errors: url.errors
      };
    });
  }

  private async getSummary(
    request: RequestDto,
    openai: Chat,
    urls: UrlParsed[],
    askLlm: AskLlmFunction
  ): Promise<string> {
    const i = this.getIndexOfUniqueSummary(urls);
    if (i === -1) return 'Error';
    if (i !== undefined) return urls[i].summary;

    const urlsSummariesJoined = urls.map((url) => url.summary).join('\n');
    return this.summarizeInOneChunk(
      request,
      openai,
      urlsSummariesJoined,
      askLlm
    );
  }

  private getIndexOfUniqueSummary(urls: UrlParsed[]): number | undefined {
    let i = 0;
    let last = 0;
    let count = 0;
    while (i < urls.length) {
      if (urls[i].summary !== undefined) {
        last = i;
        count++;
      }
      if (count > 1) break;
      i++;
    }
    if (count === 1) return last;
    if (count === 0) return -1;
    return undefined; // means more than one summary
  }

  private async summarizeInSeveralChunks(
    request: RequestDto,
    openai: Chat,
    url: UrlParsed,
    askLlm: AskLlmFunction
  ): Promise<string> {
    const chunkSummariesList = await Promise.all(
      url.chunks.map(async (chunk, index) => {
        let systemMessage = '';
        systemMessage +=
          getExpertisePart(request.expertise ?? undefined) + '\n';
        systemMessage +=
          getDirectivePart(request.directive ?? undefined) + '\n';
        systemMessage += getDetailsPart(2) + '\n'; // force asking a detailed summary
        systemMessage += getDisclaimerPart();
        const userMessage = `Text to summarize:\n\`\`\`${chunk}\`\`\``;
        return {
          index: index,
          chunkSummary: await askLlm(openai, systemMessage, userMessage)
        };
      })
    );

    chunkSummariesList.sort((a, b) => a.index - b.index);
    const chunksSummariesJoined = chunkSummariesList
      .map((chunk) => chunk.chunkSummary)
      .join('\n');
    return this.summarizeInOneChunk(
      request,
      openai,
      chunksSummariesJoined,
      askLlm
    );
  }

  private async summarizeInOneChunk(
    request: RequestDto,
    openai: Chat,
    textToSummarize: string,
    askLlm: AskLlmFunction
  ): Promise<string> {
    let systemMessage = '';
    systemMessage += getExpertisePart(request.expertise ?? undefined) + '\n';
    systemMessage += getDirectivePart(request.directive ?? undefined) + '\n';
    systemMessage += getDetailsPart(request.details - 1) + '\n';
    systemMessage += getLanguagePart(request.language) + '\n';
    systemMessage += getLengthPart(request.length ?? undefined) + '\n';
    systemMessage += getDisclaimerPart();
    const userMessage = `Text to summarize:\n\`\`\`${textToSummarize}\`\`\``;
    return await askLlm(openai, systemMessage, userMessage);
  }
}
