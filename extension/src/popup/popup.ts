document.addEventListener('DOMContentLoaded', () => {
  const btnReorder = document.getElementById('btn-popup-reorder');
  const btnVencidos = document.getElementById('btn-popup-vencidos');
  const btnNext = document.getElementById('btn-popup-next');
  const btnDrawer = document.getElementById('btn-popup-drawer');
  const btnCSV = document.getElementById('btn-popup-csv');
  const btnOptions = document.getElementById('btn-popup-options');
  const btnPing = document.getElementById('btn-ping-sw');
  const swStatus = document.getElementById('sw-status');

  const sendToActiveTab = (action: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action });
        }
      });
    }
  };

  btnReorder?.addEventListener('click', () => sendToActiveTab('reorder'));
  btnVencidos?.addEventListener('click', () => sendToActiveTab('filter_vencidos'));
  btnNext?.addEventListener('click', () => sendToActiveTab('open_next'));
  btnDrawer?.addEventListener('click', () => sendToActiveTab('toggle_drawer'));
  btnCSV?.addEventListener('click', () => sendToActiveTab('export_csv'));

  btnOptions?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/options.html');
    }
  });

  btnPing?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
        if (swStatus && response?.status === 'PONG') {
          swStatus.textContent = 'Service Worker: PONG! ✅';
        }
      });
    }
  });
});
