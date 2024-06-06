import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RequestDto } from './dto/request.dto';
import { ResponseDto } from './dto/response.dto';
import { UrlParsed, Chat } from './types/summarize.types';
import { isInvalidUrl } from '../summarize/utils/urls';
import { getChunks } from '../summarize/utils/tokens';
import {
  summarizeInOneChunk,
  summarizeInSeveralChunks,
  summarizeAll
} from './utils/openai';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import * as he from 'he';
import OpenAI from 'openai';

@Injectable()
export class SummarizeService {
  public async getSummary(request: RequestDto): Promise<ResponseDto> {
    const urls = this.parseUrls(request.urls);
    const openai = await this.getOpenAiInstance(request);

    await Promise.all(
      urls.map(async (url) => {
        try {
          url.axiosResponse = await axios.get(url.url);
          // TODO: differentiate between static webpage content (simple, use cheerio) and dynamic webpage content (use Puppeteer or Playwright)
          if (url.contentType === 'WebPage') {
            const text =
              url.webPage && url.webPage === 'Dynamic'
                ? await this.getDynamicWebPageContent(url)
                : await this.getStaticWebPageContent(url);
            url.chunks = await getChunks(text, openai.contextWindow);
          } else {
            const text = await this.getTranscriptContent(url);
            url.chunks = await getChunks(text, openai.contextWindow);
          }

          if (url.chunks.length === 0) throw new Error();
        } catch (error) {
          url.errors.push(`Error: content not available for the url ${url}`);
        }
      })
    );

    await Promise.all(
      urls.map(async (url) => {
        if (!url.chunks || url.chunks.length === 0) return;
        try {
          url.summary =
            url.chunks.length === 1
              ? await summarizeInOneChunk({
                  request: request,
                  openai: openai,
                  textToSummarize: url.chunks[0]
                })
              : await summarizeInSeveralChunks(request, openai, url);
        } catch (error) {
          url.errors.push(
            `Error: chatgpt could not generate a summary for the url ${url}`
          );
        }
      })
    );

    if (urls.length > 1) {
      const overallSummary = await summarizeAll(request, openai, urls);
      return {
        summary: overallSummary,
        summaries: urls.map((url) => {
          return { url: url.url, summary: url.summary };
        }),
        errors: urls.map((url) => url.errors).flat()
      };
    }
    return { summary: urls[0].summary, errors: urls[0].errors };
  }

  private parseUrls(text: string): UrlParsed[] {
    const urls: string[] = text
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.some((url) => isInvalidUrl(url)))
      throw new HttpException('Invalid urls', HttpStatus.BAD_REQUEST);

    const urlsParsed: UrlParsed[] = urls.map((url) => {
      return url.toLowerCase().includes('youtube.com')
        ? { url: url, contentType: 'YoutubeVideo', errors: [] }
        : { url: url, contentType: 'WebPage', errors: [] };
    });

    if (urlsParsed.length > 30)
      throw new HttpException(
        'Too many urls, maximum 30',
        HttpStatus.BAD_REQUEST
      );
    if (urlsParsed.length > 0) return urlsParsed;
    throw new HttpException('Invalid urls', HttpStatus.BAD_REQUEST);
  }

  private async getOpenAiInstance(request: RequestDto): Promise<Chat> {
    try {
      const openai = new OpenAI({
        apiKey: request.apiKey
      });

      // This is used to test if the model name exist (doesn't give informations about the token context window)
      await openai.models.retrieve(request.model);

      // TODO: find a way to get openai model context
      const contextWindow = request.model.startsWith('gpt-3.5-turbo')
        ? 16385
        : 4096;

      return {
        openai: openai,
        contextWindow: contextWindow,
        model: request.model as OpenAI.Chat.ChatModel
      };
    } catch (error) {
      throw new HttpException(
        'Impossible to get OpenAI instance: ' + error.error.message,
        500
      );
    }
  }

  private async getStaticWebPageContent(url: UrlParsed): Promise<string> {
    try {
      const response = await fetch('https://r.jina.ai/' + url.url, {
        method: 'GET'
      });
      return await response.text();
    } catch (error) {
      url.errors.push(
        `Error: (static) web page content not available for the url ${url}`
      );
      return '';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getDynamicWebPageContent(url: UrlParsed): Promise<string> {
    // TODO: implement
    return '';
  }

  private async getTranscriptContent(url: UrlParsed): Promise<string> {
    const transcripts = await YoutubeTranscript.fetchTranscript(url.url);
    // TODO: find a strategy to split the speech with pauses or something
    let text = '';
    for (const transcript of transcripts) {
      text += transcript.text + ' ';
    }
    text = he.decode(
      text
        .replace(/<text.+>/, '')
        .replace(/&amp;/gi, '&')
        .replace(/<\/?[^>]+(>|$)/g, '')
    );
    return text;
  }
}
