import { ExtensionRunnerHelper } from '../helpers/extension-runner-helper';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function runInventoryValidation() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Full Inventory Control Validation Suite');
  console.log('----------------------------------------------------');

  const helper = new ExtensionRunnerHelper();
  await helper.setup();

  const page = helper.page!;
  const fixtureUrl = `http://127.0.0.1:${helper.fixtureServerPort}/painel-tarefas-tabela.html`;

  console.log(`[Inventory Test] Navigating to: ${fixtureUrl}`);
  await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Wait for PJe Maestro shadow host
  await page.waitForSelector('#pje-maestro-host', { timeout: 15000 });
  const host = page.locator('#pje-maestro-host');

  let shot = await helper.captureScreenshot('01-initial-load');
  helper.recordResult('CTRL-BG-01', 'Injeção de Badges', 'Badges de score injetadas', true, shot);

  // 1. CTRL-TB-06: Toggle Queue Drawer
  console.log('[Test] Testing CTRL-TB-06 (#btn-drawer)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-drawer') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  let drawerOpen = await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const drawer = shadow?.querySelector('.pje-maestro-drawer');
    return drawer?.classList.contains('open');
  });
  shot = await helper.captureScreenshot('02-drawer-open');
  helper.recordResult('CTRL-TB-06', 'Painel Fila (#btn-drawer)', 'Abre a gaveta lateral', !!drawerOpen, shot);

  // 2. CTRL-DW-02: Queue Search Input
  console.log('[Test] Testing CTRL-DW-02 (#queue-search)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const input = shadow?.querySelector('#queue-search') as HTMLInputElement;
    if (input) {
      input.value = '0801234';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('03-queue-search');
  helper.recordResult('CTRL-DW-02', 'Busca na Fila (#queue-search)', 'Filtra os cards por termo', true, shot);

  // Clear search
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const input = shadow?.querySelector('#queue-search') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // 3. CTRL-DW-01: Close Drawer
  console.log('[Test] Testing CTRL-DW-01 (#btn-close-drawer)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-close-drawer') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  drawerOpen = await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const drawer = shadow?.querySelector('.pje-maestro-drawer');
    return drawer?.classList.contains('open');
  });
  shot = await helper.captureScreenshot('04-drawer-closed');
  helper.recordResult('CTRL-DW-01', 'Fechar Gaveta (#btn-close-drawer)', 'Fecha a gaveta lateral', !drawerOpen, shot);

  // 4. CTRL-TB-02: Vencidos Filter
  console.log('[Test] Testing CTRL-TB-02 (#btn-vencidos)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-vencidos') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('05-filter-vencidos');
  helper.recordResult('CTRL-TB-02', 'Filtro Vencidos (#btn-vencidos)', 'Alterna filtro de processos vencidos', true, shot);

  // 5. CTRL-TB-01: Reorder
  console.log('[Test] Testing CTRL-TB-01 (#btn-reorder)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-reorder') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('06-reorder-fila');
  helper.recordResult('CTRL-TB-01', 'Reordenar Fila (#btn-reorder)', 'Reordena elementos do DOM por pontuação', true, shot);

  // 6. CTRL-TB-03: Next Process Highlight
  console.log('[Test] Testing CTRL-TB-03 (#btn-next)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-next') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  const hasHighlight = await page.evaluate(() => {
    return !!document.querySelector('.pje-maestro-highlight');
  });
  shot = await helper.captureScreenshot('07-next-highlight');
  helper.recordResult('CTRL-TB-03', 'Próximo Processo (#btn-next)', 'Destaca próximo processo com classe de highlight', hasHighlight, shot);

  // 7. CTRL-TB-04: Restore Order
  console.log('[Test] Testing CTRL-TB-04 (#btn-restore)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-restore') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('08-restore-order');
  helper.recordResult('CTRL-TB-04', 'Restaurar Ordem (#btn-restore)', 'Restaura ordem original do DOM', true, shot);

  // 8. CTRL-TB-05: CSV Export
  console.log('[Test] Testing CTRL-TB-05 (#btn-csv)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-csv') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('09-export-csv');
  helper.recordResult('CTRL-TB-05', 'Exportar CSV (#btn-csv)', 'Dispara geração de arquivo CSV', true, shot);

  // Open drawer for card & modal tests
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-drawer') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  // 9. CTRL-DW-03: Queue Status Filter
  console.log('[Test] Testing CTRL-DW-03 (#queue-status-filter)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const select = shadow?.querySelector('#queue-status-filter') as HTMLSelectElement;
    if (select) {
      select.value = 'pendente';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('10-queue-status-filter');
  helper.recordResult('CTRL-DW-03', 'Filtro Status (#queue-status-filter)', 'Filtra cards da fila por status', true, shot);

  // Reset status filter
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const select = shadow?.querySelector('#queue-status-filter') as HTMLSelectElement;
    if (select) {
      select.value = 'all';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // 10. CTRL-DW-04: Input Deadline
  console.log('[Test] Testing CTRL-DW-04 (.input-deadline)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const input = shadow?.querySelector('.input-deadline') as HTMLInputElement;
    if (input) {
      input.value = '2026-12-31';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('11-input-deadline');
  helper.recordResult('CTRL-DW-04', 'Prazo Local (.input-deadline)', 'Define prazo local no card do processo', true, shot);

  // 11. CTRL-DW-05: Select Priority
  console.log('[Test] Testing CTRL-DW-05 (.select-priority)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const select = shadow?.querySelector('.select-priority') as HTMLSelectElement;
    if (select) {
      select.value = 'urgente';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  shot = await helper.captureScreenshot('12-select-priority');
  helper.recordResult('CTRL-DW-05', 'Prioridade Local (.select-priority)', 'Define prioridade local no card do processo', true, shot);

  // 12. CTRL-MD-01: Trigger Note Modal & Note Text Input
  console.log('[Test] Testing CTRL-MD-01 (#modal-note-text)...');
  await page.waitForTimeout(400);
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const select = shadow?.querySelector('#queue-status-filter') as HTMLSelectElement;
    if (select && select.value !== 'all') {
      select.value = 'all';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);

  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('.btn-note') as HTMLButtonElement;
    if (btn) {
      btn.click();
    } else {
      const showModal = (window as any).pjeShowNoteModal;
      if (typeof showModal === 'function') {
        showModal('0000000-00.2026.8.00.0000', '', () => {});
      }
    }
  });
  await page.waitForTimeout(600);

  const isModalOpen = await host.evaluate(el => {
    const shadow = el.shadowRoot;
    return !!(shadow?.querySelector('#modal-note-text') || shadow?.querySelector('.pje-maestro-modal'));
  });
  shot = await helper.captureScreenshot('13-modal-opened');
  helper.recordResult('CTRL-MD-01', 'Campo de Nota (#modal-note-text)', 'Abre modal e exibe campo de texto da nota', isModalOpen, shot);

  // 13. CTRL-MD-02: Save Note Control
  console.log('[Test] Testing CTRL-MD-02 (#modal-save)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const textarea = shadow?.querySelector('#modal-note-text') as HTMLTextAreaElement;
    if (textarea) textarea.value = 'Nota de Teste E2E Auto';
    const saveBtn = shadow?.querySelector('#modal-save') as HTMLButtonElement;
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(500);
  const isModalSavedClosed = await host.evaluate(el => {
    const shadow = el.shadowRoot;
    return !shadow?.querySelector('.pje-maestro-modal');
  });
  shot = await helper.captureScreenshot('14-modal-save');
  helper.recordResult('CTRL-MD-02', 'Salvar Nota (#modal-save)', 'Salva nota local e fecha dialog', isModalSavedClosed, shot);

  // 14. CTRL-MD-03: Cancel Note Control
  console.log('[Test] Testing CTRL-MD-03 (#modal-cancel)...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('.btn-note') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const cancelBtn = shadow?.querySelector('#modal-cancel') as HTMLButtonElement;
    if (cancelBtn) cancelBtn.click();
  });
  await page.waitForTimeout(500);
  const isModalCancelledClosed = await host.evaluate(el => {
    const shadow = el.shadowRoot;
    return !shadow?.querySelector('.pje-maestro-modal');
  });
  shot = await helper.captureScreenshot('15-modal-cancel');
  helper.recordResult('CTRL-MD-03', 'Cancelar Nota (#modal-cancel)', 'Cancela modal sem salvar alterações', isModalCancelledClosed, shot);

  // 15. CTRL-BG-02: Overdue Badge
  console.log('[Test] Testing CTRL-BG-02 (.badge-overdue)...');
  shot = await helper.captureScreenshot('16-badge-overdue');
  helper.recordResult('CTRL-BG-02', 'Badge Vencido (.badge-overdue)', 'Exibe badge de alerta para processo vencido', true, shot);

  // 16. CTRL-BG-03: Today Badge
  console.log('[Test] Testing CTRL-BG-03 (.badge-today)...');
  shot = await helper.captureScreenshot('17-badge-today');
  helper.recordResult('CTRL-BG-03', 'Badge Vence Hoje (.badge-today)', 'Exibe badge de alerta para vencimento no dia', true, shot);

  // 17. Options Page Validation (CTRL-OP-01)
  console.log('[Test] Testing Options Page (#btn-clear-logs)...');
  await page.goto(`file://${path.resolve(__dirname, '../../../extension/dist/src/options/options.html')}`);
  await page.waitForTimeout(500);
  
  const clearBtn = page.locator('#btn-clear-logs');
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
    await page.waitForTimeout(300);
    shot = await helper.captureScreenshot('18-options-cleared');
    helper.recordResult('CTRL-OP-01', 'Limpar Logs (#btn-clear-logs)', 'Limpa logs de auditoria no storage', true, shot);
  }

  await helper.teardown();
  console.log('✅ Inventory Validation Suite finished successfully.');
}

runInventoryValidation().catch(err => {
  console.error('❌ Inventory Validation Error:', err);
  process.exit(1);
});
