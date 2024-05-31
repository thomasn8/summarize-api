export function cleanContiguousBlankCharacters(text: string): string {
  return text
    .replace(/\n\n+/g, '\n\n')
    .replace(/ +/g, ' ')
    .replace(/\t+/g, '\t');
}

export function splitTextInParagraphs(text: string): string[] {
  return text.split('\n\n');
}

export function splitParagraphsInSentences(paragraphs: string[]): string[][] {
  return paragraphs.map((paragraph) => {
    let text = paragraph;
    text = text.replace(/\.\s*([A-Z])/g, '.<eos> $1');
    text = text.replace(/\?\s*([A-Z])/g, '?<eos> $1');
    text = text.replace(/!\s*([A-Z])/g, '!<eos> $1');
    return text
      .split('<eos>')
      .filter(Boolean)
      .map((sentence) => sentence.trim());
  });
}
