import { ProcessRecord } from '../core/process-record';
import { logAudit } from '../core/audit-log';

export function executeVisualReorder(container: HTMLElement, records: ProcessRecord[]): void {
  if (!container || records.length === 0) return;

  // Sort descending by score
  const sorted = [...records].sort((a, b) => b.score - a.score);

  const fragment = document.createDocumentFragment();
  sorted.forEach(record => {
    if (record.elementRef) {
      fragment.appendChild(record.elementRef);
    }
  });

  container.appendChild(fragment);
  logAudit('visual_reorder', undefined, { count: records.length });
}
