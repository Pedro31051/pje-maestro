## 2026-08-01T03:11:13Z
You are the Test Writer subagent for the E2E Testing Track.
Working directory: /antigravity-workspace/.agents/test_writer_e2e_1
Read:
- /antigravity-workspace/.agents/ORIGINAL_REQUEST.md
- /antigravity-workspace/PROJECT.md
- /antigravity-workspace/TEST_INFRA.md
- /antigravity-workspace/.agents/explorer_e2e_1/handoff.md

Your task is to fix E2E test infrastructure bugs and write the complete Tier 1, Tier 2, Tier 3, and Tier 4 test suite specs covering all 35 features:

1. **Fix Test Infrastructure Flaws**:
   - Fix relative path in `visual-agent/fixtures/pje-com-iframe.html`: line 16 `src="/fixtures/painel-tarefas-tabela.html"` -> `src="painel-tarefas-tabela.html"`.
   - Fix server port collision and socket cleanup in `tests/extension/helpers/extension-runner-helper.ts` (ensure server port 49155/49160 doesn't crash on `EADDRINUSE` between spec runs).
   - Fix master runner `tests/extension/run-all-extension-tests.ts` to execute all spec files cleanly using `npx tsx` / `./node_modules/.bin/tsx` or a unified test runner.

2. **Implement Complete Test Suites**:
   - **Tier 1 (Feature Coverage)**: Create test specs covering all 35 features from `TEST_INFRA.md` (175+ assertions total across toolbar, drawer, modals, options, DOM badges, popup UI, SW ping, Xvfb visual agent, SHA256 hashing, live dashboard, build artifacts).
   - **Tier 2 (Boundary & Corner Cases)**: Create test specs covering boundary cases, zero/empty inputs, non-existent search queries, rapid clicking, hidden elements, special CNJ characters, overflow, storage resets (175+ assertions total).
   - **Tier 3 (Pairwise Cross-Feature Combinations)**: Create test specs for multi-feature interaction workflows (35+ assertions total, e.g. reorder + overdue filter + search + drawer toggle + CSV export + popup state sync).
   - **Tier 4 (Real-World Application Scenarios)**: Create test specs for the 5 realistic application scenarios defined in `TEST_INFRA.md` (Secret process priority processing, legacy iframe coexistence, visual audit pipeline 000-007, high-volume process table stress test, extension production build sync).

3. **Execution Verification**:
   - Execute `npm test` to verify Vitest unit/DOM tests pass.
   - Execute `npm run build` to verify Vite extension build compiles cleanly.
   - Execute `npm run test:extension` (or `npx tsx tests/extension/run-all-extension-tests.ts`) to verify all 4 tiers of test specs run under Xvfb and PASS 100%.

Report all implemented files, test counts per tier, and build/test execution results in `/antigravity-workspace/.agents/test_writer_e2e_1/handoff.md`.
