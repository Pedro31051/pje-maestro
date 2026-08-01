import { runStorageMigration } from '../storage/migration';

console.log('[PJe Maestro Background] Service Worker started.');

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[PJe Maestro Background] Extension installed/updated.');
  await runStorageMigration();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
  }
  return true;
});
