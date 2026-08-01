import { getOrCreateShadowHost } from './shadow-root';

export function showNoteModal(cnj: string, initialNote: string, onSave: (note: string) => void): void {
  const { shadow } = getOrCreateShadowHost();

  let modal = shadow.querySelector<HTMLElement>('.pje-maestro-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.className = 'pje-maestro-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
    z-index: 100001; font-family: sans-serif;
  `;

  modal.innerHTML = `
    <div style="background:#1e293b; color:#fff; width:450px; padding:20px; border-radius:12px; border:1px solid #334155; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
      <h3 style="margin-top:0;">📝 Nota Local - ${cnj}</h3>
      <textarea id="modal-note-text" style="width:100%; height:120px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:8px; padding:8px; box-sizing:border-box; font-family:sans-serif;">${initialNote}</textarea>
      <div style="display:flex; justify:flex-end; gap:10px; margin-top:16px;">
        <button id="modal-cancel" class="pje-maestro-btn" style="background:#475569;">Cancelar</button>
        <button id="modal-save" class="pje-maestro-btn btn-primary">Salvar Nota</button>
      </div>
    </div>
  `;

  shadow.appendChild(modal);

  modal.querySelector('#modal-cancel')?.addEventListener('click', () => modal?.remove());
  modal.querySelector('#modal-save')?.addEventListener('click', () => {
    const text = modal?.querySelector<HTMLTextAreaElement>('#modal-note-text')?.value || '';
    onSave(text);
    modal?.remove();
  });
}
