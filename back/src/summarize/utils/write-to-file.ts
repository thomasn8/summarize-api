import { writeFileSync } from 'fs';

export function writeToFile(path: string, text: string): void {
  writeFileSync(path, text, 'utf8');
}
