import { getOrCreateShadowHost } from './shadow-root';
import { ProcessRecord } from '../core/process-record';
import { saveLocalMetadata } from '../storage/local-db';
import { showNoteModal } from './modals';

export function renderQueuePanel(
  records: ProcessRecord[],
  onFilterChange: (query: string, statusFilter: string) => void,
  onRefresh: () => void,
  currentStatusFilter: string = 'all',
  currentQuery: string = ''
): { drawer: HTMLElement; toggle: () => void } {
  const { shadow } = getOrCreateShadowHost();

  let drawer = shadow.querySelector<HTMLElement>('.pje-maestro-drawer');
  const wasOpen = drawer?.classList.contains('open');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'pje-maestro-drawer';
    shadow.appendChild(drawer);
  }
  if (wasOpen) {
    drawer.classList.add('open');
  }

  const toggle = () => {
    drawer?.classList.toggle('open');
  };

  const oldSearchVal = drawer.querySelector<HTMLInputElement>('#queue-search')?.value || currentQuery;
  const oldStatusVal = drawer.querySelector<HTMLSelectElement>('#queue-status-filter')?.value || currentStatusFilter;

  drawer.innerHTML = `
    <div class="pje-maestro-drawer-header">
      <h3>📌 Fila Inteligente (${records.length})</h3>
      <button class="pje-maestro-btn" id="btn-close-drawer">✖</button>
    </div>
    <div class="pje-maestro-drawer-body">
      <div>
        <input type="text" id="queue-search" class="pje-maestro-input" value="${oldSearchVal}" placeholder="Buscar por CNJ, Tarefa ou Nota..." />
      </div>
      <div>
        <select id="queue-status-filter" class="pje-maestro-select">
          <option value="all" ${oldStatusVal === 'all' ? 'selected' : ''}>Todos os Status</option>
          <option value="pendente" ${oldStatusVal === 'pendente' ? 'selected' : ''}>Pendentes</option>
          <option value="em_andamento" ${oldStatusVal === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
          <option value="concluido" ${oldStatusVal === 'concluido' ? 'selected' : ''}>Concluídos</option>
        </select>
      </div>
      <div id="queue-cards-list" style="display:flex; flex-direction:column; gap:10px;">
      </div>
    </div>
  `;

  drawer.querySelector('#btn-close-drawer')?.addEventListener('click', toggle);

  const searchInput = drawer.querySelector<HTMLInputElement>('#queue-search');
  const statusSelect = drawer.querySelector<HTMLSelectElement>('#queue-status-filter');

  const triggerChange = () => {
    onFilterChange(searchInput?.value || '', statusSelect?.value || 'all');
  };

  searchInput?.addEventListener('input', triggerChange);
  statusSelect?.addEventListener('change', triggerChange);

  const cardsContainer = drawer.querySelector('#queue-cards-list');
  if (cardsContainer) {
    cardsContainer.innerHTML = records.map(r => `
      <div class="pje-maestro-process-card" data-id="${r.id}">
        <div class="card-header">
          <span class="cnj-text">${r.cnj || r.id}</span>
          <span style="font-size:11px; background:#334155; padding:2px 6px; border-radius:4px;">Score: ${Math.round(r.score)}</span>
        </div>
        <div style="font-size:12px; color:#cbd5e1;">${r.taskName}</div>
        <div style="display:flex; gap:6px; margin-top:4px; align-items:center;">
          <input type="date" value="${r.localMeta.localDeadline || ''}" class="pje-maestro-input input-deadline" style="padding:4px; font-size:11px;" />
          <select class="pje-maestro-select select-priority" style="padding:4px; font-size:11px;">
            <option value="baixa" ${r.localMeta.localPriority === 'baixa' ? 'selected' : ''}>Baixa</option>
            <option value="media" ${r.localMeta.localPriority === 'media' || !r.localMeta.localPriority ? 'selected' : ''}>Média</option>
            <option value="alta" ${r.localMeta.localPriority === 'alta' ? 'selected' : ''}>Alta</option>
            <option value="urgente" ${r.localMeta.localPriority === 'urgente' ? 'selected' : ''}>Urgente</option>
          </select>
          <button class="pje-maestro-btn btn-note" style="padding:4px 8px; font-size:11px;">📝 Nota</button>
        </div>
      </div>
    `).join('');

    // Attach listeners for metadata changes
    cardsContainer.querySelectorAll('.pje-maestro-process-card').forEach(cardEl => {
      const id = cardEl.getAttribute('data-id');
      if (!id) return;

      const record = records.find(rec => rec.id === id);

      const deadlineInput = cardEl.querySelector<HTMLInputElement>('.input-deadline');
      const prioritySelect = cardEl.querySelector<HTMLSelectElement>('.select-priority');
      const noteBtn = cardEl.querySelector<HTMLButtonElement>('.btn-note');

      deadlineInput?.addEventListener('change', async () => {
        await saveLocalMetadata(id, { localDeadline: deadlineInput.value });
        onRefresh();
      });

      prioritySelect?.addEventListener('change', async () => {
        await saveLocalMetadata(id, { localPriority: prioritySelect.value as any });
        onRefresh();
      });

      noteBtn?.addEventListener('click', () => {
        const cnjOrId = record?.cnj || id;
        const initialNote = record?.localMeta.notes || '';
        showNoteModal(cnjOrId, initialNote, async (newNote) => {
          await saveLocalMetadata(id, { notes: newNote });
          onRefresh();
        });
      });
    });
  }

  return { drawer, toggle };
}
