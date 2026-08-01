# 📋 PJe Maestro — Inventário Completo de Testes da Extensão Chrome (Manifest V3)

> **Documento:** `EXTENSION_TEST_INVENTORY.md`  
> **Extensão:** PJe Maestro (v0.1.0)  
> **Arquitetura:** Content Script (IIFE Shadow DOM), Background Service Worker (ES), Options Page, Local DB (chrome.storage.local)

---

## 🏛️ Inventário de Componentes e Telas

### 1. Toolbar Injetada (`#pje-maestro-host` -> `.pje-maestro-toolbar`)

| ID do Controle | Seletor Estável | Tipo | Tela / Local | Estado Inicial | Ação de Teste | Estado Esperado Pós-Ação | Efeito no DOM / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-TB-01` | `#btn-reorder` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Fila Reordenada por Score | Reordena elementos do DOM de acordo com `rankingEngine` |
| `CTRL-TB-02` | `#btn-vencidos` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Filtro 'Vencidos' Ativado | Oculta processos não vencidos do DOM |
| `CTRL-TB-03` | `#btn-next` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Próximo Processo Destacado | Aplica `.pje-maestro-highlight` e rola a tela até a linha |
| `CTRL-TB-04` | `#btn-restore` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Ordem Original Restaurada | Reordena elementos do DOM para a ordem original de carregamento |
| `CTRL-TB-05` | `#btn-csv` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Download de CSV Disparado | Gera e faz o download de arquivo `pje_maestro_fila_*.csv` |
| `CTRL-TB-06` | `#btn-drawer` | Botão | Toolbar (Top) | Visível / Habilitado | Clique | Painel Lateral Alternado | Alterna a classe `.open` no elemento `.pje-maestro-drawer` |

---

### 2. Painel Lateral de Fila Inteligente (`.pje-maestro-drawer`)

| ID do Controle | Seletor Estável | Tipo | Tela / Local | Estado Inicial | Ação de Teste | Estado Esperado Pós-Ação | Efeito no DOM / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-DW-01` | `#btn-close-drawer` | Botão | Header da Gaveta | Visível quando aberta | Clique | Gaveta Fechada | Remove a classe `.open` do drawer |
| `CTRL-DW-02` | `#queue-search` | Input Texto | Corpo da Gaveta | Vazio (`""`) | Digitação (`0801234`) | Fila Filtrada por Busca | Exibe apenas cards e elementos correspondentes à busca |
| `CTRL-DW-03` | `#queue-status-filter` | Select | Corpo da Gaveta | Opção `all` selecionada | Alteração (`concluido`) | Fila Filtrada por Status | Filtra por status local (`pendente`, `em_andamento`, `concluido`) |
| `CTRL-DW-04` | `.input-deadline` | Input Date | Card do Processo | Data atual ou vazia | Selecionar Data (`2026-08-01`) | Prazo Atualizado | Atualiza `localDeadline` no `chrome.storage.local` e recalcula score |
| `CTRL-DW-05` | `.select-priority` | Select | Card do Processo | Opção atual (`media`) | Alteração (`urgente`) | Prioridade Local Alterada | Atualiza `localPriority` no `chrome.storage.local` e soma bônus de score |

---

### 3. Modais e Interações com Notas (`.pje-maestro-modal`)

| ID do Controle | Seletor Estável | Tipo | Tela / Local | Estado Inicial | Ação de Teste | Estado Esperado Pós-Ação | Efeito no DOM / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-MD-01` | `#modal-note-text` | Textarea | Modal de Nota | Texto inicial da nota | Digitação de nota | Texto Atualizado | Mantém texto na memória do modal |
| `CTRL-MD-02` | `#modal-save` | Botão | Modal de Nota | Habilitado | Clique | Nota Salva e Modal Fechado | Grava nota no `chrome.storage.local` e remove o modal |
| `CTRL-MD-03` | `#modal-cancel` | Botão | Modal de Nota | Habilitado | Clique | Modal Fechado Sem Salvar | Remove o modal sem alterar o storage |

---

### 4. Página de Opções (`options/options.html`)

| ID do Controle | Seletor Estável | Tipo | Tela / Local | Estado Inicial | Ação de Teste | Estado Esperado Pós-Ação | Efeito no DOM / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-OP-01` | `#btn-clear-logs` | Botão | Página de Opções | Habilitado | Clique | Logs Limpos | Define `auditLogs: []` no `chrome.storage.local` |

---

### 5. Injeções de Badges no DOM da Página-Alvo

| ID do Controle | Seletor Estável | Tipo | Tela / Local | Estado Inicial | Ação de Teste | Estado Esperado Pós-Ação | Efeito no DOM / Storage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-BG-01` | `.badge-score` | Badge Visual | Linha / Card do PJe | N/A | Injeção Automática | Badge com Score Visível | Adiciona elemento visual `.badge-score` com pontuação calculada |
| `CTRL-BG-02` | `.badge-overdue` | Badge Visual | Linha / Card do PJe | N/A | Injeção Automática | Badge 'VENCIDO' Vermelha | Adiciona aviso visual vermelho de prazo vencido em dias |
| `CTRL-BG-03` | `.badge-today` | Badge Visual | Linha / Card do PJe | N/A | Injeção Automática | Badge 'VENCE HOJE' Amarela | Adiciona aviso visual amarelo de vencimento no próprio dia |

---

### 6. Comunicação Interna e Mensagens do Service Worker

| ID da Mensagem | Tipo de Sinal | Origem | Destino | Ação Esperada | Tratamento de Erro |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MSG-SW-01` | `PING` | Content Script / Test | Background SW | Retorna `{ status: 'PONG', timestamp }` | Retorna erro estruturado caso SW esteja inativo |
| `MSG-SW-02` | `STORAGE_SYNC` | Content Script | `chrome.storage.local` | Atualiza estado de metadados locais | Trata exceção de storage sem travar o UI |

---

### 7. Cobertura de Testes Negativos e Exceções

| ID do Teste | Cenário de Teste | Entrada / Ação | Comportamento Esperado | Asserção de Segurança |
| :--- | :--- | :--- | :--- | :--- |
| `NEG-01` | Busca sem resultados | Terça `"QUERY_INEXISTENTE_999"` em `#queue-search` | Fila fica vazia sem quebrar layout | `.card-processo` = 0; UI permanece funcional |
| `NEG-02` | Lista de processos vazia | Abrir fixture `lista-vazia.html` | Extensão inicializa sem erros no console | Nenhuma exceção lançada; toolbar funcional |
| `NEG-03` | Cliques duplos rápidos | Clicar 5x rapidamente em `#btn-reorder` | Ação idempotente; sem duplicação de DOM | Elementos únicos no DOM; sem listeners duplicados |
| `NEG-04` | IFrame legado cross-context | Abrir fixture `pje-com-iframe.html` | Content script injetado com `all_frames: true` | Injeção de UI nos quadros permitidos |

---

## 🎯 Resumo da Suíte de Automação

- **Total de Controles Inventariados:** 18
- **Total de Fluxos Negativos:** 4
- **Modos de Resolução de Tela:** 1920x1080, 1440x900, 1280x800, 768x1024
- **Repetições de Estabilidade:** 3 repetições por controle, 10 ciclos completos de estresse.
