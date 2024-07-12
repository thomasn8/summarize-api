import { RequestDto } from '../dto/request.dto';
import { AxiosResponse } from 'axios';
import OpenAI from 'openai';

export type UrlContentType = 'WebPage' | 'YoutubeVideo';
export type WebPage = 'Static' | 'Dynamic' | 'Jina';
export interface UrlParsed {
  url: string;
  contentType: UrlContentType;
  axiosResponse?: AxiosResponse;
  webPage?: WebPage;
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

export interface DefinitiveSummarization {
  request: RequestDto;
  openai: Chat;
  textToSummarize: string;
}

export type AskLlmFunction = (
  llm: Chat,
  systemMessage: string,
  userMessage: string
) => Promise<string>;
