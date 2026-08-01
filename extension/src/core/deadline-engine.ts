export interface DeadlineStatus {
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  daysRemaining: number | null;
}

export function evaluateDeadline(deadlineDateStr?: string, referenceDateStr?: string): DeadlineStatus {
  if (!deadlineDateStr) {
    return { isOverdue: false, isToday: false, isTomorrow: false, daysRemaining: null };
  }

  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  now.setHours(0, 0, 0, 0);

  const target = new Date(deadlineDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return {
    isOverdue: daysRemaining < 0,
    isToday: daysRemaining === 0,
    isTomorrow: daysRemaining === 1,
    daysRemaining
  };
}
