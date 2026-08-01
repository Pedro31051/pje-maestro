import { ProcessRecord, LocalMetadata } from '../core/process-record';
import { rankingEngine } from '../core/ranking-engine';

export interface PJeAdapter {
  name: string;
  canHandle(document: Document): boolean;
  extractRecords(document: Document, localStore: Record<string, LocalMetadata>): ProcessRecord[];
  getContainer(document: Document): HTMLElement | null;
}

export function safeGetText(el: Element | null | undefined): string {
  if (!el) return '';
  const text = (el as HTMLElement).innerText || el.textContent || '';
  return text.trim();
}

export function checkIsConfidential(el: HTMLElement): boolean {
  if (
    el.classList.contains('sigiloso') ||
    el.classList.contains('processo-sigiloso') ||
    el.classList.contains('badge-sigilo') ||
    el.classList.contains('label-sigilo') ||
    el.hasAttribute('data-sigilo') ||
    el.getAttribute('data-sigilo') === 'true' ||
    !!el.querySelector('.fa-lock, .icon-lock, [data-sigilo="true"], .sigiloso, .badge-sigilo')
  ) {
    return true;
  }
  const text = safeGetText(el).toLowerCase();
  return /segredo de ju[sş]ti[çc]a|sigilo|processo sigiloso/i.test(text);
}

function generateDeterministicId(taskName: string, rawText: string, index: number): string {
  const cleanSnippet = rawText.replace(/\s+/g, '').substring(0, 20);
  const cleanTask = taskName.replace(/\s+/g, '').substring(0, 15);
  return `non-cnj-${index}-${cleanTask || 'task'}-${cleanSnippet.length || 0}`;
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
  const rawText = safeGetText(el);
  const id = cnj || generateDeterministicId(taskName, rawText, index);
  const localMeta: LocalMetadata = localStore[id] || localStore[cnj || ''] || {};

  const record: ProcessRecord = {
    id,
    cnj,
    taskName,
    tags,
    legalPriority,
    rawText,
    elementRef: el,
    originalIndex: index,
    currentURL,
    isConfidential: checkIsConfidential(el),
    daysIdle,
    localMeta,
    score: 0
  };

  record.score = rankingEngine(record);
  return record;
}
