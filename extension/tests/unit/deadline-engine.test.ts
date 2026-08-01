import { describe, it, expect } from 'vitest';
import { evaluateDeadline } from '../../src/core/deadline-engine';

describe('deadlineEngine', () => {
  it('correctly detects overdue deadline', () => {
    const res = evaluateDeadline('2026-01-01', '2026-08-01');
    expect(res.isOverdue).toBe(true);
    expect(res.isToday).toBe(false);
  });

  it('correctly detects today deadline', () => {
    const res = evaluateDeadline('2026-08-01', '2026-08-01');
    expect(res.isOverdue).toBe(false);
    expect(res.isToday).toBe(true);
  });

  it('correctly detects tomorrow deadline', () => {
    const res = evaluateDeadline('2026-08-02', '2026-08-01');
    expect(res.isTomorrow).toBe(true);
  });

  it('treats date-only values as calendar dates without a UTC shift', () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = 'America/Sao_Paulo';
    try {
      expect(evaluateDeadline('2026-08-01', '2026-08-01')).toEqual({
        isOverdue: false,
        isToday: true,
        isTomorrow: false,
        daysRemaining: 0
      });
    } finally {
      process.env.TZ = previousTimezone;
    }
  });

  it('returns an empty status for invalid calendar dates', () => {
    expect(evaluateDeadline('2026-02-31', '2026-02-01').daysRemaining).toBeNull();
  });
});
