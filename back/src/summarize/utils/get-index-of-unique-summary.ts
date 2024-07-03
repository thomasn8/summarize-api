import { UrlParsed } from '../types/summarize.types';

export function getIndexOfUniqueSummary(urls: UrlParsed[]): number | undefined {
  if (urls.length === 1) return 0;

  let i = 0;
  let last = 0;
  let count = 0;
  while (i < urls.length) {
    if (urls[i].summary !== undefined) {
      last = i;
      count++;
    }
    if (count > 1) break;
    i++;
  }
  if (count === 1) return last;
  if (count === 0) return -1;
  return undefined; // means more than one summary
}
