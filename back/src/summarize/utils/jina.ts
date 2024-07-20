import { HttpException, HttpStatus } from '@nestjs/common';
import { JinaResponseParsed, UrlParsed } from '../types/summarize.types';
import { getChunks } from './tokens';

export async function requestJinaWithQuery(
  text: string
): Promise<JinaResponseParsed[]> {
  let response: string;
  let urls: string[];
  let markdownContents: string[];
  try {
    response = await (
      await fetch('https://s.jina.ai/ ' + text, {
        method: 'GET'
      })
    ).text();
  } catch (error) {
    throw new HttpException(
      'Error during Jina request',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  try {
    urls = getJinaUrls(response);
    markdownContents = getJinaMarkdownContent(response);

    if (urls.length === markdownContents.length) {
      return urls.map((url, i) => ({
        url: url,
        markdownContent: markdownContents[i]
      }));
    } else {
      return [
        {
          url: 'https://s.jina.ai/ ' + text,
          markdownContent: response
        }
      ];
    }
  } catch (error) {
    throw new HttpException(
      'Error during Jina request',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getJinaUrlsContent(
  jinaUrlsContent: JinaResponseParsed[],
  contextWindow: number
): Promise<UrlParsed[]> {
  return await Promise.all(
    jinaUrlsContent.map(async (jinaUrl) => {
      try {
        return {
          url: jinaUrl.url,
          contentType: 'WebPage',
          webPage: 'Jina',
          chunks: await getChunks(jinaUrl.markdownContent, contextWindow),
          errors: []
        };
      } catch (error) {
        return {
          url: jinaUrl.url,
          contentType: 'WebPage',
          webPage: 'Jina',
          chunks: [],
          errors: ['Web page content (Jina) not available']
        };
      }
    })
  );
}

export function getJinaUrls(text: string): string[] {
  const urlRegex = /\[\d+\] URL Source: (https?:\/\/[^\s]+)/g;
  let match: RegExpExecArray;
  const urls: string[] = [];

  while ((match = urlRegex.exec(text)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  return urls;
}

export function getJinaMarkdownContent(input: string): string[] {
  const regex =
    /\[\d+\] Markdown Content:\n([\s\S]*?)(?=\[\d+\] Title|\[\d+\] URL Source|\[\d+\] Description|\[\d+\] Published Time|$)/g;
  const matches = [];
  let match: RegExpExecArray;

  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}
