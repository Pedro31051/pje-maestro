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
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function persistLocalMetadata(idOrCNJ: string, meta: Partial<LocalMetadata>): Promise<void> {
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

export async function saveLocalMetadata(idOrCNJ: string, meta: Partial<LocalMetadata>): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({ type: 'SAVE_LOCAL_METADATA', idOrCNJ, meta });
    if (!response?.ok) throw new Error(response?.error || 'Não foi possível salvar os metadados locais.');
    return;
  }
  await persistLocalMetadata(idOrCNJ, meta);
}
