export interface AuditEntry {
  timestamp: string;
  action: string;
  cnj?: string;
  details?: Record<string, any>;
}

const MAX_AUDIT_LOGS = 500;

export async function logAudit(action: string, cnj?: string, details?: Record<string, any>): Promise<void> {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    cnj,
    details
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const data = await chrome.storage.local.get('auditLogs');
      const logs: AuditEntry[] = data.auditLogs || [];
      logs.unshift(entry);
      if (logs.length > MAX_AUDIT_LOGS) logs.length = MAX_AUDIT_LOGS;
      await chrome.storage.local.set({ auditLogs: logs });
    } catch (e) {
      console.warn('[PJe Maestro Audit] Could not save audit log to chrome storage:', e);
    }
  } else {
    console.log('[PJe Maestro Audit]', entry);
  }
}
