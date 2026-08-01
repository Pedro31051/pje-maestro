import { ProcessRecord } from '../core/process-record';
import { logAudit } from '../core/audit-log';

export function generateCSV(records: ProcessRecord[]): string {
  const headers = ['CNJ', 'Tarefa', 'Score', 'Prazo Local', 'Responsavel', 'Prioridade Legal', 'Prioridade Local', 'Status', 'Etiquetas'];
  
  const rows = records.map(r => {
    const cnj = r.isConfidential ? '[PROCESSO SIGILOSO]' : (r.cnj || r.id);
    const task = r.isConfidential ? '"[CONTEUDO RESERVADO]"' : `"${(r.taskName || '').replace(/"/g, '""')}"`;
    const score = r.score;
    const deadline = r.localMeta.localDeadline || '';
    const assignee = r.isConfidential ? '"[RESERVADO]"' : `"${(r.localMeta.assignee || '').replace(/"/g, '""')}"`;
    const legalPriority = r.legalPriority ? 'SIM' : 'NAO';
    const localPriority = r.localMeta.localPriority || 'normal';
    const status = r.localMeta.status || 'pendente';
    const tags = r.isConfidential ? '"[SIGILO]"' : `"${([...r.tags, ...(r.localMeta.tags || [])]).join('; ')}"`;

    return [cnj, task, score, deadline, assignee, legalPriority, localPriority, status, tags].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logAudit('export_csv', undefined, { filename });
}
