const CNJ_REGEX = /\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/;
const CNJ_RAW_REGEX = /\b(\d{20})\b/;

export function extractCNJ(text: string): string | null {
  if (!text) return null;
  const match = text.match(CNJ_REGEX);
  if (match) return match[1];

  const rawMatch = text.match(CNJ_RAW_REGEX);
  if (rawMatch) {
    return formatCNJ(rawMatch[1]);
  }
  return null;
}

export function formatCNJ(digits: string): string {
  if (digits.length !== 20) return digits;
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`;
}

export function isValidCNJ(cnj: string): boolean {
  return CNJ_REGEX.test(cnj);
}
