import { get_encoding } from 'tiktoken';

export async function getChunks(
  text: string,
  llmContextWindow: number
): Promise<string[]> {
  if (!text) throw new Error();

  const numberOfTokens = await countTokens(text);
  const maxNumberOfTokens = Math.floor(llmContextWindow * 0.75);
  if (numberOfTokens < maxNumberOfTokens) return [text];

  const ratio = Math.ceil(numberOfTokens / maxNumberOfTokens);
  const words = text.split(' ');
  const numberOfWords = words.length;
  const maxChunkLength = Math.ceil(numberOfWords / ratio);

  const chunks: string[] = [];
  let chunk = '';
  let i = 0;
  let j = 0;
  while (i < numberOfWords) {
    if (j === maxChunkLength) {
      chunks.push(chunk);
      chunk = '';
      j = 0;
    }
    chunk += words[i] + ' ';
    i++;
    j++;
  }
  if (chunk.length > 0) chunks.push(chunk);

  if (chunks.length === 0) throw new Error();
  return chunks;
}

async function countTokens(text: string): Promise<number> {
  const encoding = get_encoding('cl100k_base');
  const tokens = encoding.encode(text);
  encoding.free();
  return tokens.length;
}
