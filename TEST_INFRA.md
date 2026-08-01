# E2E Test Infra: PJe Maestro & Visual Proof Agent

## Test Philosophy
- Opaque-box, requirement-driven end-to-end testing for Chrome Manifest V3 PJe Maestro extension and Visual Proof Agent.
- Methodology: Category-Partition + BVA + Pairwise Combinatorial + Real-World Workload Testing.
- Target: Verify all 35 features across 4 tiers of automated test cases.

## Feature Inventory & Test Coverage Matrix
| # | Feature | Source | Tier 1 (Feature) | Tier 2 (Boundary/Corner) | Tier 3 (Pairwise) | Tier 4 (Real World) |
|---|---------|--------|:----------------:|:-----------------------:|:-----------------:|:------------------:|
| 1 | Toolbar Reorder Control (`CTRL-TB-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 2 | Toolbar Overdue Filter (`CTRL-TB-02`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 3 | Toolbar Next Process (`CTRL-TB-03`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 4 | Toolbar Restore Order (`CTRL-TB-04`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 5 | Toolbar CSV Export (`CTRL-TB-05`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 6 | Toolbar Toggle Drawer (`CTRL-TB-06`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 7 | Drawer Close Control (`CTRL-DW-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 8 | Drawer Search Filter (`CTRL-DW-02`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 9 | Drawer Status Filter (`CTRL-DW-03`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 10 | Card Local Deadline (`CTRL-DW-04`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 11 | Card Local Priority (`CTRL-DW-05`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 12 | Modal Note Input (`CTRL-MD-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 13 | Modal Save Control (`CTRL-MD-02`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 14 | Modal Cancel Control (`CTRL-MD-03`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 15 | Options Clear Logs (`CTRL-OP-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 16 | DOM Score Badges (`CTRL-BG-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 17 | DOM Overdue Badges (`CTRL-BG-02`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 18 | DOM Today Badges (`CTRL-BG-03`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 19 | Popup Reorder Button (`CTRL-POPUP-01`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 20 | Popup Overdue Filter (`CTRL-POPUP-02`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 21 | Popup Next Process (`CTRL-POPUP-03`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 22 | Popup Toggle Drawer (`CTRL-POPUP-04`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 23 | Popup CSV Export (`CTRL-POPUP-05`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 24 | Popup Open Options (`CTRL-POPUP-06`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 25 | Popup Ping SW (`CTRL-POPUP-PING`) | R1 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 26 | Xvfb Headed Linux Execution | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 27 | Numeric Screenshot Sequence (000-007) | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 28 | Cryptographic SHA256 Hashes | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 29 | Self-Contained HTML Report (Base64) | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 30 | Live Dashboard Stream (49160) | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 31 | PJe Mock Fixture Server (49155) | R2 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 32 | Extension Production Build (`dist/`) | R3 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 33 | Test Inventory Doc (`EXTENSION_TEST_INVENTORY.md`) | R3 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 34 | Validation Report Doc (`EXTENSION_VALIDATION_REPORT.md`) | R3 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |
| 35 | Remote GitHub Sync (https://github.com/Pedro31051/pje-maestro.git) | R3 / PROJECT.md §16 | 5 specs | 5 specs | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Playwright with tsx / vitest / Node test runner under Xvfb. Command: `npm test` and `npm run test:extension` and `npm run visual:xvfb`.
- **Directory Layout**:
  - `tests/extension/specs/`: Extension E2E test specs (Tiers 1, 2, 3, 4)
  - `visual-agent/`: Visual Proof Agent E2E runner & fixture servers
  - `tests/extension/run-all-extension-tests.ts`: Orchestrated runner executing all 4 tiers

## Real-World Application Scenarios (Tier 4)
1. **Tier 4 Scenario 1: PJe Legal Secret Process Priority Processing**: Mock confidential process handling with overdue filter, custom deadline setting, note saving, and CSV audit export.
2. **Tier 4 Scenario 2: Legacy Iframe & Shadow DOM Coexistence**: Multi-frame PJe tribunal page navigation with injected `#pje-maestro-host` drawer toggling and popup synchronization.
3. **Tier 4 Scenario 3: Visual Audit Pipeline Full Lifecycle**: Headed Playwright run capturing 000-007 screenshots, verifying SHA256 integrity, embedding Base64 images into `index.html`, and serving live telemetry on port 49160.
4. **Tier 4 Scenario 4: High-Volume Process Table Reordering & Search**: Stress-testing toolbar reorder, search filter, status filter, and order restoration across 100+ process elements.
5. **Tier 4 Scenario 5: Extension Build & GitHub Sync Validation**: Verifying clean bundle artifacts in `extension/dist/` and report synchronization.

## Coverage Thresholds
- Tier 1: 5 test cases per feature (35 features * 5 = 175 test assertions/specs minimum)
- Tier 2: 5 boundary/corner cases per feature (175 specs minimum)
- Tier 3: Pairwise feature combination tests (35+ specs)
- Tier 4: 5 Real-world application scenarios (5 end-to-end scenarios)
- **Total Minimum Threshold**: 390+ test cases/assertions verified across the suite.
