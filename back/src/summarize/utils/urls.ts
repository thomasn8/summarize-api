export function isInvalidUrl(text: string): boolean {
  try {
    new URL(text);
    return false;
  } catch (e) {
    return true;
  }
}
