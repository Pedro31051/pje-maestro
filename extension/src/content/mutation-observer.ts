export function setupDOMObserver(target: HTMLElement, onChange: () => void): MutationObserver {
  let timer: any = null;

  const observer = new MutationObserver(() => {
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
