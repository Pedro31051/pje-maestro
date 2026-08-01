import { ProcessRecord } from '../core/process-record';
import { logAudit } from '../core/audit-log';

export function executeOpenNext(records: ProcessRecord[]): ProcessRecord | null {
  const pendingRecords = records.filter(r => r.localMeta.status !== 'concluido' && r.localMeta.status !== 'oculto');
  if (pendingRecords.length === 0) return null;

  const sorted = [...pendingRecords].sort((a, b) => b.score - a.score);
  const nextRecord = sorted[0];

  if (nextRecord && nextRecord.elementRef) {
    // Remove previous highlights
    document.querySelectorAll('.pje-maestro-highlight').forEach(el => el.classList.remove('pje-maestro-highlight'));

    nextRecord.elementRef.classList.add('pje-maestro-highlight');
    nextRecord.elementRef.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Try finding link inside element
    const link = nextRecord.elementRef.querySelector<HTMLAnchorElement>('a[href], button');
    if (link) {
      link.focus();
    }

    logAudit('open_next', nextRecord.cnj || nextRecord.id);
    return nextRecord;
  }

  return null;
}
