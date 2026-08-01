import { describe, it, expect } from 'vitest';
import { rankingEngine } from '../../src/core/ranking-engine';
import { ProcessRecord, DEFAULT_RANKING_RULES } from '../../src/core/process-record';

describe('rankingEngine', () => {
  const baseRecord: ProcessRecord = {
    id: 'test-1',
    cnj: '0801234-56.2025.8.14.0028',
    taskName: 'Minuta de Despacho',
    tags: [],
    legalPriority: false,
    rawText: 'Processo Teste',
    originalIndex: 0,
    currentURL: 'http://localhost/pje',
    localMeta: {},
    score: 0
  };

  it('assigns higher score to pinned records', () => {
    const normalScore = rankingEngine({ ...baseRecord });
    const pinnedScore = rankingEngine({ ...baseRecord, localMeta: { pinned: true } });
    expect(pinnedScore).toBeGreaterThan(normalScore + 9000);
  });

  it('assigns higher score to overdue deadlines', () => {
    const normalScore = rankingEngine({ ...baseRecord });
    const overdueScore = rankingEngine({ ...baseRecord, localMeta: { localDeadline: '2020-01-01' } });
    expect(overdueScore).toBeGreaterThan(normalScore);
  });

  it('penalizes completed processes', () => {
    const score = rankingEngine({ ...baseRecord, localMeta: { status: 'concluido' } });
    expect(score).toBeLessThan(0);
  });

  it('removes hidden processes with very negative score', () => {
    const score = rankingEngine({ ...baseRecord, localMeta: { status: 'oculto' } });
    expect(score).toBe(-999999);
  });
});
