import { LocalMetadata } from '../core/process-record';

export interface StorageSchema {
  version: number;
  metadataStore: Record<string, LocalMetadata>; // keyed by CNJ or element ID
  settings: {
    autoReorder: boolean;
    compactView: boolean;
  };
  auditLogs: any[];
}

export const INITIAL_STORAGE: StorageSchema = {
  version: 1,
  metadataStore: {},
  settings: {
    autoReorder: false,
    compactView: false
  },
  auditLogs: []
};

export async function getLocalMetadataStore(): Promise<Record<string, LocalMetadata>> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get('metadataStore');
    return data.metadataStore || {};
  }
  const raw = localStorage.getItem('pje_maestro_metadataStore');
  return raw ? JSON.parse(raw) : {};
}

export async function saveLocalMetadata(idOrCNJ: string, meta: Partial<LocalMetadata>): Promise<void> {
  const store = await getLocalMetadataStore();
  const current = store[idOrCNJ] || {};
  const updated: LocalMetadata = { ...current, ...meta };
  store[idOrCNJ] = updated;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ metadataStore: store });
  } else {
    localStorage.setItem('pje_maestro_metadataStore', JSON.stringify(store));
  }
}
