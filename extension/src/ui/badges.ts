import { ProcessRecord } from '../core/process-record';
import { evaluateDeadline } from '../core/deadline-engine';

export function injectRowBadges(records: ProcessRecord[]): void {
  if (typeof document !== 'undefined' && document.head && !document.getElementById('pje-maestro-badge-styles')) {
    const style = document.createElement('style');
    style.id = 'pje-maestro-badge-styles';
    style.textContent = `
      .pje-maestro-badge-container { display: inline-flex; gap: 4px; margin-left: 6px; vertical-align: middle; }
      .pje-maestro-badge { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; line-height: 1.2; display: inline-block; }
      .pje-maestro-badge.badge-score { background-color: #3b82f6; }
      .pje-maestro-badge.badge-overdue { background-color: #ef4444; }
      .pje-maestro-badge.badge-today { background-color: #f59e0b; }
    `;
    document.head.appendChild(style);
  }

  records.forEach(r => {
    if (!r.elementRef) return;

    // Clear old badges
    r.elementRef.querySelectorAll('.pje-maestro-badge-container').forEach(b => b.remove());

    const badgeContainer = document.createElement('span');
    badgeContainer.className = 'pje-maestro-badge-container';

    // Score badge
    const scoreBadge = document.createElement('span');
    scoreBadge.className = 'pje-maestro-badge badge-score';
    scoreBadge.textContent = `PJe Maestro: ${Math.round(r.score)}`;
    badgeContainer.appendChild(scoreBadge);

    // Deadline badge if set
    if (r.localMeta.localDeadline) {
      const deadline = evaluateDeadline(r.localMeta.localDeadline);
      const dlBadge = document.createElement('span');
      if (deadline.isOverdue) {
        dlBadge.className = 'pje-maestro-badge badge-overdue';
        dlBadge.textContent = `VENCIDO (${Math.abs(deadline.daysRemaining || 0)}d)`;
      } else if (deadline.isToday) {
        dlBadge.className = 'pje-maestro-badge badge-today';
        dlBadge.textContent = 'VENCE HOJE';
      }
      if (dlBadge.textContent) {
        badgeContainer.appendChild(dlBadge);
      }
    }

    // Append to target element
    const targetCol = r.elementRef.querySelector('td:first-child, .card-header') || r.elementRef;
    targetCol.appendChild(badgeContainer);
  });
}

export function applyRecordVisibility(allRecords: ProcessRecord[], visibleRecords: ProcessRecord[]): void {
  const visibleElements = new Set(visibleRecords.map(record => record.elementRef).filter(Boolean));
  allRecords.forEach(record => {
    if (record.elementRef) record.elementRef.hidden = !visibleElements.has(record.elementRef);
  });
}
