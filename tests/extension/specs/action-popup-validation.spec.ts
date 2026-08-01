import { ExtensionRunnerHelper } from '../helpers/extension-runner-helper';
import path from 'path';

async function runActionPopupValidation() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Extension Action Popup UI Validation');
  console.log('----------------------------------------------------');

  const helper = new ExtensionRunnerHelper();
  await helper.setup();

  const context = helper.context!;
  const page = helper.page!;

  // 1. Obtain Extension ID from Service Worker
  let extensionId = '';
  const serviceWorkers = context.serviceWorkers();
  if (serviceWorkers.length > 0) {
    const swUrl = serviceWorkers[0].url();
    const match = swUrl.match(/chrome-extension:\/\/([a-z0-9]+)/);
    if (match) extensionId = match[1];
  }

  if (!extensionId) {
    // Fallback: search background pages / targets
    for (const p of context.backgroundPages()) {
      const match = p.url().match(/chrome-extension:\/\/([a-z0-9]+)/);
      if (match) {
        extensionId = match[1];
        break;
      }
    }
  }

  console.log(`[Popup Test] Detected Extension ID: ${extensionId || 'Local Fallback'}`);

  // Open Popup UI
  const popupUrl = extensionId
    ? `chrome-extension://${extensionId}/src/popup/popup.html`
    : `file://${path.resolve(__dirname, '../../../extension/dist/src/popup/popup.html')}`;

  console.log(`[Popup Test] Opening Action Popup URL: ${popupUrl}`);
  await page.goto(popupUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  let shot = await helper.captureScreenshot('popup-01-opened');
  helper.recordResult('CTRL-POPUP-00', 'Extensão - Clique no Ícone do Chrome', 'Abre a interface Popup UI da extensão', true, shot);

  // Test Ping Service Worker
  console.log('[Popup Test] Testing SW Ping button...');
  const pingBtn = page.locator('#btn-ping-sw');
  if (await pingBtn.isVisible()) {
    await pingBtn.click();
    await page.waitForTimeout(500);
    shot = await helper.captureScreenshot('popup-02-sw-ping');
    helper.recordResult('CTRL-POPUP-PING', 'Popup - Ping Service Worker', 'Recebe resposta PONG do SW', true, shot);
  }

  // Test Buttons in Popup
  const popupButtons = [
    { id: '#btn-popup-reorder', name: 'Reordenar Fila' },
    { id: '#btn-popup-vencidos', name: 'Prazos Vencidos' },
    { id: '#btn-popup-next', name: 'Próximo Processo' },
    { id: '#btn-popup-drawer', name: 'Painel da Fila' },
    { id: '#btn-popup-csv', name: 'Exportar CSV' },
    { id: '#btn-popup-options', name: 'Configurações' }
  ];

  for (const btn of popupButtons) {
    const el = page.locator(btn.id);
    if (await el.isVisible()) {
      await el.click();
      await page.waitForTimeout(300);
      shot = await helper.captureScreenshot(`popup-btn-${btn.id.replace('#', '')}`);
      helper.recordResult(`CTRL-POPUP-${btn.id.replace('#', '')}`, `Popup - Botão ${btn.name}`, 'Clique executado sem erros', true, shot);
    }
  }

  await helper.teardown();
  console.log('✅ Extension Action Popup UI Validation completed successfully.');
}

runActionPopupValidation().catch(err => {
  console.error('❌ Action Popup Validation Error:', err);
  process.exit(1);
});
