import { describe, it, expect } from 'vitest';
import { generateCSV } from '../../src/actions/export-csv';
import { ProcessRecord } from '../../src/core/process-record';

describe('exportCSV', () => {
  it('generates well-formed CSV with headers and rows', () => {
    const records: ProcessRecord[] = [
      {
        id: '1',
        cnj: '0801234-56.2025.8.14.0028',
        taskName: 'Despacho Liminar',
        tags: ['Urgente'],
        legalPriority: true,
        rawText: 'Despacho',
        originalIndex: 0,
        currentURL: 'http://localhost',
        localMeta: { localDeadline: '2026-08-01', localPriority: 'urgente' },
        score: 5000
      }
    ];

    const csv = generateCSV(records);
    expect(csv).toContain('CNJ,Tarefa,Score');
    expect(csv).toContain('0801234-56.2025.8.14.0028');
    expect(csv).toContain('"Despacho Liminar"');
    expect(csv).toContain('SIM');
  });
});
