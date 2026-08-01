import { describe, it, expect } from 'vitest';
import { filterEngine } from '../../src/core/filter-engine';
import { ProcessRecord } from '../../src/core/process-record';

describe('filterEngine', () => {
  const records: ProcessRecord[] = [
    {
      id: '1',
      cnj: '0801234-56.2025.8.14.0028',
      taskName: 'Análise de Liminar',
      tags: ['Urgente'],
      legalPriority: true,
      rawText: 'Análise de Liminar 0801234-56.2025.8.14.0028',
      originalIndex: 0,
      currentURL: 'http://localhost/pje',
      localMeta: { localDeadline: '2020-01-01', status: 'pendente' },
      score: 100
    },
    {
      id: '2',
      cnj: '0805678-12.2025.8.14.0028',
      taskName: 'Cumprimento de Sentença',
      tags: ['Cível'],
      legalPriority: false,
      rawText: 'Cumprimento de Sentença 0805678-12.2025.8.14.0028',
      originalIndex: 1,
      currentURL: 'http://localhost/pje',
      localMeta: { status: 'concluido' },
      score: 10
    }
  ];

  it('filters by CNJ text query', () => {
    const res = filterEngine(records, { query: '0801234' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('1');
  });

  it('filters by overdue deadline', () => {
    const res = filterEngine(records, { deadlineFilter: 'vencidos' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('1');
  });

  it('filters by status', () => {
    const res = filterEngine(records, { statusFilter: 'concluido' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('2');
  });
});
