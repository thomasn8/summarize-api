import { RequestDto } from '../../summarize/dto/request.dto';
import {
  UrlParsed,
  Chat,
  DefinitiveSummarization
} from '../types/summarize.types';
import { getIndexOfUniqueSummary } from '../utils/get-index-of-unique-summary';
import { askChatGpt } from './openai';
import {
  getDetailsPart,
  getDirectivePart,
  getDisclaimerPart,
  getExpertisePart,
  getLanguagePart,
  getLengthPart
} from './prompts';

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
  const i = getIndexOfUniqueSummary(urls);
  if (i === -1) return 'Error';
  if (i !== undefined) return urls[i].summary;

  const urlsSummariesJoined = urls.map((url) => url.summary).join('\n');
  return summarizeInOneChunk({
    request: request,
    openai: openai,
    textToSummarize: urlsSummariesJoined
  });
}
