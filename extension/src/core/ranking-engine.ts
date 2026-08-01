import { ProcessRecord, RankingRules, DEFAULT_RANKING_RULES } from './process-record';
import { evaluateDeadline } from './deadline-engine';

export function rankingEngine(record: ProcessRecord, rules: RankingRules = DEFAULT_RANKING_RULES): number {
  if (record.localMeta.status === 'oculto') {
    return -999999;
  }
  if (record.localMeta.status === 'concluido') {
    return rules.completedPenalty;
  }

  let score = 0;

  // 1. Pinned
  if (record.localMeta.pinned) {
    score += rules.pinnedBonus;
  }

  // 2. Manual rank override if set
  if (typeof record.localMeta.manualRank === 'number') {
    score += record.localMeta.manualRank * 100;
  }

  // 3. Deadline scoring
  const deadlineStatus = evaluateDeadline(record.localMeta.localDeadline);
  if (deadlineStatus.isOverdue) {
    score += rules.overdueBonus + (Math.abs(deadlineStatus.daysRemaining || 0) * 100);
  } else if (deadlineStatus.isToday) {
    score += rules.dueTodayBonus;
  } else if (deadlineStatus.isTomorrow) {
    score += rules.dueTomorrowBonus;
  }

  // 4. Legal priority
  if (record.legalPriority) {
    score += rules.legalPriorityBonus;
  }

  // 5. Local priority
  switch (record.localMeta.localPriority) {
    case 'urgente':
      score += rules.urgentPriorityBonus;
      break;
    case 'alta':
      score += rules.highPriorityBonus;
      break;
    case 'media':
      score += 500;
      break;
    case 'baixa':
      score += 100;
      break;
  }

  // 6. Idle days bonus
  if (record.daysIdle && record.daysIdle > 0) {
    score += Math.min(record.daysIdle * 10, 1000);
  }

  // Tie-breaker: original index preservation
  score -= record.originalIndex * 0.01;

  return score;
}
