# Technical Review & Audit Plan — PJe Maestro Chrome Extension & Visual Proof Agent

## Overview
This document outlines the orchestrator plan for executing a comprehensive technical audit, visual verification, testing, and GitHub repository synchronization for the PJe Maestro Chrome Manifest V3 extension and its Visual Proof Agent.

## Phase 0: Survey & Scope Mapping (In Progress)
- **Explorer 1**: Survey Extension Architecture & 18+ Controls (CTRL-TB-*, CTRL-DW-*, CTRL-MD-*, CTRL-OP-*, CTRL-BG-*, CTRL-POPUP-*).
- **Explorer 2**: Survey Visual Proof Agent, Playwright setup, Linux/Xvfb requirements, Base64 HTML report generator, and Live Dashboard server.
- **Explorer 3**: Survey Git repo status, remote sync, production build scripts, test inventory (`EXTENSION_TEST_INVENTORY.md`), and validation report (`EXTENSION_VALIDATION_REPORT.md`).

## Phase 1: Feature Inventory & Decomposition (PROJECT.md)
Synthesize findings from Phase 0 Explorers into `/antigravity-workspace/PROJECT.md`:
- Feature Inventory table with 100% control assignment.
- Architecture and module boundaries.
- Milestone decomposition.

## Phase 2: Dual Track Execution
### Track 1: E2E Testing & Visual Evidence Track
- Verify/Harden Playwright E2E test suite running under Xvfb on Linux.
- Validate live dashboard endpoint (`http://127.0.0.1:49160/live`) and PJe mock server.
- Ensure 000-007 numeric screenshots, SHA256 hashes, and self-contained Base64 `index.html` report.
- Publish `TEST_READY.md`.

### Track 2: Extension Resiliency & Controls Track
- Verify 100% pass rate for 18+ controls across PJe screens (tables, cards, iframes, secret processes).
- Verify zero console exceptions/freezes in Action Popup UI, injected bar (`#pje-maestro-host`), side drawer, modals, and toolbar filters.
- Ensure unit and DOM tests pass via `npm test` and `npm run test:extension`.

## Phase 3: Production Build & Documentation Sync
- Execute production build targeting `extension/dist/`.
- Update/generate `EXTENSION_TEST_INVENTORY.md` and `EXTENSION_VALIDATION_REPORT.md`.
- Synchronize all commits, builds, and artifacts with remote repo (`https://github.com/Pedro31051/pje-maestro.git`).

## Phase 4: Final Gate & Forensic Audit
- Dispatch `teamwork_preview_auditor` for integrity verification.
- Verify binary veto (CLEAN status).
- Deliver final report to user/parent agent.
