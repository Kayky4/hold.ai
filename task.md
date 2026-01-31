# 📋 Tasks de Implementação: HoldAI

> Arquivo de controle para implementação fase a fase.
> **Regra principal:** Atualizar este arquivo IMEDIATAMENTE após implementar.
> **Última atualização:** 30/01/2026

---

## 🔄 Fluxo Obrigatório de Cada Fase

```
┌─────────────────────────────────────────────────────────┐
│  0. ESTUDAR SKILLS 📚                                   │
│     └─ Ler SKILL.md das skills listadas na fase         │
│     └─ Anotar anti-padrões a evitar                     │
├─────────────────────────────────────────────────────────┤
│  1. PREPARAR                                            │
│     └─ Ler regras aplicáveis em regras_decisoes.md      │
│     └─ Ler design_system.md para validar UI             │
│     └─ Revisar dependências com fases anteriores        │
├─────────────────────────────────────────────────────────┤
│  2. IMPLEMENTAR                                         │
│     └─ Desenvolver seguindo skills + design system      │
│     └─ Aplicar anti-padrões listados nas skills         │
├─────────────────────────────────────────────────────────┤
│  3. ATUALIZAR TASKS ⚡ (IMEDIATO)                       │
│     └─ Marcar o que foi implementado                    │
│     └─ Anotar decisões técnicas tomadas                 │
├─────────────────────────────────────────────────────────┤
│  4. VERIFICAR (Claude)                                  │
│     └─ Analisar código, procurar erros                  │
│     └─ Testar build (`npm run build`)                   │
│     └─ Verificar checklist UI do design_system.md       │
│     └─ Confirmar que regras foram seguidas              │
├─────────────────────────────────────────────────────────┤
│  5. TESTAR (Kayky)                                      │
│     └─ Testar manualmente cada funcionalidade           │
│     └─ Testar responsividade (mobile, tablet, desktop)  │
│     └─ Testar dark mode                                 │
├─────────────────────────────────────────────────────────┤
│  6. DOCUMENTAR                                          │
│     └─ Anotar bugs encontrados (se houver)              │
│     └─ Atualizar tasks com correções feitas             │
├─────────────────────────────────────────────────────────┤
│  7. VALIDAR                                             │
│     └─ Kayky confirma que está como esperado            │
│     └─ UI segue Design System                           │
├─────────────────────────────────────────────────────────┤
│  8. AVANÇAR                                             │
│     └─ Marcar fase como ✅ CONCLUÍDA                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Skills Essenciais

| Skill | Descrição |
|-------|-----------|
| `ui-ux-pro-max` | Paletas, tipografia, regras UX |
| `frontend-design` | UI distintiva e premium |
| `tailwind-patterns` | Tailwind CSS v4, tokens |
| `react-patterns` | Hooks, composição, TypeScript |
| `ai-engineer` | LLM applications, prompts |
| `prompt-engineering` | Técnicas avançadas de prompt |

---

## 📊 Visão Geral das Fases

| # | Fase | Status | Objetivo |
|---|------|--------|----------|
| 00 | Design System | [ ] | Tokens CSS, componentes base |
| 01 | Limpeza | [ ] | Remover código desnecessário |
| 02 | Personas Base | [ ] | 5 personas pré-definidas |
| 02.5 | Avatares | [ ] | Criar imagens das 5 personas (IA) |
| 03 | Schema Sessão | [ ] | Estrutura de dados para sessões |
| 04 | Auth Ajustes | [ ] | Verificar e ajustar auth existente |
| 05 | Layout Principal | [ ] | Sidebar simplificada, responsivo |
| 06 | Portal | [ ] | Seleção de modo (Solo/Mesa/Revisão) |
| 07 | Seleção Conselheiros | [ ] | UI para escolher conselheiros |
| 08 | Interface Sessão | [ ] | Chat + indicadores de fase |
| 09 | Fase H | [ ] | Moderador + clarificação |
| 10 | Fase O (Solo) | [ ] | 1 conselheiro + moderador |
| 11 | Fase O (Mesa) | [ ] | 2 conselheiros debatendo |
| 12 | Fase L | [ ] | Síntese + decisão |
| 13 | Fase D | [ ] | Ação + prazo |
| 14 | Banco Decisões | [ ] | Histórico + filtros |
| 15 | Modo Revisão | [ ] | Revisar decisões passadas |
| 16 | Pausar/Retomar | [ ] | Sessões pausáveis |
| **16.5** | **CRM Base** | **[ ]** | **North Star + Projetos + Kanban** |
| 17 | Onboarding | [ ] | Onboarding ultra premium (skipável) |
| 18 | Polish | [ ] | Animações, refinamentos |

---

# 🏗️ FASES DETALHADAS

---

## 🎨 Fase 00: Design System

**Status:** [ ] Não iniciada

**Objetivo:** Implementar tokens e componentes base do Design System

### 📚 Skills
- `frontend-design`, `tailwind-patterns`, `tailwind-design-system`, `mobile-design`

### ✅ Implementar

**Tokens CSS:**
- [ ] Tokens de texto: `text-primary`, `text-secondary`, `text-muted`
- [ ] Tokens de superfície: `surface-page`, `surface-card`, `surface-elevated`
- [ ] Tokens de ação: `action-primary`, `action-secondary`, `action-strong`
- [ ] Tokens de borda: `border-default`, `border-subtle`, `border-focus`
- [ ] Tokens de status: `status-success`, `status-warning`, `status-error`
- [ ] Tokens de confronto: `confrontation`, `confrontation-subtle`
- [ ] Tokens de espaçamento: `space-1` a `space-16`
- [ ] Dark mode mapeado

**Componentes Base:**
- [ ] Button (Primary, Secondary, Strong)
- [ ] Card com hover
- [ ] Input com focus ring
- [ ] Modal base

### 🔍 Verificar
- [ ] Build sem erros
- [ ] Tokens funcionando
- [ ] Dark mode funcional

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxos de interação
- `design_system.md` — Tokens e padrões visuais
- `regras_decisoes.md` — Regras de negócio

---

## 🧹 Fase 01: Limpeza

**Status:** [ ] Não iniciada

**Objetivo:** Remover código legado e componentes não utilizados

### 📚 Skills
- `codebase-cleanup-refactor-clean`, `production-code-audit`

### ✅ Implementar

**Manter (adaptar depois):**
- [ ] `MeetingRoom.tsx` → adaptar para "Mesa de Conselheiros"
- [ ] `PersonaManager.tsx` → adaptar para gerenciar conselheiros
- [ ] `PersonaForm.tsx` → adaptar para edição
- [ ] `ChatInterface.tsx` → adaptar para sessões HOLD
- [ ] `Sidebar.tsx` → simplificar
- [ ] `AuthPage.tsx` + `AuthGuard.tsx` + `AuthContext.tsx`
- [ ] `ThemeToggle.tsx` + `ThemeContext.tsx`
- [ ] `ConfirmModal.tsx` + `PasswordInput.tsx`

**Remover (se não usados):**
- [ ] `MeetingSetup.tsx` (se funcionalidade for redundante)
- [ ] `MeetingViewer.tsx` (avaliar)
- [ ] `ModelSelector.tsx` (avaliar)
- [ ] `MetricsDashboard.tsx` (avaliar)

**Avaliar:**
- [ ] Revisar cada arquivo e decidir manter/remover/adaptar

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxos de interação
- `visao_holdai.md` — Visão geral do produto

---

## 👥 Fase 02: Personas Base

**Status:** [ ] Não iniciada

**Objetivo:** Criar as 5 personas pré-definidas do sistema

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`, `llm-application-dev-prompt-optimize`

### ✅ Implementar

**Criar arquivo de personas default:**
- [ ] `src/lib/defaultPersonas.ts`
- [ ] Prompt completo do Moderador
- [ ] Prompt completo do Estrategista
- [ ] Prompt completo do Pragmático
- [ ] Prompt completo do Analista de Riscos
- [ ] Prompt completo do Mentor

**Atualizar tipos:**
- [ ] `src/types/index.ts` → Persona type com `isSystem` flag
- [ ] Moderador: `isSystem: true`, `isEditable: false`
- [ ] Conselheiros: `isSystem: true`, `isEditable: true`

**Integrar com Firebase:**
- [ ] Seed personas default para novos usuários
- [ ] Garantir que Moderador não pode ser deletado

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Personas do Sistema
- `definicao_personas.md` — Prompts completos
- `regras_decisoes.md` — Regras de IA

---

## 💾 Fase 03: Schema Sessão

**Status:** [ ] Não iniciada

**Objetivo:** Definir estrutura de dados para sessões de decisão

### 📚 Skills
- `architecture`, `api-patterns`, `software-architecture`

### ✅ Implementar

**Criar tipos:**
```typescript
interface Session {
  id: string;
  userId: string;
  mode: 'solo' | 'mesa' | 'revision';
  counselors: string[];  // IDs dos conselheiros
  phase: 'H' | 'O' | 'L' | 'D' | 'completed' | 'paused';
  messages: SessionMessage[];
  context: SessionContext;
  decision?: Decision;
  createdAt: Date;
  updatedAt: Date;
  pausedAt?: Date;
}

interface SessionMessage {
  id: string;
  speaker: 'user' | 'moderator' | string; // string = counselor ID
  content: string;
  phase: 'H' | 'O' | 'L' | 'D';
  timestamp: Date;
}

interface SessionContext {
  problem: string;
  details: Record<string, string>;
  summary?: string;
}
```

**Criar services:**
- [ ] `src/lib/sessions.ts` com CRUD

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxo HOLD + Mesa
- `regras_decisoes.md` — CRM de Decisões (Schema)

---

## 🔐 Fase 04: Auth Ajustes

**Status:** [ ] Não iniciada

**Objetivo:** Verificar e ajustar autenticação existente

### 📚 Skills
- `error-handling-patterns`

### ✅ Verificar
- [ ] Login email/senha funcionando
- [ ] Login Google funcionando
- [ ] Reset senha funcionando
- [ ] AuthGuard protegendo rotas
- [ ] Seed de personas default no primeiro login

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — FTUX (First-Time User Experience)
- `regras_decisoes.md` — Regras gerais

---

## 📐 Fase 05: Layout Principal

**Status:** [ ] Não iniciada

**Objetivo:** Simplificar layout para fluxo HoldAI

### 📚 Skills
- `frontend-design`, `mobile-design`, `react-patterns`

### ✅ Implementar

**Sidebar Simplificada:**
- [ ] Logo + brand
- [ ] Botão "Nova Sessão" → vai para Portal
- [ ] Lista de sessões (recentes)
- [ ] Separador "Decisões"
- [ ] Link para banco de decisões
- [ ] User menu (perfil, configurações, logout)

**Remover da sidebar:**
- [ ] Seleção de personas (agora é no Portal)
- [ ] Projetos (simplificar MVP)
- [ ] Meetings antigas

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Navegação Principal (CRM é a Home)
- `regras_decisoes.md` — Navegação e FTUX
- `design_system.md` — Tokens e componentes

---

## 🚪 Fase 06: Portal

**Status:** [ ] Não iniciada

**Objetivo:** Tela de seleção de modo

### 📚 Skills
- `frontend-design`, `ui-ux-pro-max`

### ✅ Implementar

**UI do Portal:**
- [ ] 3 cards grandes: Solo, Mesa, Revisão
- [ ] Cada card com ícone + título + descrição
- [ ] Hover premium com animação sutil
- [ ] Sem campo de texto (regra de ouro)

**Cards:**
- [ ] **Solo**: "Consulte 1 conselheiro para perspectiva específica"
- [ ] **Mesa**: "Reúna 2 conselheiros para debate estruturado"
- [ ] **Revisão**: "Revise uma decisão passada"

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modos de Interação
- `regras_decisoes.md` — Anti-Padrões do Portal
- `design_system.md` — Tokens de ação

---

## 👥 Fase 07: Seleção Conselheiros

**Status:** [ ] Não iniciada

**Objetivo:** UI para escolher conselheiros

### 📚 Skills
- `frontend-design`, `mobile-design`

### ✅ Implementar

**Modo Solo:**
- [ ] Grid 2x2 com os 4 conselheiros
- [ ] Card com avatar + nome + descrição curta
- [ ] Selecionar 1 → avançar

**Modo Mesa:**
- [ ] Grid 2x2 com os 4 conselheiros
- [ ] Selecionar 2 → avançar
- [ ] Feedback visual de seleção (borda, checkmark)

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Personas do Sistema
- `definicao_personas.md` — Detalhes das 5 personas

---

## 💬 Fase 08: Interface Sessão

**Status:** [ ] Não iniciada

**Objetivo:** Interface de chat para sessões HOLD

### 📚 Skills
- `frontend-design`, `mobile-design`, `react-patterns`

### ✅ Implementar

**Layout:**
- [ ] Header com: fase atual (H/O/L/D), conselheiros ativos, pausar/encerrar
- [ ] Área de mensagens com scroll
- [ ] Input do usuário
- [ ] Indicadores visuais de quem está falando

**Indicadores de Speaker:**
- [ ] Moderador: cor neutra, ícone específico
- [ ] Conselheiros: cores distintas por persona
- [ ] Usuário: alinhado diferente

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxo HOLD + Indicadores
- `design_system.md` — Cores por persona
- `regras_decisoes.md` — Streaming e Latência

---

## 🔤 Fase 09: Fase H (Clarificação)

**Status:** [ ] Não iniciada

**Objetivo:** Implementar fase H com Moderador

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`, `llm-evaluation`

### ✅ Implementar

**Fluxo:**
- [ ] Moderador abre com pergunta inicial
- [ ] Perguntas de acompanhamento (mínimo 5)
- [ ] Captura de contexto estruturado
- [ ] Moderador apresenta resumo
- [ ] Transição para Fase O

**API:**
- [ ] `/api/session/phase-h` com streaming
- [ ] Prompt do Moderador para fase H

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fase H (Clarificação)
- `definicao_personas.md` — Prompt do Moderador
- `regras_decisoes.md` — Regras da IA

---

## 🗣️ Fase 10: Fase O (Solo)

**Status:** [ ] Não iniciada

**Objetivo:** Debate com 1 conselheiro

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`

### ✅ Implementar

**Fluxo:**
- [ ] Moderador apresenta contexto ao conselheiro
- [ ] Conselheiro dá perspectiva
- [ ] Moderador faz perguntas de aprofundamento
- [ ] Usuário pode intervir
- [ ] Rounds inteligentes (IA decide quando avançar)
- [ ] Transição para Fase L

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modo Solo
- `regras_decisoes.md` — Confronto obrigatório

---

## 🎭 Fase 11: Fase O (Mesa)

**Status:** [ ] Não iniciada

**Objetivo:** Debate entre 2 conselheiros

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`

### ✅ Implementar

**Fluxo:**
- [ ] Moderador apresenta contexto
- [ ] Conselheiro 1 dá perspectiva
- [ ] Conselheiro 2 responde/contrapõe
- [ ] Moderador provoca tensões
- [ ] Moderador convida usuário a intervir
- [ ] Rounds inteligentes
- [ ] Transição para Fase L

**Técnico:**
- [ ] Gerenciar turnos de fala
- [ ] Prompts que referenciam contexto anterior
- [ ] Detecção de consenso/divergência

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modo Mesa de Debate
- `regras_decisoes.md` — Streaming e Latência

---

## ⚖️ Fase 12: Fase L (Decisão)

**Status:** [ ] Não iniciada

**Objetivo:** Síntese e captura de decisão

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`

### ✅ Implementar

**Fluxo:**
- [ ] Moderador sintetiza posições
- [ ] Moderador apresenta opções/caminhos
- [ ] Usuário escolhe
- [ ] Moderador captura raciocínio
- [ ] Registro de alternativas descartadas
- [ ] Transição para Fase D

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fase L
- `regras_decisoes.md` — Estrutura de Decisão

---

## 🚀 Fase 13: Fase D (Ação)

**Status:** [ ] Não iniciada

**Objetivo:** Próxima ação e encerramento

### 📚 Skills
- `prompt-engineer`, `architecture`

### ✅ Implementar

**Fluxo:**
- [ ] Moderador pede próxima ação concreta
- [ ] Moderador pede prazo de revisão
- [ ] Salvar sessão completa
- [ ] Criar registro de decisão
- [ ] Encerrar com confirmação sóbria

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fase D + Animação de Transição
- `regras_decisoes.md` — CRM de Decisões

---

## 📊 Fase 14: Banco de Decisões

**Status:** [ ] Não iniciada

**Objetivo:** Visualizar histórico de decisões

### 📚 Skills
- `frontend-design`, `mobile-design`, `react-patterns`

### ✅ Implementar

- [ ] Lista de decisões com filtros
- [ ] Detalhe de decisão (contexto, debate, raciocínio)
- [ ] Status de outcome (pendente, sucesso, falha)
- [ ] Link para revisão

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Sistema de Decisões + CRM
- `regras_decisoes.md` — Pipeline de Decisões (Kanban)

---

## 🔄 Fase 15: Modo Revisão

**Status:** [ ] Não iniciada

**Objetivo:** Fluxo de revisão de decisão passada

### 📚 Skills
- `prompt-engineer`, `frontend-design`

### ✅ Implementar

- [ ] Seletor de decisão para revisar
- [ ] Moderador apresenta contexto original
- [ ] Perguntas sobre outcome
- [ ] Registro de aprendizado
- [ ] Atualizar status da decisão

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Sistema de Decisões (Revisão)
- `regras_decisoes.md` — Triggers de Revisão

---

## ⏸️ Fase 16: Pausar/Retomar

**Status:** [ ] Não iniciada

**Objetivo:** Sessões pausáveis

### 📚 Skills
- `architecture`, `react-patterns`

### ✅ Implementar

- [ ] Botão pausar na interface de sessão
- [ ] Salvar estado completo da sessão
- [ ] Lista de sessões pausadas na sidebar
- [ ] Retomar do ponto exato
- [ ] Moderador recapitula contexto ao retomar

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxos Especiais
- `regras_decisoes.md` — Regras de Sessão

---

## 🗂️ Fase 16.5: CRM Base

**Status:** [ ] Não iniciada

**Objetivo:** North Star + Projetos + Kanban de Decisões

### 📚 Skills
- `frontend-design`, `mobile-design`, `react-patterns`, `architecture`

### ✅ Implementar

**Schema (Firestore):**
- [ ] Entidade `NorthStar` (1 por usuário)
  - `id`, `userId`, `title`, `description`, `createdAt`
- [ ] Entidade `Project`
  - `id`, `userId`, `name`, `description`, `northStarId?`, `createdAt`, `status`
- [ ] Adicionar `projectId?` em `Decision`
- [ ] Adicionar `status` em `Decision` (enum: `draft` | `pending` | `watching` | `audited`)

**Kanban (4 colunas fixas):**
- [ ] Coluna "Em Debate" (status: `draft`)
- [ ] Coluna "Decidido" (status: `pending`)
- [ ] Coluna "Em Maturação" (status: `watching`)
- [ ] Coluna "Auditado" (status: `audited`)

**UI:**
- [ ] Visualização Kanban (desktop: cards horizontais)
- [ ] Visualização Lista (mobile: acordeão por status)
- [ ] Cards clicáveis (abre detalhe da decisão)
- [ ] SEM drag-and-drop no MVP

**North Star:**
- [ ] Tela de criação/edição simplificada
- [ ] Limite: 1 por usuário
- [ ] Mostrar no topo do CRM

**Projetos:**
- [ ] CRUD simples de projetos
- [ ] Vincular decisão a projeto (opcional)
- [ ] Filtrar Kanban por projeto

**Regras:**
- [ ] Usuário NÃO pode criar colunas novas (metodologia opinativa)
- [ ] Status muda automaticamente conforme fluxo HOLD
- [ ] `draft` → enquanto em H/O
- [ ] `pending` → após Fase D (ação definida)
- [ ] `watching` → após marcar "ação executada"
- [ ] `audited` → após marcar outcome

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — CRM de Decisões + FTUX
- `regras_decisoes.md` — CRM de Decisões (Hierarquia + Kanban)
- `design_system.md` — Tokens de interface

---

## 🎓 Fase 17: Onboarding + FTUX

**Status:** [ ] Não iniciada

**Objetivo:** First-Time User Experience integrado com CRM

### 📚 Skills
- `frontend-design`, `ui-ux-pro-max`

### ✅ Implementar

**Primeiro Login (FTUX):**
- [ ] Detectar primeiro login (flag `hasCompletedOnboarding`)
- [ ] Tela de boas-vindas premium
- [ ] "Você tem uma decisão travada?" (hook emocional)
- [ ] Portal simplificado: botão gigante "Comece sua primeira sessão"
- [ ] Redirecionar para sessão (Solo por padrão)

**Após Primeira Sessão:**
- [ ] Animação de transição: card "voa" para o Kanban
- [ ] Preview do card aparece e vai para coluna "Decidido"
- [ ] Highlight temporário no card (2s)
- [ ] Marcar `hasCompletedOnboarding = true`

**Tour de Onboarding (Cartões Flutuantes):**
- [ ] Explicar colunas do Kanban
- [ ] Mostrar onde criar Projeto
- [ ] Mostrar onde fica North Star
- [ ] Mostrar botão Nova Sessão
- [ ] Opção "Pular tour" disponível

**Requisitos:**
- [ ] Animações suaves (não exageradas)
- [ ] Progress indicator no tour
- [ ] Skip disponível mas discreto

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — FTUX (First-Time User Experience)
- `regras_decisoes.md` — Navegação Principal
- `design_system.md` — Animações e tokens

---

## ✨ Fase 18: Polish

**Status:** [ ] Não iniciada

**Objetivo:** Refinamentos finais

### ✅ Implementar

- [ ] Animações de transição entre páginas
- [ ] Substituir alerts nativos por modais
- [ ] Loading states em todas as ações
- [ ] Empty states com ilustrações
- [ ] Consistência visual final
- [ ] Testes de responsividade completos
- [ ] Otimizações de performance

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Paridade Desktop/Mobile
- `design_system.md` — Tokens e componentes
- `regras_decisoes.md` — Visão geral do produto

---

## 📎 Referências

| Documento | Conteúdo |
|-----------|----------|
| `regras_decisoes.md` | Regras de negócio |
| `design_system.md` | Tokens e UI |
| `definicao_fluxo.md` | Fluxo HOLD + Mesa |
| `definicao_personas.md` | Prompts das 5 personas |
| `analise_sistema.md` | Análise do código existente |
| `planejamento_master.md` | Roadmap de fases |
| `implementacoes.md` | Lista de implementações |

---

> **Última atualização:** 30/01/2026