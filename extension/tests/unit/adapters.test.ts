// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { safeGetText, checkIsConfidential, buildRecordFromElement } from '../../src/adapters/pje-base-adapter';
import { PJeTarefasAdapter } from '../../src/adapters/pje-tarefas-adapter';
import { PJeAutosAdapter } from '../../src/adapters/pje-autos-adapter';
import { detectAndInspectIFrames } from '../../src/adapters/pje-iframe-adapter';

describe('DOM Adapters & Resiliency Helpers', () => {
  describe('safeGetText', () => {
    it('handles null, undefined, and valid elements safely without throwing', () => {
      expect(safeGetText(null)).toBe('');
      expect(safeGetText(undefined)).toBe('');

      const el = document.createElement('div');
      el.textContent = '  Processo 0801234-56.2025.8.14.0028 \n ';
      expect(safeGetText(el)).toBe('Processo 0801234-56.2025.8.14.0028');
    });
  });

  describe('checkIsConfidential', () => {
    it('detects confidential processes via classes, attributes, icons, and text', () => {
      const elNormal = document.createElement('div');
      elNormal.textContent = 'Processo Comum';
      expect(checkIsConfidential(elNormal)).toBe(false);

      const elClass = document.createElement('div');
      elClass.className = 'processo-sigiloso';
      expect(checkIsConfidential(elClass)).toBe(true);

      const elIcon = document.createElement('div');
      elIcon.innerHTML = '<span>Processo</span><i class="fa-lock"></i>';
      expect(checkIsConfidential(elIcon)).toBe(true);

      const elAttr = document.createElement('div');
      elAttr.setAttribute('data-sigilo', 'true');
      expect(checkIsConfidential(elAttr)).toBe(true);

      const elText = document.createElement('div');
      elText.textContent = 'Processo em segredo de justiça';
      expect(checkIsConfidential(elText)).toBe(true);
    });
  });

  describe('Deterministic Fallback ID Generation', () => {
    it('produces identical deterministic fallback IDs across multiple calls without Math.random()', () => {
      const el = document.createElement('div');
      el.textContent = 'Minuta de Despacho em Processo Sem CNJ';

      const rec1 = buildRecordFromElement(el, 0, null, 'Minuta', [], false, {}, 'http://localhost');
      const rec2 = buildRecordFromElement(el, 0, null, 'Minuta', [], false, {}, 'http://localhost');

      expect(rec1.id).not.toContain('elem-');
      expect(rec1.id).toBe(rec2.id);
      expect(rec1.id).toMatch(/^record::[a-z0-9]+$/);
    });
  });

  describe('PJeTarefasAdapter', () => {
    it('identifies table layout and extracts records while ignoring header rows', () => {
      const adapter = new PJeTarefasAdapter();
      document.body.innerHTML = `
        <table class="tabela-tarefas">
          <thead>
            <tr class="table-header"><th>Processo</th><th>Tarefa</th></tr>
          </thead>
          <tbody>
            <tr class="linha-processo" data-cnj="0801234-56.2025.8.14.0028">
              <td>0801234-56.2025.8.14.0028</td>
              <td class="nome-tarefa">Minuta de Sentença</td>
            </tr>
          </tbody>
        </table>
      `;

      expect(adapter.canHandle(document)).toBe(true);
      const records = adapter.extractRecords(document, {});
      expect(records.length).toBe(1);
      expect(records[0].cnj).toBe('0801234-56.2025.8.14.0028');
      expect(records[0].taskName).toBe('Minuta de Sentença');
    });
  });

  describe('PJeAutosAdapter', () => {
    it('detects autos page layout and extracts record', () => {
      const adapter = new PJeAutosAdapter();
      document.body.innerHTML = `
        <div class="pje-autos-header">
          <h2>Autos do Processo 5001234-88.2024.4.03.6100</h2>
        </div>
      `;

      expect(adapter.canHandle(document)).toBe(true);
      const records = adapter.extractRecords(document, {});
      expect(records.length).toBe(1);
      expect(records[0].cnj).toBe('5001234-88.2024.4.03.6100');
    });
  });

  describe('PJeIframeAdapter', () => {
    it('filters PJe relevant iframes correctly', () => {
      document.body.innerHTML = `
        <iframe id="pje-frame-1" src="https://pje.trt1.jus.br/painel"></iframe>
        <iframe id="external-frame" src="https://google.com"></iframe>
      `;

      const iframes = detectAndInspectIFrames(document);
      expect(iframes.length).toBe(1);
      expect(iframes[0].id).toBe('pje-frame-1');
    });
  });
});
