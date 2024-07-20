export function getJinaUrls(text: string): string[] {
  const urlRegex = /\[\d+\] URL Source: (https?:\/\/[^\s]+)/g;
  let match: RegExpExecArray;
  const urls: string[] = [];

  while ((match = urlRegex.exec(text)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  return urls;
}

export function getJinaMarkdownContent(input: string): string[] {
  const regex =
    /\[\d+\] Markdown Content:\n([\s\S]*?)(?=\[\d+\] Title|\[\d+\] URL Source|\[\d+\] Description|\[\d+\] Published Time|$)/g;
  const matches = [];
  let match: RegExpExecArray;

  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}
