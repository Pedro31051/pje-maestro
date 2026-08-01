import { ProcessRecord } from '../core/process-record';
import { evaluateDeadline } from '../core/deadline-engine';

export function injectRowBadges(records: ProcessRecord[]): void {
  records.forEach(r => {
    if (!r.elementRef) return;

    // Clear old badges
    r.elementRef.querySelectorAll('.pje-maestro-badge').forEach(b => b.remove());

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
