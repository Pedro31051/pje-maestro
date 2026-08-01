## 2026-08-01T03:14:31Z
You are Test Writer subagent 2 for the E2E Testing Track (Remediation Iteration 2).
Working directory: /antigravity-workspace/.agents/test_writer_e2e_2
Read:
- /antigravity-workspace/.agents/ORIGINAL_REQUEST.md
- /antigravity-workspace/PROJECT.md
- /antigravity-workspace/TEST_INFRA.md
- /antigravity-workspace/.agents/reviewer_e2e_1/handoff.md
- /antigravity-workspace/.agents/reviewer_e2e_2/handoff.md
- /antigravity-workspace/.agents/sub_orch_e2e/GATE_STATUS.md

Your mission is to REMEDIATE ALL INTEGRITY VIOLATIONS AND TEST EXECUTION FAILURES:

1. **Fix Chromium Profile Locking Bug**:
   - Update `tests/extension/helpers/extension-runner-helper.ts` line 56. Replace static `scratch/test_chrome_profile` with dynamic unique profile directories (e.g. using `fs.mkdtempSync(path.join(__dirname, '../../../scratch/test_chrome_profile_'))`).
   - In `teardown()`, clean up the dynamic temporary profile directory (`fs.rmSync(profilePath, { recursive: true, force: true })`).

2. **REPLACE ALL HARDCODED `true` ASSERTIONS WITH GENUINE DOM / BROWSER ASSERTIONS**:
   - In `tests/extension/specs/tier1-features.spec.ts`: Inspect every single call to `helper.recordResult`. Remove hardcoded `true` boolean literals. Use Playwright locators, Shadow DOM queries, attribute checks, class checks, text content checks, local storage reads, or background worker pings.
   - In `tests/extension/specs/tier2-boundaries.spec.ts`: Replace all hardcoded `true` literals across boundary tests with real checks (verifying empty search results, zero elements, boundary dates, missing DOM handles, error notifications, storage resets).
   - In `tests/extension/specs/tier3-pairwise.spec.ts`: DELETE the dummy `for (let i = 6; i <= 35; i++)` loop entirely. Implement genuine Playwright browser automation workflows for all 35 pairwise combinations (T3-01 to T3-35), testing real interactions (reorder + overdue filter + search query, priority update + note save + CSV export, popup state sync, drawer open/close + badge updates, etc.).
   - In `tests/extension/specs/tier4-scenarios.spec.ts`: Verify that all 5 Tier 4 scenarios perform genuine step-by-step browser interactions and validate actual UI and state outcomes.

3. **Verify Clean Execution**:
   - Run `npm test` to verify Vitest unit & DOM tests pass.
   - Run `npm run build` to verify Vite extension build compiles cleanly.
   - Run `npm run test:extension` (or `npx tsx tests/extension/run-all-extension-tests.ts`) to verify that all 8 spec files run under Xvfb sequentially without ANY profile lock crashes, WITHOUT hardcoded true assertions, and exit cleanly with exit code 0.

Write your remediation report to `/antigravity-workspace/.agents/test_writer_e2e_2/handoff.md`.
