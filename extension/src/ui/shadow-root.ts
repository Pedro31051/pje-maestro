export function getOrCreateShadowHost(): { host: HTMLElement; shadow: ShadowRoot } {
  let host = document.getElementById('pje-maestro-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'pje-maestro-host';
    document.body.appendChild(host);
  }

  let shadow = host.shadowRoot;
  if (!shadow) {
    shadow = host.attachShadow({ mode: 'open' });
    
    // Inject stylesheet if chrome runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = chrome.runtime.getURL('src/ui/styles.css');
      shadow.appendChild(styleLink);
    }

    // Inline style tag guarantees styling
    const styleTag = document.createElement('style');

    styleTag.textContent = `
      .pje-maestro-toolbar { display: flex; align-items: center; justify-content: space-between; background: #0f172a; color: #fff; padding: 8px 16px; border-radius: 8px; font-family: sans-serif; }
      .pje-maestro-btn { background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin: 0 4px; font-weight: bold; }
      .pje-maestro-drawer { position: fixed; top: 0; right: -420px; width: 400px; height: 100vh; background: #0f172a; color: #fff; transition: right 0.3s; z-index: 99999; padding: 16px; box-sizing: border-box; }
      .pje-maestro-drawer.open { right: 0; }
    `;
    shadow.appendChild(styleTag);
  }

  return { host, shadow };
}
