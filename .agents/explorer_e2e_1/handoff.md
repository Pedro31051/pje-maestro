# Handoff Report — E2E Test Infrastructure Investigation

## 1. Observation

### 1.1 Project Structure & Package Scripts
- **Root `package.json`** (`/antigravity-workspace/package.json`):
  - Defines workspaces `["extension", "visual-agent"]`.
  - Test scripts:
    - `"test"`: `"npm run test --workspace=extension"` (Vitest unit/DOM tests)
    - `"test:extension"`: `"tsx tests/extension/run-all-extension-tests.ts"` (Playwright runner under Xvfb)
    - `"test:visual"`: `"npm run test:visual --workspace=visual-agent"`
    - `"visual:xvfb"`: `"npm run visual:xvfb --workspace=visual-agent"` (`xvfb-run -s '-screen 0 1440x900x24' tsx src/runner.ts`)
- **Extension `package.json`** (`/antigravity-workspace/extension/package.json`):
  - `"build"`: `"tsx vite.config.ts"` (Compiles into `extension/dist/`)
  - `"test"`: `"vitest run"` (Executes unit and DOM specs)
- **Visual Agent `package.json`** (`/antigravity-workspace/visual-agent/package.json`):
  - Dependencies include `express`, `ws`, `@playwright/test`, `tsx`.

### 1.2 Existing E2E Test Infrastructure (`tests/extension/`)
- Directory layout:
  - `run-all-extension-tests.ts`: Orchestration script using `execSync` to run specs sequentially under Xvfb via `xvfb-run -a -s "-screen 0 1440x900x24" tsx tests/extension/specs/<spec>.spec.ts`.
  - `helpers/extension-runner-helper.ts`: Helper class `ExtensionRunnerHelper` launching Chromium with unpacked extension (`--disable-extensions-except=.../extension/dist`, `--load-extension=.../extension/dist`), starting local HTTP servers (Fixture server port 49155, Live telemetry server port 49160), capturing screenshots to `artifacts/extension-validation/screenshots`, recording browser console logs, and generating `extension-test-results.json`.
  - Existing Spec Files (`tests/extension/specs/`):
    1. `inventory-controls.spec.ts` (171 lines): Validates toolbar buttons (`#btn-drawer`, `#btn-vencidos`, `#btn-reorder`, `#btn-next`, `#btn-restore`, `#btn-csv`), search input (`#queue-search`), close drawer (`#btn-close-drawer`), clear options logs (`#btn-clear-logs`), and score badge rendering (`CTRL-BG-01`). Total assertions: 10.
    2. `action-popup-validation.spec.ts` (87 lines): Validates extension popup UI (`chrome-extension://.../src/popup/popup.html`), SW ping (`#btn-ping-sw`), and popup trigger buttons. Total assertions: 7.
    3. `negative-tests.spec.ts` (87 lines): Validates non-matching search term (`NEG-01`), empty process list fixture (`NEG-02`), rapid multi-click idempotency (`NEG-03`), and iframe container loading (`NEG-04`). Total assertions: 4.
    4. `stability-loops.spec.ts` (63 lines): Executes 5 cycle loops of drawer toggle / reorder / restore across 4 viewports (1080p, 1440x900, 1280x800, 768x1024). Total assertions: 4.

### 1.3 Visual Proof Agent Infrastructure (`visual-agent/`)
- Configuration & Code:
  - `playwright.config.ts`: Configures Playwright (`headless: false`, viewport `1440x900`, video 'on', trace 'on').
  - `src/runner.ts`: Visual proof runner executing 8 steps (000 to 007) on `http://127.0.0.1:49155/painel-tarefas-tabela.html` and `pje-com-iframe.html`.
  - `src/screenshot-capture.ts`: Captures 3-digit zero-padded step screenshots (`000-pje-page-loaded.png` ... `007-pje-iframe-loaded.png`) and updates `artifacts/live/current.jpg`.
  - `src/step-reporter.ts`: Computes SHA256 hashes of screenshots, redacts URLs, appends events to `events.ndjson` and `manifest.json`.
  - `src/artifact-index.ts`: Builds self-contained `index.html` report embedding Base64 image Data URIs (`data:image/png;base64,...`).
  - `src/live-server.ts`: Telemetry dashboard server on `http://127.0.0.1:49160/live`.
  - `src/pje-fixture-server.ts`: Serves mock HTML tribunal pages from `visual-agent/fixtures/` on port `49155`.
- Observed Bug in `fixtures/pje-com-iframe.html`:
  - Line 16 of `pje-com-iframe.html`: `<iframe id="frame-pje-legacy" src="/fixtures/painel-tarefas-tabela.html" class="pje-frame"></iframe>`.
  - `pje-fixture-server.ts` maps requests relative to `FIXTURES_DIR` (`visual-agent/fixtures`). Requesting `/fixtures/painel-tarefas-tabela.html` attempts to read `fixtures/fixtures/painel-tarefas-tabela.html`, causing HTTP 404 in iframe loading.

### 1.4 Test Execution Verification Results
1. `npm test`: **PASSED** (15/15 unit & DOM tests passed via Vitest in `extension/`).
2. `npm run build`: **PASSED** (Vite compiled extension to `extension/dist/` with IIFE bootstrap and ES popup/options/sw).
3. `npm run visual:xvfb`: **PASSED** (Playwright executed under Xvfb, generated steps 000-007 screenshots, SHA256 hashes, `index.html` report with embedded Base64 Data URIs, and live dashboard at `http://127.0.0.1:49160/live`).
4. `npm run test:extension`: **FAILED** with 2 distinct execution flaws:
   - Issue 1: `xvfb-run` PATH resolution. `execSync` called `xvfb-run tsx ...`, which fails with `tsx: not found` unless invoked as `npx tsx` or `./node_modules/.bin/tsx` or PATH is passed.
   - Issue 2: Server port collision (`EADDRINUSE: 49155`). Each spec script independently calls `helper.setup()` which binds port 49155 and 49160. Because individual spec scripts do not call `process.exit(0)` on completion, HTTP server sockets remain bound between child process executions.

---

## 2. Logic Chain

1. **Test Runner Infrastructure Analysis**:
   - `npm test` works for unit/DOM tests because Vitest handles lifecycle in Node happy-dom environment.
   - `npm run visual:xvfb` works as a standalone single-session script because it starts the fixture/live servers once, runs steps 0-7, generates `index.html`, and exits via `process.exit(0)`.
   - `npm run test:extension` fails when attempting to chain multiple spec files because:
     a. `run-all-extension-tests.ts` executes `xvfb-run tsx tests/extension/specs/...`. `xvfb-run` spawns a subshell where `./node_modules/.bin` is not in system `$PATH`, throwing `tsx: not found`.
     b. Spec files import `ExtensionRunnerHelper`, which calls `startFixtureServer(49155)` and `startLiveServer(49160)` during `setup()`. When spec 1 finishes, `helper.teardown()` calls `server.close()`, but async unref socket cleanup in Node takes time or lingering child process handles keep port 49155 bound. When spec 2 starts immediately, `listen` fails with `EADDRINUSE`.
2. **Current Coverage vs Required Tier 1-4 Coverage**:
   - Total features in inventory (`TEST_INFRA.md`): 35 features (`CTRL-TB-01..06`, `CTRL-DW-01..05`, `CTRL-MD-01..03`, `CTRL-OP-01`, `CTRL-BG-01..03`, `CTRL-POPUP-01..06`, `CTRL-POPUP-PING`, and infrastructure features 26-35).
   - Target specification from `TEST_INFRA.md`:
     - Tier 1 (Feature functionality): 35 features * 5 specs = 175 specs.
     - Tier 2 (Boundary/Corner cases): 35 features * 5 specs = 175 specs.
     - Tier 3 (Pairwise Combinatorial): 35+ combination specs.
     - Tier 4 (Real-world scenarios): 5 end-to-end scenarios.
     - Minimum total assertions required: 390+ specs.
   - Existing specs in `tests/extension/specs/` currently contain only ~25 assertions across 4 files (`inventory-controls.spec.ts`, `action-popup-validation.spec.ts`, `negative-tests.spec.ts`, `stability-loops.spec.ts`).
   - Gap: ~365 test cases must be implemented across Tiers 1-4.

---

## 3. Caveats

- **Network Restrictions**: Investigation conducted strictly locally in `/antigravity-workspace`. No external network requests were required or attempted.
- **Fixture HTML Bugs**: Found 404 bug in `fixtures/pje-com-iframe.html` (line 16), which affects subframe loading during Playwright execution.
- **Browser Execution Environment**: Playwright requires Chrome/Chromium binary and Xvfb buffer in headless Linux. Verified that Xvfb display (`:99` / `xvfb-run`) and Playwright Chromium launch successfully on this machine.

---

## 4. Conclusion

1. **Infrastructure State**:
   - Test framework foundation is in place with Playwright persistent context, Xvfb execution, Base64 HTML report generation, SHA256 hashing, and fixture/live servers.
   - Master runner `run-all-extension-tests.ts` requires fixes for PATH resolution (`npx tsx` / `./node_modules/.bin/tsx`) and server port lifecycle management (reusing server instances or adding dynamic port allocation / delay).
   - `visual-agent/fixtures/pje-com-iframe.html` line 16 has a bad relative path (`/fixtures/painel-tarefas-tabela.html`) that must be fixed to `painel-tarefas-tabela.html`.
2. **Coverage State**:
   - Current extension E2E suite provides ~25 test assertions.
   - Total gap to reach 390+ test assertions across Tier 1 (175), Tier 2 (175), Tier 3 (35), and Tier 4 (5) is approximately 365 test cases.

---

## 5. Verification Method

To independently verify these investigation findings:

1. **Unit & DOM Tests**:
   `npm test`
   Expected result: 6 test files passed, 15 tests passed.

2. **Extension Build**:
   `npm run build`
   Expected result: Builds `extension/dist/` without errors.

3. **Visual Proof Agent Xvfb Execution**:
   `npm run visual:xvfb`
   Expected result: Generates screenshots 000-007, SHA256 hashes, Base64 HTML report at `artifacts/sessions/session_<ts>/index.html`, and exits 0.

4. **Master Extension Test Runner Verification**:
   `npm run test:extension`
   Observed failure: Fails with `EADDRINUSE 127.0.0.1:49155` or `tsx: not found` due to PATH and server lifecycle issues in `run-all-extension-tests.ts`.

---

## 6. Recommendations for Test Writer

1. **Fix Infrastructure Issues in `tests/extension/` and `visual-agent/`**:
   - Fix `fixtures/pje-com-iframe.html` line 16: change `src="/fixtures/painel-tarefas-tabela.html"` to `src="painel-tarefas-tabela.html"`.
   - Update `tests/extension/helpers/extension-runner-helper.ts`: share a single singleton fixture server instance across specs or check if server is already listening before starting.
   - Update `tests/extension/run-all-extension-tests.ts`: change `xvfbCmd` to use `npx tsx` or `./node_modules/.bin/tsx`. Ensure all spec scripts end with `process.exit(0)` or export runnable functions called by a single test runner process.

2. **Implement Complete Tier 1 Suite (175 Specs)**:
   - Create spec files under `tests/extension/specs/tier1/` organized by feature groups:
     - `tier1-toolbar.spec.ts` (30 specs for CTRL-TB-01 to 06)
     - `tier1-drawer.spec.ts` (25 specs for CTRL-DW-01 to 05)
     - `tier1-modal.spec.ts` (15 specs for CTRL-MD-01 to 03)
     - `tier1-options.spec.ts` (5 specs for CTRL-OP-01)
     - `tier1-badges.spec.ts` (15 specs for CTRL-BG-01 to 03)
     - `tier1-popup.spec.ts` (35 specs for CTRL-POPUP-01 to 06 & PING)
     - `tier1-infra.spec.ts` (50 specs for features 26-35)

3. **Implement Complete Tier 2 Suite (175 Specs)**:
   - Create spec files under `tests/extension/specs/tier2/` covering boundary & corner cases (empty strings, special CNJ characters, rapid toggling, storage overflow, missing DOM elements, hidden iframe states).

4. **Implement Tier 3 Pairwise Combinatorial Suite (35 Specs)**:
   - Create `tests/extension/specs/tier3/pairwise-combinations.spec.ts` covering multi-feature interactions (e.g. search + overdue filter + score reorder + CSV export).

5. **Implement Tier 4 Real-World Scenarios (5 Scenarios)**:
   - Create `tests/extension/specs/tier4/real-world-scenarios.spec.ts` covering the 5 end-to-end scenarios detailed in `TEST_INFRA.md`.
