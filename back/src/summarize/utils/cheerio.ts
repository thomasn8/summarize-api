import * as cheerio from 'cheerio';
import { UrlParsed } from '../types/summarize.types';
import {
  cleanContiguousBlankCharacters,
  splitParagraphsInSentences,
  splitTextInParagraphs
} from './text';

interface MetaDatas {
  title: string;
  description: string;
  site_name: string;
  image: string;
  icon: string;
  keywords: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStaticWebPageContent(url: UrlParsed): string[][] {
  try {
    const $ = cheerio.load(url.axiosResponse.data);
    $('nav, footer').remove();
    const text = $('body').text();
    const cleanedText = cleanContiguousBlankCharacters(text);
    const paragraphs = splitTextInParagraphs(cleanedText);
    const paragraphsOfSentences = splitParagraphsInSentences(paragraphs);
    return paragraphsOfSentences;
  } catch (error) {
    url.errors.push(
      `Error: (static) web page content not available for the url ${url}`
    );
    return [];
  }
}

export function getMetaDatas(url: UrlParsed): MetaDatas | undefined {
  try {
    const $ = cheerio.load(url.axiosResponse.data, null, true);
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      $('meta[name="title"]').attr('content');
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content');
    const site_name = $('meta[property="og:site_name"]').attr('content');
    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content');
    const icon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href');
    const keywords =
      $('meta[property="og:keywords"]').attr('content') ||
      $('meta[name="keywords"]').attr('content');
    return {
      title: title,
      description: description,
      site_name: site_name,
      image: image,
      icon: icon,
      keywords: keywords
    };
  } catch (error) {
    url.errors.push(`Error: metadatas not available for the url ${url}`);
    return undefined;
  }
}
