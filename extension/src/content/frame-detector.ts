export function isTopWindow(): boolean {
  try {
    return window.self === window.top;
  } catch (e) {
    return false;
  }
}

export function getFrameIdentity(): { isIframe: boolean; frameUrl: string } {
  return {
    isIframe: !isTopWindow(),
    frameUrl: window.location.href
  };
}
