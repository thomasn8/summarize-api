import { RequestDto } from '../../summarize/dto/request.dto';
import {
  UrlParsed,
  Chat,
  DefinitiveSummarization
} from '../types/summarize.types';
import OpenAI from 'openai';

export async function summarizeInOneChunk(
  ds: DefinitiveSummarization
): Promise<string> {
  let systemMessage = '';
  systemMessage += getExpertisePart(ds.request.expertise ?? undefined) + '\n';
  systemMessage += getDirectivePart(ds.request.directive ?? undefined) + '\n';
  systemMessage += getDetailsPart(ds.request.details - 1) + '\n';
  systemMessage += getLanguagePart(ds.request.language) + '\n';
  systemMessage += getLengthPart(ds.request.length ?? undefined) + '\n';
  systemMessage += getDisclaimerPart();
  const userMessage = `Text to summarize:\n\`\`\`${ds.textToSummarize}\`\`\``;
  return await askChatGpt(ds.openai, systemMessage, userMessage);
}

export async function summarizeInSeveralChunks(
  request: RequestDto,
  openai: Chat,
  url: UrlParsed
): Promise<string> {
  const chunkSummariesList = await Promise.all(
    url.chunks.map(async (chunk, index) => {
      let systemMessage = '';
      systemMessage += getExpertisePart(request.expertise ?? undefined) + '\n';
      systemMessage += getDirectivePart(request.directive ?? undefined) + '\n';
      systemMessage += getDetailsPart(2) + '\n'; // force asking a detailed summary
      systemMessage += getDisclaimerPart();
      const userMessage = `Text to summarize:\n\`\`\`${chunk}\`\`\``;
      return {
        index: index,
        chunkSummary: await askChatGpt(openai, systemMessage, userMessage)
      };
    })
  );

  chunkSummariesList.sort((a, b) => a.index - b.index);
  const chunksSummariesJoined = chunkSummariesList
    .map((chunk) => chunk.chunkSummary)
    .join('\n');
  return summarizeInOneChunk({
    request: request,
    openai: openai,
    textToSummarize: chunksSummariesJoined
  });
}

export async function summarizeAll(
  request: RequestDto,
  openai: Chat,
  urls: UrlParsed[]
): Promise<string> {
  const urlsSummariesJoined = urls.map((url) => url.summary).join('\n');
  return summarizeInOneChunk({
    request: request,
    openai: openai,
    textToSummarize: urlsSummariesJoined
  });
}

async function askChatGpt(
  chat: Chat,
  systemMessage: string,
  userMessage: string
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];

  // console.log(systemMessage);

  const chatCompletion = await chat.openai.chat.completions.create({
    messages: messages,
    model: chat.model
  });

  return chatCompletion.choices[0].message.content;
}

function getExpertisePart(expertise: string | undefined): string {
  return expertise && expertise !== ''
    ? `You are an expert in the field of ${expertise}.`
    : 'You are an helpful assistant.';
}

function getDirectivePart(directive: string | undefined): string {
  const text = 'I will provide you with a text wrapped in triple backticks. ';
  return directive && directive !== ''
    ? text +
        `Your task is to write a summary of this text on the subject of ${directive}.`
    : text + 'Your task is to write a summary of this text.';
}

function getDetailsPart(index: number): string {
  const summaryType = [
    'brief summary: retain only the most critical and major information',
    'concise summary: capture the essential information and significant points, while omitting non-essential details and repetitive content',
    'detailed summary: include all important information, examples, and nuances, avoiding unnecessary repetition'
  ];
  return `Produce a ${summaryType[index]}.`;
}

function getLanguagePart(language: string): string {
  return `Write the summary in the ${language} language.`;
}

function getLengthPart(length: number | undefined): string {
  return length && length > 0
    ? `Your summary must be ${length} words long.`
    : '';
}

function getDisclaimerPart(): string {
  return 'Return only the raw summary with NO explanation and NO wrapping backticks.';
}
