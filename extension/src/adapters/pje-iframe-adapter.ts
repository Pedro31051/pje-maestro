export function detectAndInspectIFrames(doc: Document): HTMLIFrameElement[] {
  const iframes = Array.from(doc.querySelectorAll<HTMLIFrameElement>('iframe'));
  return iframes.filter(iframe => {
    try {
      const src = iframe.src || '';
      return (
        src.includes('pje') ||
        src.includes('cnj') ||
        iframe.id.includes('pje') ||
        iframe.classList.contains('pje-frame')
      );
    } catch (e) {
      return false;
    }
  });
}
