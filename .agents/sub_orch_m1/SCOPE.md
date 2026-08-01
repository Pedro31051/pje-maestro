# Scope: Milestone 1 — PJe Maestro Extension Controls & Resiliency

## Architecture & Boundaries
- **Extension Monorepo Target**: `/antigravity-workspace/extension`
- **Core Components**:
  - Shadow DOM UI Encapsulation (`#pje-maestro-host` with open Shadow DOM root)
  - DOM Adapters (`PJeTarefasAdapter`, `PJeAutosAdapter`, `PJeIframeAdapter`)
  - Runtime Messaging & Popup Action UI
  - Options Page & Storage Engine
- **Test Target**: Unit, DOM, and extension tests (`npm test` and `npm run test:extension`)

## Control Inventory (25 Controls)
| Control ID | Element Selector / ID | Description | Component | Target Status |
|------------|-----------------------|-------------|-----------|---------------|
| CTRL-TB-01 | `#btn-reorder` | Toolbar Reorder processes by score | Toolbar UI | PENDING |
| CTRL-TB-02 | `#btn-vencidos` | Toolbar Toggle overdue filter | Toolbar UI | PENDING |
| CTRL-TB-03 | `#btn-next` | Toolbar Focus top process | Toolbar UI | PENDING |
| CTRL-TB-04 | `#btn-restore` | Toolbar Restore original order | Toolbar UI | PENDING |
| CTRL-TB-05 | `#btn-csv` | Toolbar Export UTF-8 CSV | Toolbar UI | PENDING |
| CTRL-TB-06 | `#btn-drawer` | Toolbar Toggle side drawer | Toolbar UI | PENDING |
| CTRL-DW-01 | `#btn-close-drawer` | Drawer Close side drawer | Drawer UI | PENDING |
| CTRL-DW-02 | `#queue-search` | Drawer Search processes filter | Drawer UI | PENDING |
| CTRL-DW-03 | `#queue-status-filter` | Drawer Status filter | Drawer UI | PENDING |
| CTRL-DW-04 | `.input-deadline` | Card Set custom deadline | Card UI | PENDING |
| CTRL-DW-05 | `.select-priority` | Card Set local priority | Card UI | PENDING |
| CTRL-MD-01 | `#modal-note-text` | Modal Capture process note | Modal UI | PENDING |
| CTRL-MD-02 | `#modal-save` | Modal Save note to storage | Modal UI | PENDING |
| CTRL-MD-03 | `#modal-cancel` | Modal Cancel note dialog | Modal UI | PENDING |
| CTRL-OP-01 | `#btn-clear-logs` | Options Clear audit logs | Options UI | PENDING |
| CTRL-BG-01 | `.badge-score` | DOM Render score badge | DOM UI | PENDING |
| CTRL-BG-02 | `.badge-overdue` | DOM Render overdue warning badge | DOM UI | PENDING |
| CTRL-BG-03 | `.badge-today` | DOM Render due-today badge | DOM UI | PENDING |
| CTRL-POPUP-01 | `#btn-popup-reorder` | Popup Reorder trigger | Action Popup | PENDING |
| CTRL-POPUP-02 | `#btn-popup-vencidos` | Popup Overdue filter trigger | Action Popup | PENDING |
| CTRL-POPUP-03 | `#btn-popup-next` | Popup Open next trigger | Action Popup | PENDING |
| CTRL-POPUP-04 | `#btn-popup-drawer` | Popup Drawer trigger | Action Popup | PENDING |
| CTRL-POPUP-05 | `#btn-popup-csv` | Popup Export CSV trigger | Action Popup | PENDING |
| CTRL-POPUP-06 | `#btn-popup-options` | Popup Open options trigger | Action Popup | PENDING |
| CTRL-POPUP-PING | `#btn-ping-sw` | Popup Service worker runtime ping | Action Popup | PENDING |

## Milestone Deliverables & Verification Criteria
1. **100% Pass Rate for 25 Controls**: All 25 controls function without error, properly hooked into runtime engines and storage.
2. **Shadow DOM Isolation**: `#pje-maestro-host` properly encapsulates extension toolbar, drawer, modals, badges, and styles.
3. **DOM Adapter Resiliency**: Adapters (`PJeTarefasAdapter`, `PJeAutosAdapter`, `PJeIframeAdapter`) safely handle missing elements, secret processes, iframe context switches, and unexpected DOM structures without console exceptions.
4. **Zero Console Exceptions**: Clean execution across popup, options, content script, and service worker.
5. **Test Suite Verification**: Unit/DOM tests (`npm test`) and extension E2E/DOM suite (`npm run test:extension`) execute and pass cleanly.

## Milestone Status
Status: **IN_PROGRESS**
Iteration: 1
