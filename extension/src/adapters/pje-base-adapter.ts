import { ProcessRecord, LocalMetadata } from '../core/process-record';
import { rankingEngine } from '../core/ranking-engine';

export interface PJeAdapter {
  name: string;
  canHandle(document: Document): boolean;
  extractRecords(document: Document, localStore: Record<string, LocalMetadata>): ProcessRecord[];
  getContainer(document: Document): HTMLElement | null;
}

export function buildRecordFromElement(
  el: HTMLElement,
  index: number,
  cnj: string | null,
  taskName: string,
  tags: string[],
  legalPriority: boolean,
  localStore: Record<string, LocalMetadata>,
  currentURL: string,
  daysIdle?: number
): ProcessRecord {
  const id = cnj || `elem-${index}-${Math.random().toString(36).substring(2, 7)}`;
  const localMeta: LocalMetadata = localStore[id] || localStore[cnj || ''] || {};

  const record: ProcessRecord = {
    id,
    cnj,
    taskName,
    tags,
    legalPriority,
    rawText: el.innerText || '',
    elementRef: el,
    originalIndex: index,
    currentURL,
    isConfidential: el.classList.contains('sigiloso') || el.innerText.toLowerCase().includes('segredo de justiça'),
    daysIdle,
    localMeta,
    score: 0
  };

  record.score = rankingEngine(record);
  return record;
}
