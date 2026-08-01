// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildRecordFromElement } from '../../src/adapters/pje-base-adapter';
import { executeOpenNext } from '../../src/actions/open-next';
import { executeRestoreOrder } from '../../src/actions/restore-order';
import { executeVisualReorder } from '../../src/actions/visual-reorder';
import { setupDOMObserver } from '../../src/content/mutation-observer';
import { ProcessRecord } from '../../src/core/process-record';
import { injectRowBadges } from '../../src/ui/badges';
import { renderQueuePanel } from '../../src/ui/queue-panel';

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

function makeRecord(element: HTMLElement, index: number, taskName: string, score: number): ProcessRecord {
  const record = buildRecordFromElement(
    element, index, '0801234-56.2025.8.14.0028', taskName, [], false, {},
    'https://pje.example.jus.br/tarefas'
  );
  record.score = score;
  return record;
}

describe('DOM regressions', () => {
  it('ignores badge mutations but reacts to PJe row mutations', async () => {
    vi.useFakeTimers();
    const container = document.createElement('div');
    const row = document.createElement('div');
    container.appendChild(row);
    document.body.appendChild(container);
    const onChange = vi.fn();
    const observer = setupDOMObserver(container, onChange);
    injectRowBadges([makeRecord(row, 0, 'Tarefa', 10)]);
    await Promise.resolve();
    await vi.runAllTimersAsync();
    expect(onChange).not.toHaveBeenCalled();
    container.appendChild(document.createElement('div'));
    await Promise.resolve();
    await vi.runAllTimersAsync();
    expect(onChange).toHaveBeenCalledOnce();
    observer.disconnect();
  });

  it('preserves stable IDs and the initial order after a visual reorder', () => {
    const container = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    first.textContent = 'Primeiro';
    second.textContent = 'Segundo';
    container.append(first, second);
    document.body.appendChild(container);
    const initial = [makeRecord(first, 0, 'Primeiro', 1), makeRecord(second, 1, 'Segundo', 100)];
    const initialIds = initial.map(record => record.id);
    executeVisualReorder(container, initial);
    const extractedAgain = [makeRecord(second, 0, 'Segundo', 100), makeRecord(first, 1, 'Primeiro', 1)];
    expect(extractedAgain.map(record => record.id)).toEqual([initialIds[1], initialIds[0]]);
    executeRestoreOrder(container, extractedAgain);
    expect(Array.from(container.children)).toEqual([first, second]);
  });

  it('keeps the search field mounted and renders page text as text only', () => {
    const row = document.createElement('div');
    row.textContent = 'registro';
    const record = makeRecord(row, 0, '<img src=x onerror=alert(1)>', 50);
    renderQueuePanel([record], { query: '' }, vi.fn(), vi.fn());
    const shadow = document.getElementById('pje-maestro-host')!.shadowRoot!;
    const originalInput = shadow.querySelector<HTMLInputElement>('#queue-search')!;
    originalInput.focus();
    renderQueuePanel([record], { query: '0801', statusFilter: 'pendente' }, vi.fn(), vi.fn());
    const updatedInput = shadow.querySelector<HTMLInputElement>('#queue-search')!;
    expect(updatedInput).toBe(originalInput);
    expect(updatedInput.value).toBe('0801');
    expect(shadow.activeElement).toBe(updatedInput);
    expect(shadow.querySelector('.task-name')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(shadow.querySelector('.task-name img')).toBeNull();
  });

  it('opens the highest-ranked pending process', () => {
    const lowRow = document.createElement('div');
    const highRow = document.createElement('div');
    const lowButton = document.createElement('button');
    const highButton = document.createElement('button');
    lowRow.appendChild(lowButton);
    highRow.appendChild(highButton);
    document.body.append(lowRow, highRow);
    const lowClick = vi.fn();
    const highClick = vi.fn();
    lowButton.addEventListener('click', lowClick);
    highButton.addEventListener('click', highClick);
    const selected = executeOpenNext([makeRecord(lowRow, 0, 'Baixa', 1), makeRecord(highRow, 1, 'Alta', 100)]);
    expect(selected?.elementRef).toBe(highRow);
    expect(highClick).toHaveBeenCalledOnce();
    expect(lowClick).not.toHaveBeenCalled();
  });
});
