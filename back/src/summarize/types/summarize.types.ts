import { RequestDto } from '../dto/request.dto';
import { AxiosResponse } from 'axios';
import OpenAI from 'openai';

export type RequestType = 'Urls' | 'Query';
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

export interface JinaResponseParsed {
  url: string;
  markdownContent: string;
}

export interface Chat {
  openai: OpenAI;
  contextWindow?: number;
  model: OpenAI.Chat.ChatModel;
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
