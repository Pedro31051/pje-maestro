import { resolveAdapter } from './pje-router';
import { detectAndInspectIFrames } from '../adapters/pje-iframe-adapter';
import { isTopWindow } from './frame-detector';
import { getLocalMetadataStore } from '../storage/local-db';
import { renderToolbar } from '../ui/toolbar';
import { renderQueuePanel } from '../ui/queue-panel';
import { applyRecordVisibility, injectRowBadges } from '../ui/badges';
import { executeVisualReorder } from '../actions/visual-reorder';
import { executeRestoreOrder } from '../actions/restore-order';
import { executeOpenNext } from '../actions/open-next';
import { generateCSV, downloadCSV } from '../actions/export-csv';
import { filterEngine, FilterCriteria } from '../core/filter-engine';
import { setupDOMObserver } from './mutation-observer';
import { ProcessRecord } from '../core/process-record';

let activeRecords: ProcessRecord[] = [];
let currentFilter: FilterCriteria = {};
let queueToggleFn: (() => void) | null = null;
let refreshRevision = 0;

async function initPJeMaestro() {
  console.log(`[PJe Maestro] Initializing extension content script (topWindow: ${isTopWindow()})...`);

  const subFrames = detectAndInspectIFrames(document);
  if (subFrames.length > 0) {
    console.log(`[PJe Maestro] Detected and inspected ${subFrames.length} PJe frame(s).`);
  }

  const adapter = resolveAdapter(document);
  if (!adapter) {
    console.log('[PJe Maestro] No matching PJe adapter found on this page.');
    return;
  }

  console.log(`[PJe Maestro] Adapter matched: ${adapter.name}`);

  const refreshUI = async () => {
    const revision = ++refreshRevision;
    const localStore = await getLocalMetadataStore();
    if (revision !== refreshRevision) return;
    activeRecords = adapter.extractRecords(document, localStore);

    console.log(`[PJe Maestro] Extracted ${activeRecords.length} records.`);
    // Apply active filter
    const filteredRecords = filterEngine(activeRecords, currentFilter);

    // Keep every row decorated and reflect filters in the original PJe list.
    injectRowBadges(activeRecords);
    applyRecordVisibility(activeRecords, filteredRecords);

    // Render / update queue panel
    const { toggle } = renderQueuePanel(
      filteredRecords,
      currentFilter,
      (query, statusFilter) => {
        currentFilter.query = query;
        currentFilter.statusFilter = statusFilter as any;
        void refreshUI();
      },
      () => void refreshUI()
    );
    queueToggleFn = toggle;
  };

  // Render Toolbar
  const container = adapter.getContainer(document);

  renderToolbar({
    onReorder: () => {
      if (container) {
        executeVisualReorder(container, activeRecords);
        void refreshUI();
      }
    },
    onFilterVencidos: () => {
      currentFilter.deadlineFilter = currentFilter.deadlineFilter === 'vencidos' ? 'all' : 'vencidos';
      void refreshUI();
    },
    onRestore: () => {
      if (container) {
        executeRestoreOrder(container, activeRecords);
        void refreshUI();
      }
    },
    onOpenNext: () => {
      executeOpenNext(activeRecords);
    },
    onToggleDrawer: () => {
      if (queueToggleFn) queueToggleFn();
    },
    onExportCSV: () => {
      const csv = generateCSV(activeRecords);
      downloadCSV(`pje_maestro_fila_${Date.now()}.csv`, csv);
    }
  });

  await refreshUI();

  // Listen for messages from Extension Action Popup or Service Worker
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      console.log('[PJe Maestro] Message received in Content Script:', message);
      if (message.action === 'reorder' && container) {
        executeVisualReorder(container, activeRecords);
        void refreshUI();
      } else if (message.action === 'filter_vencidos') {
        currentFilter.deadlineFilter = currentFilter.deadlineFilter === 'vencidos' ? 'all' : 'vencidos';
        void refreshUI();
      } else if (message.action === 'open_next') {
        executeOpenNext(activeRecords);
      } else if (message.action === 'toggle_drawer' && queueToggleFn) {
        queueToggleFn();
      } else if (message.action === 'export_csv') {
        const csv = generateCSV(activeRecords);
        downloadCSV(`pje_maestro_fila_${Date.now()}.csv`, csv);
      }
    });
  }

  // Setup DOM observer for dynamic row additions
  if (container) {
    setupDOMObserver(container, () => {
      console.log('[PJe Maestro] DOM mutation detected, refreshing records...');
      void refreshUI();
    });
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPJeMaestro);
} else {
  initPJeMaestro();
}
