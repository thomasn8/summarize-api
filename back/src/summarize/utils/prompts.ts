export function getExpertisePart(expertise: string | undefined): string {
  return expertise && expertise !== ''
    ? `You are an expert in the field of ${expertise}.`
    : 'You are an helpful assistant.';
}

export function getDirectivePart(directive: string | undefined): string {
  const text = 'I will provide you with a text wrapped in triple backticks. ';
  return directive && directive !== ''
    ? text +
        `Your task is to write a summary of this text on the subject of ${directive}.`
    : text + 'Your task is to write a summary of this text.';
}

export function getDetailsPart(index: number): string {
  const summaryType = [
    'brief summary: retain only the most critical and major information',
    'concise summary: capture the essential information and significant points, while omitting non-essential details and repetitive content',
    'detailed summary: include all important information, examples, and nuances, avoiding unnecessary repetition'
  ];
  return `Produce a ${summaryType[index]}.`;
}

export function getLanguagePart(language: string): string {
  return `Write the summary in the ${language} language.`;
}

export function getLengthPart(length: number | undefined): string {
  return length && length > 0
    ? `Your summary must be ${length} words long.`
    : '';
}

export function getDisclaimerPart(): string {
  return 'Return only the raw summary with NO explanation and NO wrapping backticks.';
}
