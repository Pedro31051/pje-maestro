# DOM Adapters Resiliency & PJe Screen Variants Investigation Report

**Milestone**: Milestone 1  
**Agent**: Explorer 2 (`/antigravity-workspace/.agents/explorer_m1_2`)  
**Date**: 2026-08-01  
**Status**: COMPLETE  

---

## Executive Summary

A comprehensive, read-only technical audit of DOM Adapters (`PJeTarefasAdapter`, `PJeAutosAdapter`, `pje-iframe-adapter.ts`, `pje-router.ts`), Core Engines (`parser-cnj.ts`, `ranking-engine.ts`, `filter-engine.ts`, `deadline-engine.ts`), Actions, UI decorators, and Mutation Observer logic was conducted.

While all unit tests (`npm test`) currently pass for baseline scenarios (15/15 tests passing), critical resiliency vulnerabilities were uncovered that will cause uncaught console exceptions, infinite re-render loops, metadata loss, and failed initialization on actual Brazilian tribunal PJe variants (TRT, TRF, TJ, PJe KZ, legacy JSF/RichFaces).

---

## 1. Observation

Direct observations from codebase inspection (file paths, exact line numbers, verbatim code snippets):

### Obs 1.1: Uncaught Exception Risk in `pje-base-adapter.ts` (Line 35) & `pje-tarefas-adapter.ts` (Lines 45, 51, 83, 86)
- **File**: `extension/src/adapters/pje-base-adapter.ts:35`
  ```typescript
  isConfidential: el.classList.contains('sigiloso') || el.innerText.toLowerCase().includes('segredo de justiça'),
  ```
  *Issue*: `el.innerText` is accessed directly without fallback. If `el` is a non-`HTMLElement` (e.g., SVGElement, disconnected node, or custom element mock where `innerText` is `undefined`), calling `.toLowerCase()` throws an uncaught `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.
- **File**: `extension/src/adapters/pje-tarefas-adapter.ts:45, 51, 83, 86`
  ```typescript
  const taskName = taskEl ? (taskEl as HTMLElement).innerText.trim() : 'Minhas Tarefas';
  const tags = tagEls.map(t => (t as HTMLElement).innerText.trim()).filter(Boolean);
  ```
  *Issue*: Unconditional `.trim()` call on `(taskEl as HTMLElement).innerText`. If `innerText` is `undefined`, calling `.trim()` throws an uncaught `TypeError: Cannot read properties of undefined (reading 'trim')`.

### Obs 1.2: Random ID Fallback Causes Metadata Loss for Non-CNJ / Confidential Processes
- **File**: `extension/src/adapters/pje-base-adapter.ts:22-23`
  ```typescript
  const id = cnj || `elem-${index}-${Math.random().toString(36).substring(2, 7)}`;
  const localMeta: LocalMetadata = localStore[id] || localStore[cnj || ''] || {};
  ```
  *Issue*: When `cnj` is `null` (common in confidential/sigiloso processes or non-standard rows), `id` generates a random string via `Math.random()`. Every time `extractRecords` runs (on DOM mutations, filter changes, drawer interactions), a **new random ID** is assigned. As a result, all local metadata (custom deadline, local priority, notes, status, pinning) associated with non-CNJ/confidential processes is permanently lost on the next render cycle.

### Obs 1.3: Dead Code in IFrame Adapter (`pje-iframe-adapter.ts`) and Unused Frame Detector (`frame-detector.ts`)
- **File**: `extension/src/adapters/pje-iframe-adapter.ts:1-17`
  `detectAndInspectIFrames(doc: Document)` is exported but **never imported or called** anywhere in `bootstrap.ts`, `pje-router.ts`, or any content script.
- **File**: `extension/src/content/frame-detector.ts:1-15`
  `isTopWindow()` and `getFrameIdentity()` are exported but **never imported or used** in `bootstrap.ts`.
- **File**: `extension/src/content/bootstrap.ts:21-25`
  `bootstrap.ts` only resolves adapter against `document` (top level). When running inside an iframe (due to `all_frames: true` in `manifest.json`), `renderToolbar()` and `renderQueuePanel()` inject `#pje-maestro-host` inside the sub-frame document body, causing toolbar/drawer UI clipping and clipping in overflow-hidden containers.

### Obs 1.4: Infinite Observer Loop in Mutation Observer (`mutation-observer.ts` & `bootstrap.ts`)
- **File**: `extension/src/content/mutation-observer.ts:11-15`
  ```typescript
  observer.observe(target, { childList: true, subtree: true, attributes: false });
  ```
- **File**: `extension/src/content/bootstrap.ts:111-116`
  ```typescript
  setupDOMObserver(container, () => { refreshUI(); });
  ```
- **File**: `extension/src/ui/badges.ts:37-38`
  ```typescript
  targetCol.appendChild(badgeContainer);
  ```
  *Issue*: `setupDOMObserver` listens for `childList` changes on `container` with `subtree: true`. `refreshUI()` calls `injectRowBadges()`, which appends `.pje-maestro-badge-container` nodes directly into children of `container`. Appending these badge elements is a `childList` mutation inside `container`, which re-triggers the `MutationObserver`! This creates an **endless 300ms re-render feedback loop** consuming CPU and thrasher-updating DOM elements continuously.

### Obs 1.5: Unchecked Process Record Header Row Ingestion in Table Adapters
- **File**: `extension/src/adapters/pje-tarefas-adapter.ts:37`
  ```typescript
  const rows = Array.from(container.querySelectorAll<HTMLElement>('tr.linha-processo, tr[data-cnj], tbody tr'));
  ```
  *Issue*: Selecting `tbody tr` matches table header rows (`<tr><th>Processo</th>...</tr>`), pagination rows, and loading rows. Because `extractCNJ` returns `null` for header text, the adapter creates a synthetic `ProcessRecord` for the header row. During `executeVisualReorder()`, the table `<th>` header row gets sorted alongside process rows, breaking table structure!

### Obs 1.6: Unhandled Date Parsing Errors Leading to `NaN` Score Corruption
- **File**: `extension/src/core/deadline-engine.ts:16-20`
  ```typescript
  const target = new Date(deadlineDateStr);
  const diffTime = target.getTime() - now.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
  ```
- **File**: `extension/src/core/ranking-engine.ts:27`
  ```typescript
  score += rules.overdueBonus + (Math.abs(deadlineStatus.daysRemaining || 0) * 100);
  ```
  *Issue*: If `deadlineDateStr` is malformed or invalid (e.g. `"invalid"` or unformatted string), `new Date(deadlineDateStr)` produces an `Invalid Date` where `getTime()` returns `NaN`. `daysRemaining` becomes `NaN`. In `rankingEngine`, `Math.abs(NaN || 0)` evaluates to `NaN`. Adding `NaN` to `score` makes `record.score` `NaN`. Sorting records with `NaN` score fails silently, resulting in corrupted or non-deterministic process ordering.

### Obs 1.7: Unused `isConfidential` Property & Missing Secret Process Variants
- **File**: `extension/src/adapters/pje-base-adapter.ts:35`
- **File**: `extension/src/core/process-record.ts:22`
  *Issue*: `isConfidential` is set on `ProcessRecord`, but it is **never referenced** in `rankingEngine`, `filterEngine`, `renderQueuePanel`, `badges.ts`, `export-csv.ts`, or `audit-log.ts`. Confidencial processes are exported with raw text in CSV, badges do not redact sensitive details, and detection misses real-world tribunal markers such as `processo-sigiloso`, `label-sigilo`, `badge-sigilo`, `<i class="fa-lock">`, `data-sigilo="true"`, and unaccented `segredo de justica`.

---

## 2. Logic Chain

1. **From Obs 1.1 & Obs 1.6**:
   - Adapters operate directly on DOM element properties (`innerText`) without safe nullish access or fallbacks.
   - Core engines accept string inputs for dates and CNJs without validating return types or NaN values.
   - *Conclusion*: Missing defensive wrappers will cause uncaught JavaScript exceptions in production browser environments whenever a tribunal alters HTML structure or injects unexpected nodes.

2. **From Obs 1.2 & Obs 1.7**:
   - Non-CNJ processes and secret/confidential processes have no valid CNJ string.
   - Using `Math.random()` in `buildRecordFromElement` creates a brand-new ID on every DOM scan.
   - *Conclusion*: Process metadata (notes, deadlines, custom priority, status) cannot persist for secret processes across re-renders. Furthermore, secret processes are not masked in CSV exports or UI panels.

3. **From Obs 1.4**:
   - `setupDOMObserver` watches all subtree additions under `container`.
   - `refreshUI` calls `injectRowBadges`, which mutates the DOM tree inside `container`.
   - *Conclusion*: DOM mutations performed by PJe Maestro itself trigger the mutation observer, causing an infinite execution loop every 300ms in live execution.

4. **From Obs 1.3**:
   - Iframe detection module (`pje-iframe-adapter.ts`) and top-window check (`frame-detector.ts`) are decoupled and uncalled.
   - `bootstrap.ts` runs blindly in every frame due to `all_frames: true`.
   - *Conclusion*: PJe Maestro cannot properly extract tasks from legacy iframe layouts (PJe 1.x) while simultaneously risking UI clipping when rendering toolbars inside nested sub-frames.

5. **From Obs 1.5**:
   - Broad query selector `tbody tr` captures header `<tr>` rows.
   - Reordering moves `<th>` header rows into process lists.
   - *Conclusion*: Adapters lack structural filters to distinguish process data rows from metadata/header rows.

---

## 3. Caveats

- **No Live Tribunal Access**: Findings are based on static code analysis, unit test inspection, and reference PJe DOM schemas (TRT/TRF/TJ PJe 1.x, PJe 2.x, PJe KZ). Live tribunal authentication was not used.
- **Read-Only Scope**: In accordance with Explorer archetype rules, no source files under `extension/src/` were edited. All recommendations and proposed fixes are documented herein.

---

## 4. Conclusion & Recommendations

The PJe Maestro DOM Adapters and Core Engines require immediate hardening before Milestone 1 release. Below are 6 detailed recommendations and code proposals:

### Recommendation 1: Implement Safe DOM Text Helper & Defensive Error Boundaries
Create a safe utility function for DOM text extraction and wrap `extractRecords()` / `refreshUI()` in `try...catch` blocks to ensure **zero uncaught console exceptions**.

```typescript
// Proposed helper in pje-base-adapter.ts:
export function safeGetText(el: Element | null | undefined): string {
  if (!el) return '';
  const text = (el as HTMLElement).innerText || el.textContent || '';
  return text.trim();
}
```

### Recommendation 2: Deterministic Hash Fallback for Non-CNJ & Secret Processes
Replace `Math.random()` with a deterministic hash derived from task name, row text prefix, and index position so local metadata stays attached across DOM re-renders.

```typescript
// Proposed in pje-base-adapter.ts:
function generateFallbackId(taskName: string, text: string, index: number): string {
  const cleanText = text.replace(/\s+/g, '').substring(0, 30);
  return `non-cnj-${index}-${taskName.substring(0, 10)}-${cleanText.length}`;
}
```

### Recommendation 3: Prevent MutationObserver Re-entry Loop
Modify `setupDOMObserver` or `injectRowBadges` to ignore mutations caused by `.pje-maestro-*` elements, or temporarily disconnect the observer during badge injection.

```typescript
// Proposed in mutation-observer.ts:
export function setupDOMObserver(target: HTMLElement, onChange: () => void): MutationObserver {
  let timer: any = null;
  const observer = new MutationObserver((mutations) => {
    const isSelfMutation = mutations.every(m => 
      Array.from(m.addedNodes).concat(Array.from(m.removedNodes)).every(node => 
        node instanceof HTMLElement && (node.classList.contains('pje-maestro-badge-container') || node.id.startsWith('pje-maestro'))
      )
    );
    if (isSelfMutation) return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { onChange(); }, 300);
  });
  observer.observe(target, { childList: true, subtree: true, attributes: false });
  return observer;
}
```

### Recommendation 4: Filter Out Table Headers & Metadata Rows
Refine table row extraction in `PJeTarefasAdapter` to exclude `tr` containing `th` elements or header classes.

```typescript
// Proposed in pje-tarefas-adapter.ts:
const rows = Array.from(container.querySelectorAll<HTMLElement>('tr.linha-processo, tr[data-cnj], tbody tr'))
  .filter(row => !row.querySelector('th') && !row.classList.contains('table-header'));
```

### Recommendation 5: Strengthen Secret Process Detection & Privacy Protection
Expand `isConfidential` detection patterns and respect the flag in CSV export and badge injection.

```typescript
// Expanded detection in pje-base-adapter.ts:
const isConfidential = 
  el.classList.contains('sigiloso') ||
  el.classList.contains('processo-sigiloso') ||
  el.classList.contains('badge-sigilo') ||
  !!el.querySelector('.fa-lock, [data-sigilo="true"]') ||
  /segredo de ju[sş]ti[çc]a|sigilo/i.test(el.innerText || el.textContent || '');
```

### Recommendation 6: Activate IFrame Traversal & Frame Aware Mounting
Integrate `frame-detector.ts` and `detectAndInspectIFrames()` into `bootstrap.ts` to allow top-window adapter resolution across same-origin child frames while avoiding toolbar mounting inside tiny sub-frames.

---

## 6. Verification Method

To independently verify these findings and future fixes:

1. **Unit & DOM Test Suite**:
   ```bash
   cd /antigravity-workspace/extension
   npm test
   ```
2. **Extension Test Runner**:
   ```bash
   cd /antigravity-workspace
   npm run test:extension
   ```
3. **Key Inspection Files**:
   - `extension/src/adapters/pje-base-adapter.ts` (lines 22-38)
   - `extension/src/adapters/pje-tarefas-adapter.ts` (lines 37-56)
   - `extension/src/content/mutation-observer.ts` (lines 4-15)
   - `extension/src/content/bootstrap.ts` (lines 20-35, 111-116)
   - `extension/src/core/deadline-engine.ts` (lines 16-20)
