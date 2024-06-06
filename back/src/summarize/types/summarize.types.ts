import { RequestDto } from '../dto/request.dto';
import { AxiosResponse } from 'axios';
import OpenAI from 'openai';

export type UrlContentType = 'WebPage' | 'YoutubeVideo';
export type WebPage = 'Static' | 'Dynamic';
export interface UrlParsed {
  url: string;
  contentType: UrlContentType;
  axiosResponse?: AxiosResponse;
  webPage?: WebPage;
  metaDatas?: MetaDatas;
  chunks?: string[];
  summary?: string;
  errors: string[];
}

export interface Chat {
  openai: OpenAI;
  contextWindow?: number;
  model: OpenAI.Chat.ChatModel;
}

export interface MetaDatas {
  title: string;
  description: string;
  site_name: string;
  image: string;
  icon: string;
  keywords: string;
}

export interface Summaries {
  url: string;
  summary: string;
}

export interface DefinitiveSummarization {
  request: RequestDto;
  openai: Chat;
  textToSummarize: string;
}
