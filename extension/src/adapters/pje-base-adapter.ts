import { ProcessRecord, LocalMetadata } from '../core/process-record';
import { rankingEngine } from '../core/ranking-engine';

export interface PJeAdapter {
  name: string;
  canHandle(document: Document): boolean;
  extractRecords(document: Document, localStore: Record<string, LocalMetadata>): ProcessRecord[];
  getContainer(document: Document): HTMLElement | null;
}

let nextOriginalIndex = 0;

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
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

function resolveStableRecordId(
  el: HTMLElement,
  index: number,
  cnj: string | null,
  taskName: string,
  currentURL: string
): string {
  if (el.dataset.pjeMaestroRecordId) return el.dataset.pjeMaestroRecordId;
  const explicitPageIdentity =
    el.getAttribute('data-id') || el.id || el.querySelector<HTMLAnchorElement>('a[href]')?.getAttribute('href');
  const pageIdentity = explicitPageIdentity || `${safeGetText(el) || taskName}|position:${index}`;
  const fingerprint = stableHash(`${currentURL}|${taskName}|${pageIdentity}`);
  const id = cnj ? `${cnj}::${fingerprint}` : `record::${fingerprint}`;
  el.dataset.pjeMaestroRecordId = id;
  return id;
}

function resolveOriginalIndex(el: HTMLElement, fallbackIndex: number): number {
  const storedIndex = Number(el.dataset.pjeMaestroOriginalIndex);
  if (Number.isInteger(storedIndex) && storedIndex >= 0) {
    nextOriginalIndex = Math.max(nextOriginalIndex, storedIndex + 1);
    return storedIndex;
  }
  const originalIndex = Math.max(fallbackIndex, nextOriginalIndex);
  nextOriginalIndex = originalIndex + 1;
  el.dataset.pjeMaestroOriginalIndex = String(originalIndex);
  return originalIndex;
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
  const id = resolveStableRecordId(el, index, cnj, taskName, currentURL);
  const localMeta: LocalMetadata = localStore[id] || localStore[cnj || ''] || {};

  const record: ProcessRecord = {
    id,
    cnj,
    taskName,
    tags,
    legalPriority,
    rawText,
    elementRef: el,
    originalIndex: resolveOriginalIndex(el, index),
    currentURL,
    isConfidential: checkIsConfidential(el),
    daysIdle,
    localMeta,
    score: 0
  };

  record.score = rankingEngine(record);
  return record;
}
