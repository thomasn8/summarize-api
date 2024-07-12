import { RequestDto } from '../../summarize/dto/request.dto';
import {
  UrlParsed,
  Chat,
  DefinitiveSummarization,
  AskLlmFunction
} from '../types/summarize.types';
import { getIndexOfUniqueSummary } from '../utils/get-index-of-unique-summary';
import {
  getDetailsPart,
  getDirectivePart,
  getDisclaimerPart,
  getExpertisePart,
  getLanguagePart,
  getLengthPart
} from './prompts';

export async function summarizeAll(
  request: RequestDto,
  openai: Chat,
  urls: UrlParsed[],
  askLlm: AskLlmFunction
): Promise<string> {
  const i = getIndexOfUniqueSummary(urls);
  if (i === -1) return 'Error';
  if (i !== undefined) return urls[i].summary;

  const urlsSummariesJoined = urls.map((url) => url.summary).join('\n');
  return summarizeInOneChunk(
    {
      request: request,
      openai: openai,
      textToSummarize: urlsSummariesJoined
    },
    askLlm
  );
}

export async function summarizeInSeveralChunks(
  request: RequestDto,
  openai: Chat,
  url: UrlParsed,
  askLlm: AskLlmFunction
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
        chunkSummary: await askLlm(openai, systemMessage, userMessage)
      };
    })
  );

  chunkSummariesList.sort((a, b) => a.index - b.index);
  const chunksSummariesJoined = chunkSummariesList
    .map((chunk) => chunk.chunkSummary)
    .join('\n');
  return summarizeInOneChunk(
    {
      request: request,
      openai: openai,
      textToSummarize: chunksSummariesJoined
    },
    askLlm
  );
}

export async function summarizeInOneChunk(
  ds: DefinitiveSummarization,
  askLlm: AskLlmFunction
): Promise<string> {
  let systemMessage = '';
  systemMessage += getExpertisePart(ds.request.expertise ?? undefined) + '\n';
  systemMessage += getDirectivePart(ds.request.directive ?? undefined) + '\n';
  systemMessage += getDetailsPart(ds.request.details - 1) + '\n';
  systemMessage += getLanguagePart(ds.request.language) + '\n';
  systemMessage += getLengthPart(ds.request.length ?? undefined) + '\n';
  systemMessage += getDisclaimerPart();
  const userMessage = `Text to summarize:\n\`\`\`${ds.textToSummarize}\`\`\``;
  return await askLlm(ds.openai, systemMessage, userMessage);
}
