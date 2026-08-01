import { ProcessRecord } from './process-record';
import { evaluateDeadline } from './deadline-engine';

export interface FilterCriteria {
  query?: string;
  deadlineFilter?: 'all' | 'vencidos' | 'hoje' | 'amanha';
  statusFilter?: 'all' | 'pendente' | 'em_andamento' | 'concluido' | 'oculto';
  assigneeFilter?: string;
  priorityFilter?: 'all' | 'legal' | 'urgente' | 'alta' | 'media' | 'baixa';
  tagFilter?: string;
  taskFilter?: string;
}

export function filterEngine(records: ProcessRecord[], filter: FilterCriteria): ProcessRecord[] {
  return records.filter(record => {
    // Query search (CNJ, task, raw text, notes)
    if (filter.query && filter.query.trim() !== '') {
      const q = filter.query.toLowerCase().trim();
      const matchCNJ = record.cnj ? record.cnj.toLowerCase().includes(q) : false;
      const matchTask = record.taskName ? record.taskName.toLowerCase().includes(q) : false;
      const matchRaw = record.rawText ? record.rawText.toLowerCase().includes(q) : false;
      const matchNotes = record.localMeta.notes ? record.localMeta.notes.toLowerCase().includes(q) : false;
      if (!matchCNJ && !matchTask && !matchRaw && !matchNotes) {
        return false;
      }
    }

    // Deadline filter
    if (filter.deadlineFilter && filter.deadlineFilter !== 'all') {
      const status = evaluateDeadline(record.localMeta.localDeadline);
      if (filter.deadlineFilter === 'vencidos' && !status.isOverdue) return false;
      if (filter.deadlineFilter === 'hoje' && !status.isToday) return false;
      if (filter.deadlineFilter === 'amanha' && !status.isTomorrow) return false;
    }

    // Status filter
    if (filter.statusFilter && filter.statusFilter !== 'all') {
      const currentStatus = record.localMeta.status || 'pendente';
      if (currentStatus !== filter.statusFilter) return false;
    } else {
      // By default, hide 'oculto' unless explicitly selected
      if (record.localMeta.status === 'oculto' && filter.statusFilter !== 'oculto') {
        return false;
      }
    }

    // Assignee filter
    if (filter.assigneeFilter && filter.assigneeFilter !== 'all') {
      if (filter.assigneeFilter === 'unassigned') {
        if (record.localMeta.assignee) return false;
      } else if (record.localMeta.assignee !== filter.assigneeFilter) {
        return false;
      }
    }

    // Priority filter
    if (filter.priorityFilter && filter.priorityFilter !== 'all') {
      if (filter.priorityFilter === 'legal' && !record.legalPriority) return false;
      if (filter.priorityFilter !== 'legal' && record.localMeta.localPriority !== filter.priorityFilter) return false;
    }

    // Tag filter
    if (filter.tagFilter && filter.tagFilter !== 'all') {
      const allTags = [...record.tags, ...(record.localMeta.tags || [])];
      if (!allTags.includes(filter.tagFilter)) return false;
    }

    // Task filter
    if (filter.taskFilter && filter.taskFilter !== 'all') {
      if (record.taskName !== filter.taskFilter) return false;
    }

    return true;
  });
}
