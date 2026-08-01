import { PJeAdapter, buildRecordFromElement } from './pje-base-adapter';
import { ProcessRecord, LocalMetadata } from '../core/process-record';
import { extractCNJ } from '../core/parser-cnj';

export class PJeTarefasAdapter implements PJeAdapter {
  name = 'pje-tarefas';

  canHandle(doc: Document): boolean {
    return !!(
      doc.querySelector('.tabela-tarefas') ||
      doc.querySelector('.lista-cards-tarefa') ||
      doc.querySelector('#painel-tarefas') ||
      doc.querySelector('table[id*="tarefa"]') ||
      doc.querySelector('[data-pje-type="tarefas"]')
    );
  }

  getContainer(doc: Document): HTMLElement | null {
    const tbody = doc.querySelector('.tabela-tarefas tbody') || doc.querySelector('#painel-tarefas tbody');
    if (tbody) return tbody as HTMLElement;

    const cardsContainer = doc.querySelector('.lista-cards-tarefa') || doc.querySelector('[data-pje-type="tarefas"]');
    if (cardsContainer) return cardsContainer as HTMLElement;

    const generalTable = doc.querySelector('table tbody');
    if (generalTable) return generalTable as HTMLElement;

    return null;
  }

  extractRecords(doc: Document, localStore: Record<string, LocalMetadata>): ProcessRecord[] {
    const records: ProcessRecord[] = [];
    const container = this.getContainer(doc);
    if (!container) return records;

    // Table rows
    const rows = Array.from(container.querySelectorAll<HTMLElement>('tr.linha-processo, tr[data-cnj], tbody tr'));
    if (rows.length > 0) {
      rows.forEach((row, idx) => {
        const text = row.innerText || '';
        const cnjAttr = row.getAttribute('data-cnj');
        const cnj = cnjAttr ? extractCNJ(cnjAttr) : extractCNJ(text);

        const taskEl = row.querySelector('.nome-tarefa, .coluna-tarefa, td:nth-child(2)');
        const taskName = taskEl ? (taskEl as HTMLElement).innerText.trim() : 'Minhas Tarefas';

        const isPriority = text.toLowerCase().includes('prioridade') || !!row.querySelector('.badge-prioridade, .priority-icon');

        // Extract tags
        const tagEls = Array.from(row.querySelectorAll('.badge-etiqueta, .tag-item'));
        const tags = tagEls.map(t => (t as HTMLElement).innerText.trim()).filter(Boolean);

        // Days idle check
        const idleMatch = text.match(/(\d+)\s*dias?/i);
        const daysIdle = idleMatch ? parseInt(idleMatch[1], 10) : undefined;

        records.push(
          buildRecordFromElement(
            row,
            idx,
            cnj,
            taskName,
            tags,
            isPriority,
            localStore,
            doc.location ? doc.location.href : '',
            daysIdle
          )
        );
      });
      return records;
    }

    // Cards layout
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.card-processo, .card-item'));
    cards.forEach((card, idx) => {
      const text = card.innerText || '';
      const cnjAttr = card.getAttribute('data-cnj');
      const cnj = cnjAttr ? extractCNJ(cnjAttr) : extractCNJ(text);

      const taskEl = card.querySelector('.card-tarefa-titulo, .header-tarefa');
      const taskName = taskEl ? (taskEl as HTMLElement).innerText.trim() : 'Tarefa em Card';

      const isPriority = text.toLowerCase().includes('prioridade') || !!card.querySelector('.badge-prioridade');
      const tagEls = Array.from(card.querySelectorAll('.badge-etiqueta, .tag'));
      const tags = tagEls.map(t => (t as HTMLElement).innerText.trim()).filter(Boolean);

      records.push(
        buildRecordFromElement(
          card,
          idx,
          cnj,
          taskName,
          tags,
          isPriority,
          localStore,
          doc.location ? doc.location.href : ''
        )
      );
    });

    return records;
  }
}
