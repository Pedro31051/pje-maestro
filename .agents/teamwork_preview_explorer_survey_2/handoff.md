# 🔍 Technical Survey Report: Visual Proof Agent & Visual Evidence Suite

> **Agent:** Explorer 2 (`teamwork_preview_explorer`)  
> **Working Directory:** `/antigravity-workspace/.agents/teamwork_preview_explorer_survey_2`  
> **Target:** PJe Maestro Visual Proof Agent (`visual-agent/`) and E2E Evidence Infrastructure  
> **Date:** 2026-08-01  

---

## 1. Observation

Direct observations from the workspace filesystem and source code files:

### 1.1 Monorepo Workspace & Script Definitions
- **File:** `/antigravity-workspace/package.json` (lines 6-21)
  ```json
  "workspaces": [
    "extension",
    "visual-agent"
  ],
  "scripts": {
    "build": "npm run build --workspace=extension",
    "test": "npm run test --workspace=extension",
    "test:unit": "npm run test:unit --workspace=extension",
    "test:dom": "npm run test:dom --workspace=extension",
    "test:visual": "npm run test:visual --workspace=visual-agent",
    "test:extension": "tsx tests/extension/run-all-extension-tests.ts",
    "visual:live": "npm run visual:live --workspace=visual-agent",
    "visual:headed": "npm run visual:headed --workspace=visual-agent",
    "visual:xvfb": "npm run visual:xvfb --workspace=visual-agent",
    "report": "npm run report --workspace=visual-agent"
  }
  ```

- **File:** `/antigravity-workspace/visual-agent/package.json` (lines 5-11)
  ```json
  "scripts": {
    "test:visual": "tsx src/runner.ts",
    "visual:live": "tsx src/runner.ts --live",
    "visual:headed": "tsx src/runner.ts --headed",
    "visual:xvfb": "xvfb-run -s '-screen 0 1440x900x24' tsx src/runner.ts",
    "report": "tsx src/artifact-index.ts"
  }
  ```

### 1.2 Playwright Configuration & Linux Xvfb Runner Setup
- **File:** `/antigravity-workspace/visual-agent/playwright.config.ts` (lines 1-20)
  ```typescript
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './src',
    timeout: 30000,
    use: {
      headless: false,
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
      video: 'on',
      trace: 'on'
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
  });
  ```

- **File:** `/antigravity-workspace/visual-agent/src/runner.ts` (lines 20-22, 52-63)
  ```typescript
  const hasDisplay = !!process.env.DISPLAY;
  console.log(`[Visual Agent] Environment DISPLAY: ${process.env.DISPLAY || 'Not set (using virtual Xvfb display mode)'}`);

  const args = [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ];

  const browserContext = await chromium.launchPersistentContext('', {
    headless: false, // headed inside display/xvfb
    args,
    viewport: { width: 1440, height: 900 }
  });
  ```

- **File:** `/antigravity-workspace/tests/extension/run-all-extension-tests.ts` (lines 25-41)
  ```typescript
  const xvfbCmd = 'xvfb-run -a -s "-screen 0 1440x900x24"';
  execSync(`${xvfbCmd} tsx tests/extension/specs/inventory-controls.spec.ts`, { cwd: rootDir, stdio: 'inherit' });
  execSync(`${xvfbCmd} tsx tests/extension/specs/action-popup-validation.spec.ts`, { cwd: rootDir, stdio: 'inherit' });
  execSync(`${xvfbCmd} tsx tests/extension/specs/negative-tests.spec.ts`, { cwd: rootDir, stdio: 'inherit' });
  execSync(`${xvfbCmd} tsx tests/extension/specs/stability-loops.spec.ts`, { cwd: rootDir, stdio: 'inherit' });
  ```

### 1.3 Screenshot Capturing (000 to 007), SHA256 & Base64 Embedding
- **File:** `/antigravity-workspace/visual-agent/src/screenshot-capture.ts` (lines 12-35)
  ```typescript
  const paddedIndex = String(stepIndex).padStart(3, '0');
  const filename = `${paddedIndex}-${stepName}.png`;
  const screenshotsDir = path.join(sessionDir, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const targetPath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: targetPath, fullPage: false });

  // Update live/current.jpg
  const liveCurrentJpg = path.join(liveDir, 'current.jpg');
  fs.copyFileSync(targetPath, liveCurrentJpg);
  ```

- **File:** `/antigravity-workspace/visual-agent/src/step-reporter.ts` (lines 39-67)
  ```typescript
  let sha256 = 'N/A';
  if (fs.existsSync(screenshotPath)) {
    const fileBuffer = fs.readFileSync(screenshotPath);
    sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  const relScreenshotPath = path.relative(path.dirname(this.sessionDir), screenshotPath);

  const event: StepEvent = {
    step: stepNumber,
    name,
    timestamp: new Date().toISOString(),
    urlSanitized: redactUrl(url),
    screenshot: relScreenshotPath,
    sha256,
    extensionVersion: '0.1.0',
    status,
    details
  };

  this.events.push(event);

  // Append to live/events.ndjson
  const liveNdjson = path.join(this.liveDir, 'events.ndjson');
  fs.appendFileSync(liveNdjson, JSON.stringify(event) + '\n');

  // Append to session manifest.json
  const sessionManifest = path.join(this.sessionDir, 'manifest.json');
  fs.writeFileSync(sessionManifest, JSON.stringify(this.events, null, 2));
  ```

- **File:** `/antigravity-workspace/visual-agent/src/artifact-index.ts` (lines 48-66)
  ```typescript
  if (fs.existsSync(fullImgPath)) {
    const imgBuf = fs.readFileSync(fullImgPath);
    base64Src = `data:image/png;base64,${imgBuf.toString('base64')}`;
  }

  return `
    <div class="card">
      <div class="card-header">
        <span class="step-number">Etapa #${e.step}</span>
        <span class="step-title">${e.name}</span>
        <span class="status-ok">${e.status.toUpperCase()}</span>
      </div>
      <div class="card-body">
        ${base64Src ? `<img src="${base64Src}" alt="${e.name}" />` : `<div style="padding:20px; color:#ef4444;">Imagem não encontrada: ${e.screenshot}</div>`}
        <div class="meta">URL: ${e.urlSanitized}</div>
        <div class="hash">SHA256: ${e.sha256}</div>
      </div>
    </div>
  `;
  ```

### 1.4 Live Dashboard Server & PJe Fixture Server Setup
- **File:** `/antigravity-workspace/visual-agent/src/live-server.ts` (lines 5-94)
  - Port: `49160` (`http://127.0.0.1:49160/live`)
  - Endpoints:
    - `/live` or `/`: Renders HTML dashboard with side-by-side view (live screenshot `<img id="live-img">` + real-time logs `<pre id="log-content">`). Client polls `/current.jpg?t=timestamp` and `/events` every 1000ms.
    - `/current.jpg`: Serves current JPEG frame buffer from `artifacts/live/current.jpg`.
    - `/events`: Serves newline-delimited JSON log from `artifacts/live/events.ndjson`.

- **File:** `/antigravity-workspace/visual-agent/src/cdp-screencast.ts` (lines 5-23)
  - Connects to Chrome DevTools Protocol session (`page.context().newCDPSession(page)`).
  - Initiates `Page.startScreencast` (JPEG format, quality 80, frame rate multiplier 1).
  - Receives `Page.screencastFrame` events and asynchronously writes base64 buffer directly to `artifacts/live/current.jpg`.

- **File:** `/antigravity-workspace/visual-agent/src/pje-fixture-server.ts` (lines 10-38)
  - Port: `49155` (`http://127.0.0.1:49155`)
  - Directory: `visual-agent/fixtures/`
  - Fixture Files:
    - `painel-tarefas-tabela.html`: Mock PJe table view with CNJ process IDs, priority tags ("PRIORIDADE IDOSO"), task names ("Minuta de Despacho Liminar"), labels, days stopped.
    - `painel-tarefas-cards.html`: Mock PJe card layout grid (`.lista-cards-tarefa`, `.card-processo`).
    - `pje-com-iframe.html`: Legacy PJe container nesting `painel-tarefas-tabela.html` in an `<iframe>` (`#frame-pje-legacy`).
    - `processo-sigiloso.html`: Secret/confidential court case fixture (`.linha-processo.sigiloso`).
    - `lista-vazia.html`: Empty task table fixture for negative testing.

---

## 2. Logic Chain

1. **Requirement for Headed Chrome Extensions on Headless Linux:**
   - Chrome Manifest V3 extensions, popup HTML pages, and Shadow DOM elements (`#pje-maestro-host`) require Chrome to run in non-headless mode (`headless: false` with `--load-extension`).
   - Standard headless Chrome disables extension loading.
   - To bypass this on Linux servers, `visual-agent` and `tests/extension` run Playwright inside `xvfb-run -s '-screen 0 1440x900x24'`. This creates a virtual X11 display buffer, allowing Chromium to run as a full headed browser without requiring a physical monitor.

2. **Step-by-Step Screenshot & Hash Verification Flow:**
   - `runner.ts` executes sequential steps: `0` (pje-page-loaded), `1` (toolbar-injected), `2` (filter-vencidos), `3` (reordered-by-score), `4` (queue-panel-open), `5` (next-process-highlight), `6` (restore-order), `7` (pje-iframe-loaded).
   - At each step, `captureStepScreenshot` formats the index as 3 digits zero-padded (`String(stepIndex).padStart(3, '0')` -> `000` to `007`) and saves PNG artifacts.
   - `StepReporter.recordStep` computes `crypto.createHash('sha256')` over the raw PNG buffer to ensure cryptographic proof of visual state integrity.
   - `redactUrl` strips sensitive query parameters (tokens, passwords) from URLs before recording to prevent credential leakage.

3. **Autonomous, Offline-Capable HTML Report Generation:**
   - Instead of producing HTML reports dependent on relative image paths (which break when shared or archived), `generateHTMLReport` reads the generated PNG files, converts them into Base64 strings, and embeds them directly into `data:image/png;base64,...` source attributes.
   - The resulting `index.html` file is completely autonomous and self-contained, opening in any web browser on Linux, macOS, or Windows without requiring an HTTP web server or local asset folders.

4. **Real-time Live Telemetry & Isolated Fixtures:**
   - `pje-fixture-server` runs on isolated port 49155, serving static HTML fixtures representing various PJe tribunal UI states (tables, cards, iframes, empty lists, secret cases).
   - `live-server` runs on port 49160, serving a real-time dashboard fed by CDP screencasting (`Page.startScreencast`) and line-delimited event streams (`events.ndjson`).
   - `ExtensionRunnerHelper` in `tests/extension/helpers/extension-runner-helper.ts` shares these exact fixture and live server implementations, unifying the visual proof agent with the automated E2E test inventory suite.

---

## 3. Caveats

- **CDP Screencast Compatibility:** `startCDPScreencast` catches potential errors if CDP session creation fails in specific browser launch modes, falling back to static `current.jpg` updates per step in `captureStepScreenshot`.
- **Dynamic Session Directory Names:** Visual proof sessions are timestamped (`artifacts/sessions/session_<timestamp>`). Running `npm run report` standalone automatically resolves the latest session by sorting `artifacts/sessions/` in reverse alphabetical order.
- **Port Availability:** Ports `49155` (fixtures) and `49160` (live dashboard) are hardcoded. If another process occupies these ports, the servers will fail to bind unless killed or reconfigured.

---

## 4. Conclusion

The Visual Proof Agent and visual evidence suite in `pje-maestro` is fully implemented, self-contained, and optimized for Linux environments using Xvfb. It successfully:
- Launches Chrome Manifest V3 extensions under Chromium with Xvfb virtual framebuffers.
- Formats step screenshots in strict 3-digit numeric order (`000` to `007`).
- Computes SHA256 cryptographic hashes for every visual evidence frame.
- Generates fully autonomous, self-contained HTML reports (`index.html`) with embedded Base64 Data URIs.
- Serves live streaming feeds on `http://127.0.0.1:49160/live` and standard PJe mock fixtures on `http://127.0.0.1:49155`.

---

## 5. Verification Method

To independently verify the Visual Proof Agent and visual evidence suite:

1. **Build Extension:**
   ```bash
   npm run build
   ```
   *Expected:* Builds extension output in `extension/dist/` with `manifest.json`.

2. **Execute Visual Proof Agent (via Xvfb):**
   ```bash
   npm run visual:xvfb
   ```
   *Expected:* 
   - Fixture server starts at `http://127.0.0.1:49155`.
   - Live server starts at `http://127.0.0.1:49160/live`.
   - Executes 8 visual steps (000 to 007).
   - Generates session dir under `artifacts/sessions/session_<timestamp>/`.
   - Generates standalone `index.html` report with embedded Base64 images.

3. **Verify Report Generation:**
   ```bash
   npm run report
   ```
   *Expected:* Reads latest session manifest and outputs `Generated standalone HTML report with embedded Base64 images`.

4. **Execute Full Extension Validation Suite:**
   ```bash
   npm run test:extension
   ```
   *Expected:* Runs 4 specs under `xvfb-run` and updates `artifacts/extension-validation/reports/extension-test-results.json` with 100% `PASSED` status.

5. **Invalidation Conditions:**
   - Missing `extension/dist/manifest.json` causes `runner.ts` to abort with exit code 1.
   - Missing Xvfb or `DISPLAY` variable in headless environments without Xvfb wrapper will cause Playwright launch failures.
