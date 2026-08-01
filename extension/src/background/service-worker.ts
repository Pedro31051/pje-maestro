import { runStorageMigration } from '../storage/migration';
import { persistLocalMetadata } from '../storage/local-db';

console.log('[PJe Maestro Background] Service Worker started.');

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[PJe Maestro Background] Extension installed/updated.');
  await runStorageMigration();
});

let metadataWriteQueue: Promise<void> = Promise.resolve();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
    return false;
  }
  if (message.type === 'SAVE_LOCAL_METADATA') {
    metadataWriteQueue = metadataWriteQueue
      .catch(() => undefined)
      .then(() => persistLocalMetadata(message.idOrCNJ, message.meta));
    metadataWriteQueue.then(
      () => sendResponse({ ok: true }),
      error => sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Falha de armazenamento' })
    );
    return true;
  }
  return false;
});
