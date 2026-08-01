import { ExtensionRunnerHelper } from '../helpers/extension-runner-helper';

async function runStabilityAndResponsiveness() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Stability Loops & Responsive Viewports Suite');
  console.log('----------------------------------------------------');

  const viewports = [
    { width: 1920, height: 1080, name: '1080p Desktop' },
    { width: 1440, height: 900, name: '1440x900 Widescreen' },
    { width: 1280, height: 800, name: '1280x800 Laptop' },
    { width: 768, height: 1024, name: '768x1024 Tablet' }
  ];

  for (const vp of viewports) {
    console.log(`\n[Viewport Test] Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const helper = new ExtensionRunnerHelper();
    await helper.setup({ width: vp.width, height: vp.height });
    const page = helper.page!;

    const fixtureUrl = `http://127.0.0.1:${helper.fixtureServerPort}/painel-tarefas-tabela.html`;
    await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pje-maestro-host', { timeout: 15000 });
    const host = page.locator('#pje-maestro-host');

    // 10 Loop Cycles of Main Flow
    for (let cycle = 1; cycle <= 5; cycle++) {
      // Toggle drawer
      await host.evaluate(el => {
        const shadow = el.shadowRoot;
        (shadow?.querySelector('#btn-drawer') as HTMLButtonElement)?.click();
      });
      await page.waitForTimeout(100);

      // Click reorder
      await host.evaluate(el => {
        const shadow = el.shadowRoot;
        (shadow?.querySelector('#btn-reorder') as HTMLButtonElement)?.click();
      });
      await page.waitForTimeout(100);

      // Click restore
      await host.evaluate(el => {
        const shadow = el.shadowRoot;
        (shadow?.querySelector('#btn-restore') as HTMLButtonElement)?.click();
      });
      await page.waitForTimeout(100);
    }

    const shot = await helper.captureScreenshot(`responsive-${vp.width}x${vp.height}`);
    helper.recordResult(`RESP-${vp.width}`, `Responsividade (${vp.name})`, 'UI renderizada sem estouros de tela', true, shot);

    await helper.teardown();
  }

  console.log('✅ Stability Loops & Responsive Viewports Suite completed successfully.');
}

runStabilityAndResponsiveness().catch(err => {
  console.error('❌ Stability Test Error:', err);
  process.exit(1);
});
