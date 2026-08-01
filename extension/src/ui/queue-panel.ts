import { getOrCreateShadowHost } from './shadow-root';
import { ProcessRecord } from '../core/process-record';
import { saveLocalMetadata } from '../storage/local-db';
import { showNoteModal } from './modals';

export interface QueuePanelState {
  query?: string;
  statusFilter?: string;
}

function createSelect(className: string, options: Array<[string, string]>, value: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.className = className;
  options.forEach(([optionValue, label]) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = label;
    select.appendChild(option);
  });
  select.value = value;
  return select;
}

function ensurePanelStructure(drawer: HTMLElement): void {
  if (drawer.querySelector('#queue-cards-list')) return;

  const header = document.createElement('div');
  header.className = 'pje-maestro-drawer-header';
  const title = document.createElement('h3');
  title.id = 'queue-title';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'pje-maestro-btn';
  closeButton.id = 'btn-close-drawer';
  closeButton.textContent = '✖';
  header.append(title, closeButton);

  const body = document.createElement('div');
  body.className = 'pje-maestro-drawer-body';
  const searchWrapper = document.createElement('div');
  const search = document.createElement('input');
  search.type = 'text';
  search.id = 'queue-search';
  search.className = 'pje-maestro-input';
  search.placeholder = 'Buscar por CNJ, Tarefa ou Nota...';
  searchWrapper.appendChild(search);

  const statusWrapper = document.createElement('div');
  const status = createSelect('pje-maestro-select', [
    ['all', 'Todos os Status'],
    ['pendente', 'Pendentes'],
    ['em_andamento', 'Em Andamento'],
    ['concluido', 'Concluídos'],
    ['oculto', 'Ocultos']
  ], 'all');
  status.id = 'queue-status-filter';
  statusWrapper.appendChild(status);

  const cards = document.createElement('div');
  cards.id = 'queue-cards-list';
  cards.className = 'pje-maestro-cards-list';
  body.append(searchWrapper, statusWrapper, cards);
  drawer.append(header, body);
}

function createRecordCard(record: ProcessRecord, onRefresh: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'pje-maestro-process-card';
  card.dataset.id = record.id;
  const header = document.createElement('div');
  header.className = 'card-header';
  const identifier = document.createElement('span');
  identifier.className = 'cnj-text';
  identifier.textContent = record.isConfidential ? '[PROCESSO SIGILOSO]' : (record.cnj || record.id);
  const score = document.createElement('span');
  score.className = 'score-text';
  score.textContent = `Score: ${Math.round(record.score)}`;
  header.append(identifier, score);

  const task = document.createElement('div');
  task.className = 'task-name';
  task.textContent = record.isConfidential ? '[CONTEÚDO RESERVADO]' : record.taskName;
  const controls = document.createElement('div');
  controls.className = 'card-controls';
  const deadline = document.createElement('input');
  deadline.type = 'date';
  deadline.value = record.localMeta.localDeadline || '';
  deadline.className = 'pje-maestro-input input-deadline';
  const priority = createSelect('pje-maestro-select select-priority', [
    ['baixa', 'Baixa'], ['media', 'Média'], ['alta', 'Alta'], ['urgente', 'Urgente']
  ], record.localMeta.localPriority || 'media');
  const status = createSelect('pje-maestro-select select-status', [
    ['pendente', 'Pendente'], ['em_andamento', 'Em andamento'], ['concluido', 'Concluído'], ['oculto', 'Oculto']
  ], record.localMeta.status || 'pendente');
  const noteButton = document.createElement('button');
  noteButton.type = 'button';
  noteButton.className = 'pje-maestro-btn btn-note';
  noteButton.textContent = '📝 Nota';

  deadline.addEventListener('change', async () => {
    await saveLocalMetadata(record.id, { localDeadline: deadline.value });
    onRefresh();
  });
  priority.addEventListener('change', async () => {
    await saveLocalMetadata(record.id, { localPriority: priority.value as ProcessRecord['localMeta']['localPriority'] });
    onRefresh();
  });
  status.addEventListener('change', async () => {
    await saveLocalMetadata(record.id, { status: status.value as ProcessRecord['localMeta']['status'] });
    onRefresh();
  });
  noteButton.addEventListener('click', () => {
    showNoteModal(record.cnj || record.id, record.localMeta.notes || '', async newNote => {
      await saveLocalMetadata(record.id, { notes: newNote });
      onRefresh();
    });
  });
  controls.append(deadline, priority, status, noteButton);
  card.append(header, task, controls);
  return card;
}

export function renderQueuePanel(
  records: ProcessRecord[],
  state: QueuePanelState,
  onFilterChange: (query: string, statusFilter: string) => void,
  onRefresh: () => void
): { drawer: HTMLElement; toggle: () => void } {
  const { shadow } = getOrCreateShadowHost();
  let drawer = shadow.querySelector<HTMLElement>('.pje-maestro-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'pje-maestro-drawer';
    shadow.appendChild(drawer);
  }
  ensurePanelStructure(drawer);

  const toggle = () => drawer?.classList.toggle('open');
  const title = drawer.querySelector<HTMLElement>('#queue-title');
  const searchInput = drawer.querySelector<HTMLInputElement>('#queue-search');
  const statusSelect = drawer.querySelector<HTMLSelectElement>('#queue-status-filter');
  const cardsContainer = drawer.querySelector<HTMLElement>('#queue-cards-list');
  if (title) title.textContent = `📌 Fila Inteligente (${records.length})`;
  if (searchInput && searchInput.value !== (state.query || '')) searchInput.value = state.query || '';
  if (statusSelect) statusSelect.value = state.statusFilter || 'all';

  drawer.querySelector<HTMLButtonElement>('#btn-close-drawer')!.onclick = toggle;
  if (searchInput) searchInput.oninput = () => onFilterChange(searchInput.value, statusSelect?.value || 'all');
  if (statusSelect) statusSelect.onchange = () => onFilterChange(searchInput?.value || '', statusSelect.value);
  if (cardsContainer) cardsContainer.replaceChildren(...records.map(record => createRecordCard(record, onRefresh)));
  return { drawer, toggle };
}
