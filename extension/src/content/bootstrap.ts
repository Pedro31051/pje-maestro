import { resolveAdapter } from './pje-router';
import { getLocalMetadataStore } from '../storage/local-db';
import { renderToolbar } from '../ui/toolbar';
import { renderQueuePanel } from '../ui/queue-panel';
import { injectRowBadges } from '../ui/badges';
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

async function initPJeMaestro() {
  console.log('[PJe Maestro] Initializing extension content script...');

  const adapter = resolveAdapter(document);
  if (!adapter) {
    console.log('[PJe Maestro] No matching PJe adapter found on this page.');
    return;
  }

  console.log(`[PJe Maestro] Adapter matched: ${adapter.name}`);

  const refreshUI = async () => {
    const localStore = await getLocalMetadataStore();
    activeRecords = adapter.extractRecords(document, localStore);

    console.log(`[PJe Maestro] Extracted ${activeRecords.length} records.`);
    if (activeRecords.length === 0) return;

    // Apply active filter
    const filteredRecords = filterEngine(activeRecords, currentFilter);

    // Inject row badges
    injectRowBadges(filteredRecords);

    // Render / update queue panel
    const { toggle } = renderQueuePanel(
      filteredRecords,
      (query, statusFilter) => {
        currentFilter.query = query;
        currentFilter.statusFilter = statusFilter as any;
        refreshUI();
      },
      () => refreshUI()
    );
    queueToggleFn = toggle;
  };

  // Render Toolbar
  const container = adapter.getContainer(document);

  renderToolbar({
    onReorder: () => {
      if (container) {
        executeVisualReorder(container, activeRecords);
        refreshUI();
      }
    },
    onFilterVencidos: () => {
      currentFilter.deadlineFilter = currentFilter.deadlineFilter === 'vencidos' ? 'all' : 'vencidos';
      refreshUI();
    },
    onRestore: () => {
      if (container) {
        executeRestoreOrder(container, activeRecords);
        refreshUI();
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

  // Setup DOM observer for dynamic row additions
  if (container) {
    setupDOMObserver(container, () => {
      console.log('[PJe Maestro] DOM mutation detected, refreshing records...');
      refreshUI();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPJeMaestro);
} else {
  initPJeMaestro();
}
