document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-clear-logs');
  const status = document.getElementById('status');

  btn?.addEventListener('click', async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ auditLogs: [] });
      if (status) status.textContent = 'Logs de auditoria limpos com sucesso!';
    }
  });
});
