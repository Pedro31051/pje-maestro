export function setupDOMObserver(target: HTMLElement, onChange: () => void): MutationObserver {
  let timer: any = null;

  const observer = new MutationObserver((mutations) => {
    const isSelfMutation = mutations.every(m => {
      const nodes = [...Array.from(m.addedNodes), ...Array.from(m.removedNodes)];
      if (nodes.length === 0) return false;
      return nodes.every(node => {
        if (node instanceof HTMLElement) {
          return (
            node.id.startsWith('pje-maestro') ||
            node.classList.contains('pje-maestro-badge-container') ||
            node.classList.contains('pje-maestro-badge') ||
            !!node.querySelector?.('#pje-maestro-host, .pje-maestro-badge-container')
          );
        }
        return true;
      });
    });

    if (isSelfMutation) return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onChange();
    }, 300);
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: false
  });

  return observer;
}
