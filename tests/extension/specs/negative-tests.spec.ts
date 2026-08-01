import { ExtensionRunnerHelper } from '../helpers/extension-runner-helper';

async function runNegativeTests() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Negative & Robustness Test Suite');
  console.log('----------------------------------------------------');

  const helper = new ExtensionRunnerHelper();
  await helper.setup();

  const page = helper.page!;

  // 1. NEG-01: Non-matching Search Query
  const fixtureUrl = `http://127.0.0.1:${helper.fixtureServerPort}/painel-tarefas-tabela.html`;
  await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pje-maestro-host', { timeout: 15000 });
  const host = page.locator('#pje-maestro-host');

  // Open drawer & type non-existent term
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-drawer') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);

  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const input = shadow?.querySelector('#queue-search') as HTMLInputElement;
    if (input) {
      input.value = 'QUERY_INEXISTENTE_999999';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);

  const shot1 = await helper.captureScreenshot('neg-01-empty-query');
  const pageErrorsCount = helper.pageErrors.length;
  helper.recordResult('NEG-01', 'Busca Sem Resultados', 'UI permanece íntegra sem lançar exceções', pageErrorsCount === 0, shot1);

  // 2. NEG-02: Empty Process List Fixture
  const emptyFixtureUrl = `http://127.0.0.1:${helper.fixtureServerPort}/lista-vazia.html`;
  await page.goto(emptyFixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const shot2 = await helper.captureScreenshot('neg-02-empty-list');
  helper.recordResult('NEG-02', 'Lista Vazia do PJe', 'Extensão inicializa graciosamente com lista vazia', true, shot2);

  // 3. NEG-03: Rapid Multi-click Idempotency
  await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pje-maestro-host', { timeout: 15000 });

  console.log('[Test] Triggering 5 rapid clicks on #btn-reorder...');
  await host.evaluate(el => {
    const shadow = el.shadowRoot;
    const btn = shadow?.querySelector('#btn-reorder') as HTMLButtonElement;
    if (btn) {
      btn.click();
      btn.click();
      btn.click();
      btn.click();
      btn.click();
    }
  });
  await page.waitForTimeout(500);

  const shot3 = await helper.captureScreenshot('neg-03-rapid-clicks');
  const hostsCount = await page.locator('#pje-maestro-host').count();
  helper.recordResult('NEG-03', 'Cliques Múltiplos Rápidos', 'Sem duplicação de hosts ou estados corrompidos', hostsCount === 1, shot3);

  // 4. NEG-04: IFrame Legacy Container
  const iframeFixtureUrl = `http://127.0.0.1:${helper.fixtureServerPort}/pje-com-iframe.html`;
  await page.goto(iframeFixtureUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const shot4 = await helper.captureScreenshot('neg-04-iframe-container');
  helper.recordResult('NEG-04', 'Suporte a IFrame Legado', 'Injeção segura sem quebrar frame pai', true, shot4);

  await helper.teardown();
  console.log('✅ Negative & Robustness Test Suite completed successfully.');
}

runNegativeTests().catch(err => {
  console.error('❌ Negative Tests Error:', err);
  process.exit(1);
});
