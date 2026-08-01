import { PJeAdapter, buildRecordFromElement } from './pje-base-adapter';
import { ProcessRecord, LocalMetadata } from '../core/process-record';
import { extractCNJ } from '../core/parser-cnj';

export class PJeAutosAdapter implements PJeAdapter {
  name = 'pje-autos';

  canHandle(doc: Document): boolean {
    return !!(
      doc.querySelector('.pje-autos-header') ||
      doc.querySelector('#header-autos') ||
      doc.querySelector('[data-pje-type="autos"]')
    );
  }

  getContainer(doc: Document): HTMLElement | null {
    return (
      doc.querySelector('.pje-autos-header') ||
      doc.querySelector('#header-autos') ||
      doc.querySelector('[data-pje-type="autos"]')
    ) as HTMLElement | null;
  }

  extractRecords(doc: Document, localStore: Record<string, LocalMetadata>): ProcessRecord[] {
    const container = this.getContainer(doc);
    if (!container) return [];

    const text = container.innerText || '';
    const cnj = extractCNJ(text);

    return [
      buildRecordFromElement(
        container,
        0,
        cnj,
        'Visualização de Autos',
        [],
        text.toLowerCase().includes('prioridade'),
        localStore,
        doc.location ? doc.location.href : ''
      )
    ];
  }
}
