import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { RequestDto } from './dto/request.dto';
import { ResponseDto } from './dto/response.dto';
import { UrlParsed } from './types/summarize.types';
import { isInvalidUrl } from '../summarize/utils/urls';
import { getChunks } from '../summarize/utils/tokens';
import {
  summarizeInOneChunk,
  summarizeInSeveralChunks,
  summarizeAll
} from './utils/summarize';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import * as he from 'he';
import { askChatGpt, getOpenAiInstance } from './utils/openai';
import { getJinaMarkdownContent, getJinaUrls } from './utils/jina';

// TODO: check new techniques of webscraping (with ai ?) to replace usage of jina which may become chargeable in the future

@Injectable()
export class SummarizeService {
  // TODO: add logs (jina request, openai requests, etc)to a file a somehow
  public async summarize(request: RequestDto): Promise<ResponseDto> {
    if (request.urls === undefined && request.query === undefined)
      throw new HttpException('No content', HttpStatus.BAD_REQUEST);

    // TODO: add possibility to use local llm (ollama) instead of passing by chatgpt
    // for this, adapts the code and some interfaces (like Chat and AskLlmFunction, ...)
    const openai = await getOpenAiInstance(request);

    const urls =
      request.requestType === 'urls'
        ? this.parseUrls(request.urls)
        : await this.parseQuery(request.query, openai.contextWindow);

    if (request.requestType === 'urls') {
      await Promise.all(
        urls.map(async (url) => {
          try {
            url.axiosResponse = await axios.get(url.url);
            // TODO: differentiate between static webpage content (simple, use cheerio) and dynamic webpage content (use Puppeteer or Playwright)

            const text =
              url.contentType === 'WebPage'
                ? url.webPage && url.webPage === 'Dynamic'
                  ? await this.getDynamicWebPageContent(url)
                  : await this.getStaticWebPageContent(url)
                : await this.getTranscriptContent(url);

            if (url.errors.length !== 0) return;
            url.chunks = await getChunks(text, openai.contextWindow);
          } catch (error) {
            url.errors.push('Content not available');
          }
        })
      );
    }

    console.log('return');
    throw new InternalServerErrorException();

    await Promise.all(
      urls.map(async (url) => {
        if (url.errors.length !== 0) return;

        try {
          url.summary =
            url.chunks.length === 1
              ? await summarizeInOneChunk(
                  {
                    request: request,
                    openai: openai,
                    textToSummarize: url.chunks[0]
                  },
                  askChatGpt
                )
              : await summarizeInSeveralChunks(
                  request,
                  openai,
                  url,
                  askChatGpt
                );
        } catch (error) {
          url.errors.push('Chatgpt could not generate a summary');
        }
      })
    );

    const overallSummary = await summarizeAll(
      request,
      openai,
      urls,
      askChatGpt
    );

    return {
      summary: overallSummary,
      summaries: urls.map((url) => {
        return {
          url: url.url,
          summary: url.summary,
          errors: url.errors
        };
      })
    };
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

  private async parseQuery(
    text: string,
    contextWindow: number
  ): Promise<UrlParsed[]> {
    if (this.isUrl(text)) throw new BadRequestException();

    try {
      const response = await (
        await fetch('https://s.jina.ai/ ' + text, {
          method: 'GET'
        })
      ).text();

      const urls = getJinaUrls(response);
      const markdownContents = getJinaMarkdownContent(response);

      if (urls.length === markdownContents.length) {
        return await Promise.all(
          urls.map(async (url, index) => ({
            url: url,
            contentType: 'WebPage',
            webPage: 'Jina',
            chunks: await getChunks(markdownContents[index], contextWindow),
            errors: []
          }))
        );
      }
      return [
        {
          url: 'https://s.jina.ai/ ' + text,
          contentType: 'WebPage',
          webPage: 'Jina',
          chunks: await getChunks(response, contextWindow),
          errors: []
        }
      ];
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async getStaticWebPageContent(
    url: UrlParsed
  ): Promise<string | undefined> {
    try {
      const response = await fetch('https://r.jina.ai/' + url.url, {
        method: 'GET'
      });
      return await response.text();
    } catch (error) {
      url.errors.push('Web page content (static) not available');
      return undefined;
    }
  }

  private async getDynamicWebPageContent(
    url: UrlParsed
  ): Promise<string | undefined> {
    // TODO: implement
    url;
    return undefined;
  }

  private async getTranscriptContent(
    url: UrlParsed
  ): Promise<string | undefined> {
    try {
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
    } catch (error) {
      url.errors.push('Impossible to get youtube transcripts');
      return undefined;
    }
  }

  private isUrl(text: string): boolean {
    try {
      this.parseUrls(text);
      return true;
    } catch (error) {
      return false;
    }
  }
}
