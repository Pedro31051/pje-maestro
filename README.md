# PJe Maestro — Extension MV3 & Linux Visual Proof Agent

> **"O PJe continua mandando no processo; a extensão manda na ordem do trabalho."**
> **"O agente não diz que fez: ele mostra o print, o hash e o antes/depois."**

---

## 🏛️ Arquitetura do Projeto

```text
pje-maestro/
  extension/            -> Extensão Chrome Manifest V3 (Content Script, Shadow DOM UI, Ranking Engine, Local DB)
  visual-agent/         -> Agente Linux com Playwright, Live Dashboard Server, Fixtures Server & Print Redactor
  artifacts/
    live/               -> current.jpg e events.ndjson em tempo quase real
    sessions/           -> Pastas de execução numeradas com screenshots PNG, manifest.json e relatório index.html
```

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Compilar a Extensão
```bash
npm run build
```

### 3. Rodar Testes Unitários e DOM da Extensão
```bash
npm run test
```

### 4. Executar o Visual Proof Agent (Com visualização e geração de prints)
```bash
npm run test:visual
```

Ou no ambiente Linux Headless / CI com Xvfb:
```bash
npm run visual:xvfb
```

---

## 📸 Evidências Visuais e Dashboard Live

Ao rodar o Visual Proof Agent:
- Servidor de Fixture: `http://127.0.0.1:49155`
- Dashboard Live com atualização a cada 1s: `http://127.0.0.1:49160/live`
- Última captura ao vivo: `artifacts/live/current.jpg`
- Stream de eventos: `artifacts/live/events.ndjson`
- Relatório de Auditoria Visual Final: `artifacts/sessions/SESSION_ID/index.html`

---

## 🔐 Segurança e Redação Visual

O módulo `visual-agent/src/redactor.ts` garante que números CNJ, CPFs e parâmetros de URL sensíveis sejam mascarados antes de qualquer captura ou emissão de relatório visual em ambiente real.
