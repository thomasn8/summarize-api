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
