import { describe, it, expect } from 'vitest';
import { extractCNJ, isValidCNJ } from '../../src/core/parser-cnj';

describe('parserCNJ', () => {
  it('extracts formatted CNJ number', () => {
    const text = 'Processo nº 0801234-56.2025.8.14.0028 em andamento';
    const res = extractCNJ(text);
    expect(res).toBe('0801234-56.2025.8.14.0028');
    expect(isValidCNJ(res!)).toBe(true);
  });

  it('extracts unformatted 20-digit CNJ number', () => {
    const text = 'Processo 08012345620258140028';
    const res = extractCNJ(text);
    expect(res).toBe('0801234-56.2025.8.14.0028');
  });

  it('returns null if no CNJ is found', () => {
    const text = 'Texto sem numero processual valido';
    expect(extractCNJ(text)).toBeNull();
  });
});
