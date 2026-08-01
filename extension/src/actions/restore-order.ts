import { ProcessRecord } from '../core/process-record';
import { logAudit } from '../core/audit-log';

export function executeRestoreOrder(container: HTMLElement, records: ProcessRecord[]): void {
  if (!container || records.length === 0) return;

  const sortedByOriginal = [...records].sort((a, b) => a.originalIndex - b.originalIndex);

  const fragment = document.createDocumentFragment();
  sortedByOriginal.forEach(record => {
    if (record.elementRef) {
      fragment.appendChild(record.elementRef);
    }
  });

  container.appendChild(fragment);
  logAudit('restore_order', undefined, { count: records.length });
}
