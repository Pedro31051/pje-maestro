// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderToolbar } from '../../src/ui/toolbar';

describe('renderToolbar DOM', () => {
  it('renders toolbar buttons and triggers callbacks when clicked', () => {
    const callbacks = {
      onFilterVencidos: vi.fn(),
      onReorder: vi.fn(),
      onRestore: vi.fn(),
      onOpenNext: vi.fn(),
      onToggleDrawer: vi.fn(),
      onExportCSV: vi.fn()
    };

    renderToolbar(callbacks);

    const host = document.getElementById('pje-maestro-host');
    expect(host).not.toBeNull();
    const shadow = host?.shadowRoot;
    expect(shadow).not.toBeNull();

    const btnReorder = shadow?.querySelector('#btn-reorder') as HTMLButtonElement;
    expect(btnReorder).not.toBeNull();
    btnReorder.click();
    expect(callbacks.onReorder).toHaveBeenCalledOnce();

    const btnNext = shadow?.querySelector('#btn-next') as HTMLButtonElement;
    btnNext.click();
    expect(callbacks.onOpenNext).toHaveBeenCalledOnce();
  });
});
