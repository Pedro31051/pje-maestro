export interface DeadlineStatus {
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  daysRemaining: number | null;
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function parseCalendarDate(value: string): CalendarDate | null {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const validationDate = new Date(Date.UTC(year, month - 1, day));
    if (
      validationDate.getUTCFullYear() !== year ||
      validationDate.getUTCMonth() !== month - 1 ||
      validationDate.getUTCDate() !== day
    ) return null;
    return { year, month, day };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return { year: parsed.getFullYear(), month: parsed.getMonth() + 1, day: parsed.getDate() };
}

function toEpochDay(date: CalendarDate): number {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
}

export function evaluateDeadline(deadlineDateStr?: string, referenceDateStr?: string): DeadlineStatus {
  if (!deadlineDateStr) {
    return { isOverdue: false, isToday: false, isTomorrow: false, daysRemaining: null };
  }

  const currentDate = referenceDateStr
    ? parseCalendarDate(referenceDateStr)
    : (() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
      })();
  const targetDate = parseCalendarDate(deadlineDateStr);
  if (!currentDate || !targetDate) {
    return { isOverdue: false, isToday: false, isTomorrow: false, daysRemaining: null };
  }
  const daysRemaining = toEpochDay(targetDate) - toEpochDay(currentDate);

  return {
    isOverdue: daysRemaining < 0,
    isToday: daysRemaining === 0,
    isTomorrow: daysRemaining === 1,
    daysRemaining
  };
}
