import { HttpException, HttpStatus } from '@nestjs/common';
import { UrlParsed } from '../types/summarize.types';

export function parseUrls(text: string): UrlParsed[] {
  const urls: string[] = text
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  if (urls.some((url) => isInvalidUrl(url)))
    throw new HttpException('Invalid urls', HttpStatus.BAD_REQUEST);

  const urlsParsed: UrlParsed[] = urls.map((url) => {
    return url.toLowerCase().includes('youtube.com')
      ? { url: url, contentType: 'YoutubeVideo', errors: [] }
      : { url: url, contentType: 'WebPage', webPage: 'Static', errors: [] }; // TODO: differentiate between Static (html content) and Dynamic (javascript content) webpage
  });

  if (urlsParsed.length > 30)
    throw new HttpException(
      'Too many urls, maximum 30',
      HttpStatus.BAD_REQUEST
    );
  if (urlsParsed.length > 0) return urlsParsed;
  throw new HttpException('Invalid urls', HttpStatus.BAD_REQUEST);
}

export function isUrl(text: string): boolean {
  try {
    this.parseUrls(text);
    return true;
  } catch (error) {
    return false;
  }
}

function isInvalidUrl(text: string): boolean {
  try {
    new URL(text);
    return false;
  } catch (e) {
    return true;
  }
}
