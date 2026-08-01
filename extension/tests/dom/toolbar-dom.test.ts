// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToolbar } from '../../src/ui/toolbar';
import { getOrCreateShadowHost } from '../../src/ui/shadow-root';

describe('renderToolbar & Shadow DOM Host', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    const oldHost = document.getElementById('pje-maestro-host');
    if (oldHost) oldHost.remove();
  });

  it('guarantees Shadow DOM host idempotency when called repeatedly', () => {
    const res1 = getOrCreateShadowHost();
    const res2 = getOrCreateShadowHost();

    expect(res1.host).toBe(res2.host);
    expect(res1.shadow).toBe(res2.shadow);
    expect(document.querySelectorAll('#pje-maestro-host').length).toBe(1);
    expect(res1.shadow.mode).toBe('open');
  });

  it('renders toolbar buttons and encapsulates styles inside shadow root', () => {
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

    // Check style isolation link / style tag
    const styleEl = shadow?.querySelector('link[rel="stylesheet"], style');
    expect(styleEl).not.toBeNull();

    const btnReorder = shadow?.querySelector('#btn-reorder') as HTMLButtonElement;
    expect(btnReorder).not.toBeNull();
    btnReorder.click();
    expect(callbacks.onReorder).toHaveBeenCalledOnce();

    const btnNext = shadow?.querySelector('#btn-next') as HTMLButtonElement;
    btnNext.click();
    expect(callbacks.onOpenNext).toHaveBeenCalledOnce();

    const btnVencidos = shadow?.querySelector('#btn-vencidos') as HTMLButtonElement;
    btnVencidos.click();
    expect(callbacks.onFilterVencidos).toHaveBeenCalledOnce();

    const btnRestore = shadow?.querySelector('#btn-restore') as HTMLButtonElement;
    btnRestore.click();
    expect(callbacks.onRestore).toHaveBeenCalledOnce();

    const btnDrawer = shadow?.querySelector('#btn-drawer') as HTMLButtonElement;
    btnDrawer.click();
    expect(callbacks.onToggleDrawer).toHaveBeenCalledOnce();

    const btnCsv = shadow?.querySelector('#btn-csv') as HTMLButtonElement;
    btnCsv.click();
    expect(callbacks.onExportCSV).toHaveBeenCalledOnce();
  });
});
