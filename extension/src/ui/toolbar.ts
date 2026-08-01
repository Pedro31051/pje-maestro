import { getOrCreateShadowHost } from './shadow-root';

export interface ToolbarCallbacks {
  onFilterVencidos: () => void;
  onReorder: () => void;
  onRestore: () => void;
  onOpenNext: () => void;
  onToggleDrawer: () => void;
  onExportCSV: () => void;
}

export function renderToolbar(callbacks: ToolbarCallbacks): HTMLElement {
  const { shadow } = getOrCreateShadowHost();

  let toolbar = shadow.querySelector<HTMLElement>('.pje-maestro-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'pje-maestro-toolbar';
    shadow.appendChild(toolbar);
  }

  toolbar.innerHTML = `
    <div class="pje-maestro-brand">
      <span>⚖️ PJe Maestro</span>
      <span class="badge-tag">MVP v0.1</span>
    </div>
    <div class="pje-maestro-controls">
      <button class="pje-maestro-btn btn-primary" id="btn-reorder">⚡ Reordenar Fila</button>
      <button class="pje-maestro-btn" id="btn-vencidos">🔥 Vencidos</button>
      <button class="pje-maestro-btn btn-accent" id="btn-next">⏭️ Próximo</button>
      <button class="pje-maestro-btn" id="btn-restore">🔄 Restaurar Ordem</button>
      <button class="pje-maestro-btn" id="btn-csv">📥 Exportar CSV</button>
      <button class="pje-maestro-btn" id="btn-drawer">📋 Painel Fila</button>
    </div>
  `;

  toolbar.querySelector('#btn-reorder')?.addEventListener('click', callbacks.onReorder);
  toolbar.querySelector('#btn-vencidos')?.addEventListener('click', callbacks.onFilterVencidos);
  toolbar.querySelector('#btn-next')?.addEventListener('click', callbacks.onOpenNext);
  toolbar.querySelector('#btn-restore')?.addEventListener('click', callbacks.onRestore);
  toolbar.querySelector('#btn-csv')?.addEventListener('click', callbacks.onExportCSV);
  toolbar.querySelector('#btn-drawer')?.addEventListener('click', callbacks.onToggleDrawer);

  return toolbar;
}
