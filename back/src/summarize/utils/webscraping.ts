import { UrlParsed } from '../types/summarize.types';
import { YoutubeTranscript } from 'youtube-transcript';
import * as he from 'he';

// TODO: use Jina ai provisory, later  use cheerio
export async function getStaticWebPageContent(url: UrlParsed): Promise<string> {
  try {
    const response = await fetch('https://r.jina.ai/' + url.url, {
      method: 'GET'
    });
    return await response.text();
  } catch (error) {
    url.errors.push('Web page content (static) not available');
    return '';
  }
}

// TODO: use Jina ai provisory, later  use Puppeteer or Playwright
export async function getDynamicWebPageContent(
  url: UrlParsed
): Promise<string> {
  // TODO: implement
  url;
  return '';
}

export async function getTranscriptContent(url: UrlParsed): Promise<string> {
  try {
    const transcripts = await YoutubeTranscript.fetchTranscript(url.url);
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
    return '';
  }
}
