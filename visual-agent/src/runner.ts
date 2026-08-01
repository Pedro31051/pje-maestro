import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startFixtureServer } from './pje-fixture-server';
import { startLiveServer } from './live-server';
import { StepReporter } from './step-reporter';
import { captureStepScreenshot } from './screenshot-capture';
import { generateHTMLReport } from './artifact-index';
import { startCDPScreencast } from './cdp-screencast';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVisualProofAgent() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting PJe Maestro Visual Proof Agent on Linux');
  console.log('----------------------------------------------------');

  const hasDisplay = !!process.env.DISPLAY;
  console.log(`[Visual Agent] Environment DISPLAY: ${process.env.DISPLAY || 'Not set (using virtual Xvfb display mode)'}`);


  const sessionId = `session_${Date.now()}`;
  const rootArtifactsDir = path.resolve(__dirname, '../../artifacts');
  const sessionDir = path.join(rootArtifactsDir, 'sessions', sessionId);
  const liveDir = path.join(rootArtifactsDir, 'live');

  // Clean old live dir
  fs.rmSync(liveDir, { recursive: true, force: true });
  fs.mkdirSync(liveDir, { recursive: true });

  const reporter = new StepReporter(sessionDir, liveDir);

  // 1. Start Fixture & Live Servers
  const fixtureServerPort = 49155;
  const liveServerPort = 49160;

  await startFixtureServer(fixtureServerPort);
  await startLiveServer(liveDir, liveServerPort);

  // 2. Resolve Extension Path
  const extensionPath = path.resolve(__dirname, '../../extension/dist');
  if (!fs.existsSync(extensionPath) || !fs.existsSync(path.join(extensionPath, 'manifest.json'))) {
    console.error(`❌ Extension build not found at ${extensionPath}. Please build the extension first!`);
    process.exit(1);
  }

  console.log(`[Visual Agent] Loading extension from: ${extensionPath}`);

  const chromeOficial = '/Users/pedrofelipealvesrocha/chrome/mac_arm-116.0.5793.0/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const executablePath = fs.existsSync(chromeOficial) ? chromeOficial : undefined;
  if (executablePath) {
    console.log(`[Visual Agent] Using official Chrome for Testing: ${executablePath}`);
  }

  const args = [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ];

  const browserContext = await chromium.launchPersistentContext('', {
    executablePath,
    headless: false, // headed inside display/xvfb
    args,
    viewport: { width: 1440, height: 900 }
  });

  const page = await browserContext.newPage();
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Error]`, err));

  let stepCount = 0;

  // Step 0: Open PJe Fixture Page
  const fixtureUrl = `http://127.0.0.1:${fixtureServerPort}/painel-tarefas-tabela.html`;
  console.log(`[Visual Agent] Navigating to: ${fixtureUrl}`);
  await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  let screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'pje-page-loaded');
  reporter.recordStep(stepCount++, 'pje-page-loaded', page.url(), screenshotPath);

  const stopCDP = await startCDPScreencast(page, liveDir);

  // Step 1: Extension Loaded & Toolbar Injected
  // Wait for toolbar in shadow root
  console.log('[Visual Agent] Waiting for PJe Maestro UI injection (#pje-maestro-host)...');
  await page.waitForSelector('#pje-maestro-host', { timeout: 15000 });
  await page.waitForTimeout(1000);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'toolbar-injected');
  reporter.recordStep(stepCount++, 'toolbar-injected', page.url(), screenshotPath);

  // Step 2: Apply Vencidos Filter
  console.log('[Visual Agent] Clicking "Vencidos" filter...');
  const host = page.locator('#pje-maestro-host');
  await host.evaluate((el) => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-vencidos') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'filter-vencidos');
  reporter.recordStep(stepCount++, 'filter-vencidos', page.url(), screenshotPath);

  // Step 3: Reorder by Score
  console.log('[Visual Agent] Clicking "Reordenar Fila"...');
  await host.evaluate((el) => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-reorder') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'reordered-by-score');
  reporter.recordStep(stepCount++, 'reordered-by-score', page.url(), screenshotPath);

  // Step 4: Open Queue Side Panel
  console.log('[Visual Agent] Opening Queue Side Panel...');
  await host.evaluate((el) => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-drawer') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'queue-panel-open');
  reporter.recordStep(stepCount++, 'queue-panel-open', page.url(), screenshotPath);

  // Step 5: Highlight Next Process
  console.log('[Visual Agent] Clicking "Próximo Processo"...');
  await host.evaluate((el) => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-next') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'next-process-highlight');
  reporter.recordStep(stepCount++, 'next-process-highlight', page.url(), screenshotPath);

  // Step 6: Restore Original Order
  console.log('[Visual Agent] Restoring original order...');
  await host.evaluate((el) => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-restore') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'restore-order');
  reporter.recordStep(stepCount++, 'restore-order', page.url(), screenshotPath);

  // Step 7: Test Iframe Fixture
  const iframeFixtureUrl = `http://127.0.0.1:${fixtureServerPort}/pje-com-iframe.html`;
  console.log(`[Visual Agent] Navigating to iframe fixture: ${iframeFixtureUrl}`);
  await page.goto(iframeFixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  screenshotPath = await captureStepScreenshot(page, sessionDir, liveDir, stepCount, 'pje-iframe-loaded');
  reporter.recordStep(stepCount++, 'pje-iframe-loaded', page.url(), screenshotPath);

  // 4. Wrap up & Generate HTML Report
  await stopCDP();
  await browserContext.close();

  const reportPath = generateHTMLReport(sessionDir, reporter.getEvents());

  console.log('\n====================================================');
  console.log('✅ VISUAL PROOF EXECUTION COMPLETE');
  console.log(`📊 Session Dir: ${sessionDir}`);
  console.log(`🌐 Live Dashboard: http://127.0.0.1:${liveServerPort}/live`);
  console.log(`📄 Visual Proof Report: file://${reportPath}`);
  console.log('====================================================\n');

  process.exit(0);
}

runVisualProofAgent().catch((err) => {
  console.error('❌ Visual Proof Agent Error:', err);
  process.exit(1);
});
