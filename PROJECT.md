# Project: PJe Maestro Chrome Manifest V3 Extension & Visual Proof Agent Technical Review & Audit

## Architecture
- **Monorepo Layout**: Root package.json with workspaces `["extension", "visual-agent"]`.
- **Extension Component (`extension/`)**:
  - **Manifest V3 Specification**: Manifest version 3 (`manifest.json`). Service worker background process (`src/background/service-worker.ts`), Action Popup UI (`src/popup/popup.ts`), Options Page (`src/options/options.ts`).
  - **Content Script & IIFE Bundling**: Content script bootstrap (`src/content/bootstrap.ts`) compiled via Vite (`vite.config.ts`) into self-contained IIFE format (`dist/src/content/bootstrap.js`) to eliminate top-level ES module import syntax errors in Chrome MV3.
  - **DOM Encapsulation**: Injected DOM host (`#pje-maestro-host`) creating an open Shadow DOM root (`shadow-root.ts`) isolating extension styles (`styles.css`) from PJe tribunal CSS.
  - **Core Engines**: Pure modular TypeScript engines for ranking (`ranking-engine.ts`), filtering (`filter-engine.ts`), deadline calculation (`deadline-engine.ts`), and CNJ parsing (`parser-cnj.ts`).
  - **Adapters**: Target DOM adapters for PJe tables (`pje-tarefas-adapter.ts`), cards (`PJeAutosAdapter`), and legacy iframe contexts (`pje-iframe-adapter.ts`).
- **Visual Proof Agent Component (`visual-agent/`)**:
  - **Xvfb Linux Runner**: Playwright framework running in headed Chromium context under Xvfb (`xvfb-run -s '-screen 0 1440x900x24' tsx src/runner.ts`).
  - **Evidence Pipeline**: Captures 3-digit zero-padded step screenshots (`000` to `007`), computes SHA256 hashes, sanitizes URLs, and embeds Base64 Data URIs into self-contained `index.html` report.
  - **Servers**: Local PJe fixture server on port `49155` and Live Telemetry Dashboard on port `49160` (`/live`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Toolbar Reorder Control | `CTRL-TB-01` (`#btn-reorder`): Reorders DOM items by score | M1 | survey |
| 2 | Toolbar Overdue Filter | `CTRL-TB-02` (`#btn-vencidos`): Toggles overdue process filter | M1 | survey |
| 3 | Toolbar Next Process | `CTRL-TB-03` (`#btn-next`): Focuses top score process with highlight | M1 | survey |
| 4 | Toolbar Restore Order | `CTRL-TB-04` (`#btn-restore`): Restores original DOM order | M1 | survey |
| 5 | Toolbar CSV Export | `CTRL-TB-05` (`#btn-csv`): Exports UTF-8 BOM CSV process report | M1 | survey |
| 6 | Toolbar Toggle Drawer | `CTRL-TB-06` (`#btn-drawer`): Toggles side drawer visibility | M1 | survey |
| 7 | Drawer Close Control | `CTRL-DW-01` (`#btn-close-drawer`): Closes side drawer panel | M1 | survey |
| 8 | Drawer Search Filter | `CTRL-DW-02` (`#queue-search`): Filters processes by search query | M1 | survey |
| 9 | Drawer Status Filter | `CTRL-DW-03` (`#queue-status-filter`): Filters by pending/completed status | M1 | survey |
| 10 | Card Local Deadline | `CTRL-DW-04` (`.input-deadline`): Sets custom process deadline | M1 | survey |
| 11 | Card Local Priority | `CTRL-DW-05` (`.select-priority`): Sets local priority score weight | M1 | survey |
| 12 | Modal Note Input | `CTRL-MD-01` (`#modal-note-text`): Captures custom process note text | M1 | survey |
| 13 | Modal Save Control | `CTRL-MD-02` (`#modal-save`): Persists note to storage | M1 | survey |
| 14 | Modal Cancel Control | `CTRL-MD-03` (`#modal-cancel`): Closes modal without saving | M1 | survey |
| 15 | Options Clear Logs | `CTRL-OP-01` (`#btn-clear-logs`): Clears audit log history in storage | M1 | survey |
| 16 | DOM Score Badges | `CTRL-BG-01` (`.badge-score`): Renders process score badge in DOM | M1 | survey |
| 17 | DOM Overdue Badges | `CTRL-BG-02` (`.badge-overdue`): Renders overdue warning badge | M1 | survey |
| 18 | DOM Today Badges | `CTRL-BG-03` (`.badge-today`): Renders due-today warning badge | M1 | survey |
| 19 | Popup Reorder Button | `CTRL-POPUP-01` (`#btn-popup-reorder`): Action popup reorder trigger | M1 | survey |
| 20 | Popup Overdue Filter | `CTRL-POPUP-02` (`#btn-popup-vencidos`): Action popup overdue filter | M1 | survey |
| 21 | Popup Next Process | `CTRL-POPUP-03` (`#btn-popup-next`): Action popup open-next trigger | M1 | survey |
| 22 | Popup Toggle Drawer | `CTRL-POPUP-04` (`#btn-popup-drawer`): Action popup drawer trigger | M1 | survey |
| 23 | Popup CSV Export | `CTRL-POPUP-05` (`#btn-popup-csv`): Action popup CSV export trigger | M1 | survey |
| 24 | Popup Open Options | `CTRL-POPUP-06` (`#btn-popup-options`): Action popup open options page | M1 | survey |
| 25 | Popup Ping Service Worker | `CTRL-POPUP-PING` (`#btn-ping-sw`): Action popup runtime messaging ping | M1 | survey |
| 26 | Xvfb Headed Linux Execution | Playwright execution in Linux headless env using Xvfb buffer | M2 | survey |
| 27 | Numeric Screenshot Sequence | Steps 000 through 007 zero-padded image generation | M2 | survey |
| 28 | Cryptographic SHA256 Hashes | SHA256 checksum calculation for each evidence screenshot | M2 | survey |
| 29 | Self-Contained HTML Report | `index.html` report with embedded Base64 image Data URIs | M2 | survey |
| 30 | Live Dashboard Stream | Telemetry dashboard server (`http://127.0.0.1:49160/live`) | M2 | survey |
| 31 | PJe Mock Fixture Server | PJe tribunal HTML fixture server (`http://127.0.0.1:49155`) | M2 | survey |
| 32 | Extension Production Build | Vite bundling into `extension/dist/` (IIFE + ES formats) | M3 | survey |
| 33 | Test Inventory Documentation | `EXTENSION_TEST_INVENTORY.md` updated with control matrix | M3 | survey |
| 34 | Validation Report Document | `EXTENSION_VALIDATION_REPORT.md` with final verdict | M3 | survey |
| 35 | Remote GitHub Sync | Sync commits, dist/, and docs with github.com/Pedro31051/pje-maestro.git | M3 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | PJe Maestro Extension Controls & Resiliency | Audit and verify 25 controls, Shadow DOM UI, adapter error resilience across PJe screens, unit & DOM tests (`npm test`) | none | IN_PROGRESS |
| M2 | Visual Proof Agent & Evidence Suite | Run Playwright Xvfb visual suite (`npm run visual:xvfb`), verify screenshots 000-007, SHA256 hashes, Base64 embedded HTML report, and live dashboard | M1 | PLANNED |
| M3 | Production Build, Documentation & GitHub Sync | Generate `extension/dist/`, verify `EXTENSION_TEST_INVENTORY.md` & `EXTENSION_VALIDATION_REPORT.md`, verify remote git sync | M1, M2 | PLANNED |

## Interface Contracts
### Content Script ↔ Service Worker (MV3 Runtime Messaging)
- `PING` -> `{ type: 'PING' }` => Response: `{ status: 'PONG', timestamp: number }`
- `GET_SETTINGS` -> `{ type: 'GET_SETTINGS' }` => Response: `{ settings: UserSettings }`
- `UPDATE_SETTINGS` -> `{ type: 'UPDATE_SETTINGS', payload: Partial<UserSettings> }` => Response: `{ success: boolean }`

### Popup UI ↔ Content Script (Tab Messaging)
- Reorder: `{ action: 'reorder' }`
- Overdue Filter: `{ action: 'filter_vencidos' }`
- Open Next: `{ action: 'open_next' }`
- Toggle Drawer: `{ action: 'toggle_drawer' }`
- Export CSV: `{ action: 'export_csv' }`

## Code Layout
- `extension/`
  - `manifest.json` (Chrome Manifest V3)
  - `vite.config.ts` (Vite build configuration for IIFE & ES targets)
  - `src/background/service-worker.ts` (MV3 Background Service Worker)
  - `src/content/bootstrap.ts` (Content Script Entry Point)
  - `src/ui/` (Shadow DOM host, toolbar, drawer, modals, badges, styles)
  - `src/adapters/` (PJe table adapter, cards adapter, iframe adapter, router)
  - `src/core/` (Ranking engine, filter engine, deadline engine, CNJ parser)
  - `src/popup/` (Extension Action Popup UI)
  - `src/options/` (Extension Options Page)
  - `dist/` (Compiled production extension bundle)
- `visual-agent/`
  - `playwright.config.ts` (Playwright E2E configuration)
  - `src/runner.ts` (Visual Proof Agent runner)
  - `src/screenshot-capture.ts` (000-007 screenshot capturer)
  - `src/step-reporter.ts` (SHA256 hasher & event recorder)
  - `src/artifact-index.ts` (Base64 embedded HTML report generator)
  - `src/live-server.ts` (Live dashboard telemetry server port 49160)
  - `src/pje-fixture-server.ts` (PJe mock HTML fixture server port 49155)
  - `fixtures/` (Mock HTML PJe tribunal pages)
- `tests/extension/`
  - `run-all-extension-tests.ts` (Extension E2E test suite runner under Xvfb)
  - `specs/` (Playwright E2E spec files)
