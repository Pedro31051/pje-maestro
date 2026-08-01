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

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#1e293b;color:#fff;width:450px;padding:20px;border-radius:12px;border:1px solid #334155;box-shadow:0 20px 25px -5px rgba(0,0,0,.5)';
  const title = document.createElement('h3');
  title.style.marginTop = '0';
  title.textContent = `📝 Nota Local - ${cnj}`;
  const textarea = document.createElement('textarea');
  textarea.id = 'modal-note-text';
  textarea.style.cssText = 'width:100%;height:120px;background:#0f172a;border:1px solid #334155;color:#fff;border-radius:8px;padding:8px;box-sizing:border-box;font-family:sans-serif';
  textarea.value = initialNote;
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;margin-top:16px';
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.id = 'modal-cancel';
  cancelButton.className = 'pje-maestro-btn';
  cancelButton.style.background = '#475569';
  cancelButton.textContent = 'Cancelar';
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.id = 'modal-save';
  saveButton.className = 'pje-maestro-btn btn-primary';
  saveButton.textContent = 'Salvar Nota';
  controls.append(cancelButton, saveButton);
  dialog.append(title, textarea, controls);
  modal.appendChild(dialog);

  shadow.appendChild(modal);

  modal.querySelector('#modal-cancel')?.addEventListener('click', () => modal?.remove());
  modal.querySelector('#modal-save')?.addEventListener('click', () => {
    const text = modal?.querySelector<HTMLTextAreaElement>('#modal-note-text')?.value || '';
    onSave(text);
    modal?.remove();
  });
}
