import { INITIAL_STORAGE, StorageSchema } from './local-db';

export async function runStorageMigration(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

  const data = await chrome.storage.local.get(null) as Partial<StorageSchema>;
  if (!data.version) {
    await chrome.storage.local.set(INITIAL_STORAGE);
    console.log('[PJe Maestro Storage] Initialized storage schema v1');
  } else if (data.version < 1) {
    // Migration logic for future versions
    await chrome.storage.local.set({ version: 1 });
  }
}
