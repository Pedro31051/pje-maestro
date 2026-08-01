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
});
