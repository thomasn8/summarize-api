import { RequestDto } from '../dto/request.dto';
import { AxiosResponse } from 'axios';
import OpenAI from 'openai';

export type RequestType = 'Urls' | 'Query';
export type UrlContentType = 'WebPage' | 'YoutubeVideo';
export type WebPage = 'Static' | 'Dynamic' | 'Jina';

export type AskLlmFunction = (
  llm: Chat,
  systemMessage: string,
  userMessage: string
) => Promise<string>;

export interface UrlParsed {
  url: string;
  contentType: UrlContentType;
  axiosResponse?: AxiosResponse;
  webPage?: WebPage;
  chunks?: string[];
  summary?: string;
  errors: string[];
}

export interface JinaResponseParsed {
  url: string;
  markdownContent: string;
}

export interface Chat {
  openai: OpenAI;
  contextWindow?: number;
  model: OpenAI.Chat.ChatModel;
}

export interface LastSummarization {
  request: RequestDto;
  openai: Chat;
  textToSummarize: string;
}

export interface Summary {
  url: string;
  summary: string | undefined;
  errors: string[];
}
