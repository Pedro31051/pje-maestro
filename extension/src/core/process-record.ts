export interface LocalMetadata {
  localDeadline?: string; // YYYY-MM-DD
  assignee?: string;
  localPriority?: 'baixa' | 'media' | 'alta' | 'urgente';
  tags?: string[];
  notes?: string;
  status?: 'pendente' | 'em_andamento' | 'concluido' | 'oculto';
  pinned?: boolean;
  manualRank?: number;
}

export interface ProcessRecord {
  id: string; // CNJ or generated element ID
  cnj: string | null;
  taskName: string;
  tags: string[];
  legalPriority: boolean;
  rawText: string;
  elementRef?: HTMLElement;
  originalIndex: number;
  currentURL: string;
  isConfidential?: boolean;
  daysIdle?: number;
  localMeta: LocalMetadata;
  score: number;
}

export interface RankingRules {
  pinnedBonus: number;
  overdueBonus: number;
  dueTodayBonus: number;
  dueTomorrowBonus: number;
  legalPriorityBonus: number;
  urgentPriorityBonus: number;
  highPriorityBonus: number;
  completedPenalty: number;
}

export const DEFAULT_RANKING_RULES: RankingRules = {
  pinnedBonus: 10000,
  overdueBonus: 5000,
  dueTodayBonus: 3000,
  dueTomorrowBonus: 1500,
  legalPriorityBonus: 2000,
  urgentPriorityBonus: 2500,
  highPriorityBonus: 1000,
  completedPenalty: -99999
};
