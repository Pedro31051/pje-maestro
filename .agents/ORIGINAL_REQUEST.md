# Original User Request

## 2026-08-01T03:06:08Z

Auditoria de robustez real e revisão técnica completa da extensão Chrome Manifest V3 PJe Maestro e seu Visual Proof Agent, assegurando zero regressões, tratamento resiliente de erros em páginas reais do PJe e verificação autônoma no Chromium.

Working directory: /antigravity-workspace
Integrity mode: development

## Requirements

### R1. Cobertura de Testes e Resiliência da Extensão PJe Maestro
A extensão Manifest V3 deve manter 100% de estabilidade e funcionalidade em todas as telas (tabelas, cards, iframes, processos sigilosos), garantindo que a Action Popup UI, a barra injetada (#pje-maestro-host), a gaveta lateral e os filtros funcionem sem travar ou emitir exceções no console do navegador.

### R2. Suíte de Auditoria Visual e Provas Verificáveis no Linux
O Visual Proof Agent deve ser capaz de executar a suíte Playwright no Linux (com Xvfb), gerando screenshots numéricos (000 a 007), hashes SHA256 e relatórios HTML autônomos (Base64) das evidências capturadas.

### R3. Integridade do Repositório Git e Artefatos de Entrega
Todas as alterações, builds de produção (extension/dist/), inventários (EXTENSION_TEST_INVENTORY.md) e relatórios de validação (EXTENSION_VALIDATION_REPORT.md) devem estar sincronizados com o repositório remoto do GitHub (https://github.com/Pedro31051/pje-maestro.git).

## Acceptance Criteria

### Verificação Funcional da Extensão
- [ ] 100% dos 18+ controles inventariados passam sem falhas (CTRL-TB-*, CTRL-DW-*, CTRL-MD-*, CTRL-OP-*, CTRL-BG-*, CTRL-POPUP-*).
- [ ] Os testes de regressão unitários, DOM e E2E executam e passam via npm test e npm run test:extension.

### Verificação da Suíte de Evidência Visual
- [ ] O relatório HTML index.html contém todas as capturas de tela embutidas em Base64, abrindo de forma autônoma sem links quebrados.
- [ ] O Dashboard Live (http://127.0.0.1:49160/live) e as fixtures do PJe respondem corretamente.
