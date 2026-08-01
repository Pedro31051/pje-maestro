import { ProcessRecord } from '../core/process-record';
import { logAudit } from '../core/audit-log';

function neutralizeSpreadsheetFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCSVValue(value: unknown): string {
  const safeValue = neutralizeSpreadsheetFormula(String(value ?? ''));
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function generateCSV(records: ProcessRecord[]): string {
  const headers = ['CNJ', 'Tarefa', 'Score', 'Prazo Local', 'Responsavel', 'Prioridade Legal', 'Prioridade Local', 'Status', 'Etiquetas'];
  
  const rows = records.map(r => {
    return [
      r.isConfidential ? '[PROCESSO SIGILOSO]' : (r.cnj || r.id),
      r.isConfidential ? '[CONTEUDO RESERVADO]' : r.taskName,
      r.score,
      r.localMeta.localDeadline || '',
      r.isConfidential ? '[RESERVADO]' : (r.localMeta.assignee || ''),
      r.legalPriority ? 'SIM' : 'NAO',
      r.localMeta.localPriority || 'normal',
      r.localMeta.status || 'pendente',
      r.isConfidential ? '[SIGILO]' : [...r.tags, ...(r.localMeta.tags || [])].join('; ')
    ].map(escapeCSVValue).join(',');
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
