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
| 00 | Design System | [x] ✅ | Tokens CSS, componentes base |
| 01 | Limpeza | [x] ✅ | Remover código desnecessário |
| 02 | Personas Base | [x] ✅ | 5 personas pré-definidas |
| 02.5 | Avatares | [ ] | Criar imagens das 5 personas (IA) |
| 03 | Schema Sessão | [x] ✅ | Estrutura de dados para sessões |
| 04 | Auth Ajustes | [x] ✅ | Verificar e ajustar auth existente |
| 05 | Layout Principal | [x] ✅ | Sidebar simplificada, responsivo |
| 06 | Portal | [x] ✅ | Seleção de modo (Solo/Mesa/Revisão) |
| 07 | Seleção Conselheiros | [x] ✅ | UI para escolher conselheiros |
| 08 | Interface Sessão | [x] ✅ | Chat + indicadores de fase |
| 09 | Fase H | [x] ✅ | Moderador + clarificação |
| 10 | Fase O (Solo) | [x] ✅ | 1 conselheiro + moderador |
| 11 | Fase O (Mesa) | [x] ✅ | 2 conselheiros debatendo |
| 12 | Fase L | [x] ✅ | Síntese + decisão |
| 13 | Fase D | [x] ✅ | Ação + prazo |
| 14 | Banco Decisões | [x] ✅ | Histórico + filtros |
| 15 | Modo Revisão | [x] ✅ | Revisar decisões passadas |
| 16 | Pausar/Retomar | [x] ✅ | Sessões pausáveis |
| **16.5** | **CRM Base** | **[x] ✅** | **North Star + Projetos + Kanban** |
| **16.6** | **Correções API** | **[x] ✅** | **Modelos de IA em todas as APIs** |
| **16.7** | **Correções Fluxo** | **[x] ✅** | **Transições, userId, conselheiros** |
| **16.8** | **Limpeza Código** | **[x] ✅** | **Removido ~200KB de código morto** |
| **16.9** | **Validações** | **[x] ✅** | **Limite projetos, seed personas, error handling** |
| 17 | Onboarding | [x] ✅ | FTUX com hook emocional + Tour |
| 18 | Polish | [x] ✅ | Animações, Skeleton, EmptyState |
| **19** | **Data Layer** | **[x] ✅** | **Firestore + Fix onboarding race condition** |
| **20** | **Settings & Account** | **[x] ✅** | **Notificações + Exclusão de conta** |
| **21** | **Project Context** | **[x] ✅** | **Contexto/informações por projeto** |
| **22** | **Chat Actions** | **[x] ✅** | **Copy, Edit, Regenerate (padrão ChatGPT)** |

---

# 🏗️ FASES DETALHADAS

---

## 🎨 Fase 00: Design System

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Implementar tokens e componentes base do Design System

### 📚 Skills
- `frontend-design`, `tailwind-patterns`, `tailwind-design-system`, `mobile-design`

### ✅ Implementar

**Tokens CSS:**
- [x] Tokens de texto: `text-primary`, `text-secondary`, `text-muted`
- [x] Tokens de superfície: `surface-page`, `surface-card`, `surface-elevated`
- [x] Tokens de ação: `action-primary`, `action-secondary`, `action-strong`
- [x] Tokens de borda: `border-default`, `border-subtle`, `border-focus`
- [x] Tokens de status: `status-success`, `status-warning`, `status-error`
- [x] Tokens de confronto: `confrontation`, `confrontation-subtle`
- [x] Tokens de espaçamento: `space-1` a `space-16`
- [x] Dark mode mapeado

**Componentes Base:**
- [x] Button (Primary, Secondary, Strong)
- [x] Card com hover
- [x] Input com focus ring
- [x] Modal base

### 🔍 Verificar
- [x] Build sem erros
- [x] Tokens funcionando
- [x] Dark mode funcional

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxos de interação
- `design_system.md` — Tokens e padrões visuais
- `regras_decisoes.md` — Regras de negócio

---

## 🧹 Fase 01: Limpeza

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Remover código legado e componentes não utilizados

### 📚 Skills
- `codebase-cleanup-refactor-clean`, `production-code-audit`

### ✅ Implementar

**Decisão: MANTER TODOS OS COMPONENTES**

Após análise, todos os 26 componentes foram avaliados e decididos como essenciais:

- [x] `MeetingRoom.tsx` → adaptar para "Mesa de Conselheiros" (futuro)
- [x] `PersonaManager.tsx` → adaptar para gerenciar conselheiros (futuro)
- [x] `PersonaForm.tsx` → adaptar para edição (futuro)
- [x] `ChatInterface.tsx` → adaptar para sessões HOLD (futuro)
- [x] `Sidebar.tsx` → simplificar (futuro)
- [x] `AuthPage.tsx` + `AuthGuard.tsx` + `AuthContext.tsx` — MANTER
- [x] `ThemeToggle.tsx` + `ThemeContext.tsx` — MANTER
- [x] `ConfirmModal.tsx` + `PasswordInput.tsx` — MANTER
- [x] `MeetingSetup.tsx` — MANTER
- [x] `MeetingViewer.tsx` — MANTER
- [x] `ModelSelector.tsx` — MANTER
- [x] `MetricsDashboard.tsx` — MANTER
- [x] `DecisionsDashboard.tsx` — MANTER (CRM de Decisões)
- [x] `CompleteProfile.tsx` — MANTER
- [x] `EditProfileModal.tsx` — MANTER
- [x] `Onboarding.tsx` — MANTER

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxos de interação
- `visao_holdai.md` — Visão geral do produto

---

## 👥 Fase 02: Personas Base

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Criar as 5 personas pré-definidas do sistema

### 📚 Skills
- `prompt-engineer`, `prompt-engineering-patterns`, `llm-application-dev-prompt-optimize`

### ✅ Implementar

**Criar arquivo de personas default:**
- [x] `src/lib/defaultPersonas.ts`
- [x] Prompt completo do Moderador
- [x] Prompt completo do Estrategista
- [x] Prompt completo do Pragmático
- [x] Prompt completo do Analista de Riscos
- [x] Prompt completo do Mentor

**Atualizar tipos:**
- [x] `src/types/index.ts` → Persona type com `isSystem` flag
- [x] Moderador: `isSystem: true`, `isEditable: false`
- [x] Conselheiros: `isSystem: true`, `isEditable: true`

**Integrar com Firebase:**
- [ ] Seed personas default para novos usuários (futuro)
- [ ] Garantir que Moderador não pode ser deletado (futuro)

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Personas do Sistema
- `definicao_personas.md` — Prompts completos
- `regras_decisoes.md` — Regras de IA

---

## 💾 Fase 03: Schema Sessão

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Definir estrutura de dados para sessões de decisão

### 📚 Skills
- `architecture`, `api-patterns`, `software-architecture` ✅

### ✅ Implementar

**Criar tipos em `src/types/index.ts`:**
- [x] `Session` — Sessão HOLD completa
- [x] `SessionMessage` — Mensagem na sessão
- [x] `SessionContext` — Contexto capturado na Fase H
- [x] `SessionConfig` — Configurações de memória/contexto
- [x] `SessionPhase` — Fases H, O, L, D, completed, paused
- [x] `SessionMode` — solo, mesa, mesa_completa, revision, crisis
- [x] `Decision` — Decisão com riscos aceitos
- [x] `DecisionAction` — Ação definida na Fase D
- [x] `DecisionOutcome` — success, partial, failure, pending, pivoted
- [x] `PipelineStatus` — draft, pending, watching, audited
- [x] `Project` — Projeto que agrupa decisões
- [x] `NorthStar` — Objetivo macro do usuário
- [x] `UserProfile` — Perfil com plano e preferências

**Criar services:**
- [x] `src/lib/sessions.ts` com CRUD completo
  - CRUD: create, read, update, delete
  - Phase management: advancePhase, pauseSession, resumeSession
  - Message handling: addMessage
  - Context updates: updateContext, linkDecision
  - Utilities: generateSessionTitle, canAdvancePhase, getPhaseName

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxo HOLD + Mesa
- `regras_decisoes.md` — CRM de Decisões (Schema)

---

## 🔐 Fase 04: Auth Ajustes

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Verificar e ajustar autenticação existente

### 📚 Skills
- `error-handling-patterns` ✅

### ✅ Verificar
- [x] Login email/senha funcionando (`src/lib/auth.ts`)
- [x] Login Google funcionando (`signInWithGoogle`)
- [x] Reset senha funcionando (`resetPassword`)
- [x] AuthGuard protegendo rotas (`src/components/AuthGuard.tsx`)
- [x] Seed de personas default no primeiro login (`seedDefaultPersonas`)

### 📝 Implementações

**Seed de personas default:**
- Função `seedDefaultPersonas()` em `src/lib/auth.ts`
- Chamada automaticamente na criação de novo perfil
- Salva 5 personas default no Firestore subcollection `users/{userId}/personas`
- Verifica se já existem personas antes de fazer seed

**Service de personas atualizado:**
- `src/lib/personas.ts` com CRUD completo
- Funções: `getUserPersonas`, `getUserCounselors`, `getUserModerator`
- Utility functions: `getPersonaColor`, `getPersonaIcon`, `canEditPersona`
- Compatibilidade com código legado mantida

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — FTUX (First-Time User Experience)
- `regras_decisoes.md` — Regras gerais

---

## 📐 Fase 05: Layout Principal

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Simplificar layout para fluxo HoldAI

### 📚 Skills
- `frontend-design` ✅
- `mobile-design` ✅
- `react-patterns` ✅
- `ui-ux-pro-max` ✅

### ✅ Implementar

**Sidebar Simplificada:**
- [x] Logo + brand (mantido)
- [x] Botão "Nova Sessão" → vai para Portal
- [x] Lista de sessões (recentes) com ícone de fase
- [x] Separador "Decisões" → Banco de Decisões
- [x] Link para banco de decisões
- [x] User menu (perfil, configurações, logout)

**Remover da sidebar:**
- [x] Seleção de personas (agora é no Portal)
- [x] Projetos complexos (ProjectSwitcher removido)
- [x] Meetings antigas (removido)
- [x] Métricas (movido/removido)
- [x] MeetingSetup modal removido

### 📝 Implementações

**Novo Componente:**
- `SimplifiedSidebar.tsx` criado com arquitetura limpa
- Interface `SidebarItem` para compatibilidade (Session/Conversation)
- Props tipadas com callbacks definidos
- Formatação de datas relativas
- Ícones visuais por fase (🔍 H, 💬 O, ⚖️ L, ✅ D)

**Integração:**
- `ChatInterface.tsx` atualizado para usar `SimplifiedSidebar`
- Conversão de `Conversation[]` para `SidebarItem[]`
- Imports removidos: `Sidebar`, `MeetingSetup`
- Build verificado e funcionando

**Estrutura Final:**
```
┌─────────────────────────┐
│ Logo + Brand            │
│ [Nova Sessão] ← CTA     │
├─────────────────────────┤
│ Sessões Recentes        │
│ - Sessão 1 (Fase H)     │
│ - Sessão 2 (Fase O)     │
├─────────────────────────┤
│ 📋 Banco de Decisões    │
├─────────────────────────┤
│ 👤 User Menu            │
│ ⚙️ Preferências         │
└─────────────────────────┘
```

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Navegação Principal (CRM é a Home)
- `regras_decisoes.md` — Navegação e FTUX
- `design_system.md` — Tokens e componentes

---

## 🚪 Fase 06: Portal

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Tela de seleção de modo

### 📚 Skills
- `frontend-design` ✅
- `ui-ux-pro-max` ✅

### ✅ Implementar

**UI do Portal:**
- [x] 3 cards grandes: Solo, Mesa, Revisão
- [x] Cada card com ícone + título + descrição
- [x] Hover premium com animação sutil
- [x] Sem campo de texto (regra de ouro)
- [x] Botão "Continuar" desabilitado até selecionar modo

**Cards:**
- [x] **Solo**: "Consulte 1 conselheiro para perspectiva específica"
- [x] **Mesa**: "Reúna 2 conselheiros para debate estruturado"
- [x] **Revisão**: "Revise uma decisão passada"

### 📝 Implementações

**Novo Componente:**
- `Portal.tsx` criado com design industrial/minimal
- Props: `onSelectMode`, `isFirstTime`, `onCancel`
- `ModeCard` sub-componente reutilizável
- Estados: selected, hover, disabled, comingSoon
- Ícones SVG customizados para cada modo

**Integração:**
- `ChatInterface.tsx` atualizado com estado `showPortal`
- Handler `handlePortalModeSelect` para fluxo de criação
- FTUX detectado via `conversations.length === 0`
- Build verificado e funcionando

**Anti-Padrões Evitados:**
- ❌ Campo de texto livre
- ❌ "O que você quer fazer hoje?"
- ❌ Emojis animados
- ❌ Mensagens entusiasmadas

**Estrutura Visual:**
```
┌─────────────────────────────────────────────────────────┐
│                   Nova Sessão                           │
│            Selecione o modo de interação                │
├─────────────────────────────────────────────────────────┤
│ ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│ │    👤      │  │    👥      │  │    🔄      │            │
│ │   Solo     │  │   Mesa     │  │  Revisão   │            │
│ │ 1 conselho │  │ 2 debate   │  │ passado    │            │
│ └───────────┘  └───────────┘  └───────────┘            │
├─────────────────────────────────────────────────────────┤
│           [Cancelar]  [Continuar →]                     │
└─────────────────────────────────────────────────────────┘
```

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modos de Interação
- `regras_decisoes.md` — Anti-Padrões do Portal
- `design_system.md` — Tokens de ação

---

## 👥 Fase 07: Seleção Conselheiros

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** UI para escolher conselheiros

### 📚 Skills
- `frontend-design` ✅
- `mobile-design` ✅

### ✅ Implementar

**Modo Solo:**
- [x] Grid 2x2 com os 4 conselheiros
- [x] Card com avatar + nome + descrição curta
- [x] Selecionar 1 → avançar

**Modo Mesa:**
- [x] Grid 2x2 com os 4 conselheiros
- [x] Selecionar 2 → avançar
- [x] Feedback visual de seleção (borda, checkmark)

### 📝 Implementações

**Novo Componente:**
- `CounselorSelection.tsx` criado com grid 2x2 responsivo
- Props: `mode`, `onConfirm`, `onBack`
- `CounselorCard` sub-componente reutilizável
- Estados: selected, hover, disabled
- Cores únicas por conselheiro (indigo, emerald, amber, violet)

**Conselheiros Disponíveis:**
| ID | Nome | Cor |
|----|------|-----|
| `system-strategist` | Estrategista | Indigo |
| `system-pragmatist` | Pragmático | Emerald |
| `system-risk-analyst` | Analista de Riscos | Amber |
| `system-mentor` | Mentor | Violet |

**Integração:**
- `ChatInterface.tsx` atualizado com handlers:
  - `handleCounselorConfirm` para iniciar sessão
  - `handleCounselorBack` para voltar ao Portal
- Fluxo: Portal → CounselorSelection → Sessão
- Build verificado e funcionando

**Mobile Design Applied:**
- Touch targets ≥ 44px (cards 160px min-height)
- Grid responsivo: 1 coluna mobile, 2 colunas sm+
- Feedback visual imediato na seleção
- Botões com área de toque adequada

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Personas do Sistema
- `defaultPersonas.ts` — Dados das personas

---

## 💬 Fase 08: Interface Sessão

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Interface de chat para sessões HOLD

### 📚 Skills
- `frontend-design` ✅
- `mobile-design` ✅
- `react-patterns` ✅

### ✅ Implementar

**Layout:**
- [x] Header com: fase atual (H/O/L/D), conselheiros ativos, pausar/encerrar
- [x] Área de mensagens com scroll
- [x] Input do usuário
- [x] Indicadores visuais de quem está falando

**Indicadores de Speaker:**
- [x] Moderador: cor neutra (slate), ícone específico
- [x] Conselheiros: cores distintas por persona
- [x] Usuário: alinhado diferente (margem esquerda)

### 📝 Implementações

**Novo Componente: `SessionInterface.tsx`**
- Header com badge de fase (H/O/L/D/completed/paused)
- Avatares empilhados dos conselheiros ativos
- Botões Pausar/Encerrar com confirmação
- Área de mensagens scrollável com auto-scroll
- Input auto-resizável com suporte Enter/Shift+Enter
- Indicador de "digitando..." por persona (TypingIndicator)

**Sub-componentes:**
- `SessionMessage` — Mensagem individual com avatar e timestamp
- `TypingIndicator` — Indicador de persona digitando
- `SessionHeader` — Header com fase e ações

**Cores por Persona (SPEAKER_COLORS):**
| Persona | Fundo | Avatar |
|---------|-------|--------|
| Moderador | slate | slate-500 |
| Estrategista | indigo | gradient indigo→blue |
| Pragmático | emerald | gradient emerald→green |
| Analista | amber | gradient amber→orange |
| Mentor | violet | gradient violet→purple |
| Usuário | primary/5 | primary |

**Integração com ChatInterface:**
- Estado `activeSession` adicionado
- Handlers `handleEndSession` e `handlePauseSession`
- Flow: Portal → CounselorSelection → **SessionInterface**
- Build verificado e funcionando

**React Patterns Aplicados:**
- Compound components (SessionHeader, SessionMessage)
- Custom hooks potencial (useSessionScroll)
- State at appropriate level (ChatInterface gerencia sessão)
- Props down, events up
- Composition over inheritance

**Mobile Design Aplicado:**
- Touch targets ≥ 44px
- Input com altura mínima confortável
- Botões com área adequada
- Header compacto em mobile (esconde labels)

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fluxo HOLD + Indicadores ✅
- `design_system.md` — Cores por persona ✅
- `regras_decisoes.md` — Streaming e Latência ✅

---

## 🔤 Fase 09: Fase H (Clarificação)

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Implementar fase H com Moderador

### 📚 Skills
- `prompt-engineer` ✅
- `prompt-engineering-patterns` ✅
- `llm-evaluation` ✅

### ✅ Implementar

**Fluxo:**
- [x] Moderador abre com pergunta inicial
- [x] Perguntas de acompanhamento (mínimo 5)
- [x] Captura de contexto estruturado
- [x] Moderador apresenta resumo
- [x] Transição para Fase O

**API:**
- [x] `/api/session/phase-h` com streaming
- [x] Prompt do Moderador para fase H

### 📝 Implementações

**Novo Arquivo: `src/lib/prompts/phaseH.ts`**
Sistema de prompts estruturado seguindo prompt-engineer skill:

| Prompt | Descrição |
|--------|-----------|
| `MODERATOR_PHASE_H_SYSTEM_PROMPT` | System prompt do Moderador (cético) |
| `CLARIFICATION_FOLLOW_UP_PROMPT` | Chain-of-thought para próximas perguntas |
| `ACTIVE_VALIDATION_PROMPT` | Validação ativa (não passiva) |
| `PHASE_H_SUMMARY_PROMPT` | Resumo estruturado |
| `CONTEXT_EXTRACTION_PROMPT` | Extração JSON do contexto |

**Tipos Criados:**
```typescript
interface PhaseHContext {
    problem: string;
    businessContext: string;
    timing: string;
    stakeholders: string[];
    alternatives: string[];
    risks: string[];
    gains: string[];
    completeness: { ... };
}
```

**Novo Arquivo: `src/app/api/session/phase-h/route.ts`**
API Route com:
- Streaming via SSE (Server-Sent Events)
- Integração com Gemini API
- Ação `chat` para conversa
- Ação `extract_context` para extração JSON

**Novo Hook: `src/hooks/usePhaseH.ts`**
Hook React para gerenciar Fase H:
- Estado: `initial` → `clarifying` → `validating` → `ready`
- Mensagens com streaming
- Extração automática de contexto
- Transição para Fase O

**Integração SessionInterface:**
- Refatorado para usar `usePhaseH` hook
- Removida lógica simulada
- Integração real com API streaming

**Técnicas Aplicadas (prompt-engineer):**
| Técnica | Aplicação |
|---------|-----------|
| Chain-of-Thought | Análise passo a passo do contexto |
| Constitutional AI | Regras comportamentais rígidas |
| Active Validation | "Com base no que você disse, X está correto?" |
| Progressive Disclosure | Pergunta uma coisa de cada vez |
| Structured Output | Resumo em formato definido |

**Métricas de Avaliação (llm-evaluation):**
| Métrica | Descrição |
|---------|-----------|
| Completeness | Critérios de completude checados |
| Accuracy | Validação ativa do contexto |
| Consistency | Formato de resumo padronizado |

**Prompt Engineering Patterns:**
- Few-shot não necessário (zero-shot eficaz)
- System prompt bem estruturado
- Formato de saída explícito
- Fallback instructions incluídas

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Fase H (Clarificação) ✅
- `defaultPersonas.ts` — Prompt do Moderador ✅
- `regras_decisoes.md` — Regras da IA ✅

---

## 🗣️ Fase 10: Fase O (Solo)

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Debate com 1 conselheiro

### 📚 Skills
- `prompt-engineer` ✅
- `prompt-engineering-patterns` ✅

### ✅ Implementar

**Fluxo:**
- [x] Moderador apresenta contexto ao conselheiro
- [x] Conselheiro dá perspectiva
- [x] Moderador faz perguntas de aprofundamento
- [x] Usuário pode intervir
- [x] Rounds inteligentes (IA decide quando avançar)
- [x] Transição para Fase L

### � Implementações

**Novo Arquivo: `src/lib/prompts/phaseO.ts`**
Sistema de prompts para Fase O (Debate Solo):

| Função | Descrição |
|--------|-----------|
| `getModeratorPresentationPrompt()` | Apresenta contexto ao conselheiro |
| `getCounselorSystemPrompt()` | System prompt adaptado por persona |
| `getCounselorResponsePrompt()` | Prompt para resposta do conselheiro |
| `MODERATOR_PROBE_SYSTEM_PROMPT` | Técnicas de aprofundamento |
| `getModeratorProbePrompt()` | Perguntas de follow-up |
| `getTransitionToLPrompt()` | Síntese para Fase L |
| `shouldContinueDebate()` | Heurísticas de continuação |
| `getNextSpeaker()` | Gerenciamento de turnos |

**Tipos Criados:**
```typescript
interface PhaseOState {
    phase: "presenting" | "counselor_speaking" | ...;
    currentRound: number;
    maxRounds: number;
    counselorHasSpoken: boolean;
    userHasIntervened: boolean;
    keyPoints: string[];
}

interface SpeakingTurn {
    speaker: "moderator" | "counselor" | "user";
    type: "presentation" | "perspective" | ...;
}
```

**Novo Arquivo: `src/app/api/session/phase-o/route.ts`**
API Route com ações:
- `present_context` — Moderador apresenta
- `counselor_response` — Conselheiro responde
- `moderator_probe` — Moderador aprofunda
- `transition` — Síntese para Fase L
- `chat` — Fluxo geral

**Novo Hook: `src/hooks/usePhaseO.ts`**
Hook React para gerenciar Fase O:
- Orquestra turnos: Moderador → Conselheiro → Moderador → Usuário
- Streaming sequencial (não paralelo)
- Rounds inteligentes (até 3)
- Transição automática para Fase L

**Integração SessionInterface:**
- Estado `phaseHContext` para passar contexto entre fases
- Seleção dinâmica de hook (phaseH ou phaseO)
- `startDebate()` chamado ao entrar na Fase O
- Transição fluida H → O → L

**Técnicas Aplicadas (prompt-engineer):**
| Técnica | Aplicação |
|---------|-----------|
| Multi-agent Prompting | Moderador + Conselheiro coordenados |
| Role-based System Prompts | Cada persona com instruções próprias |
| Sequential Prompting | Turnos sequenciais, não paralelos |
| Context Injection | Contexto H passado para prompts O |

**Prompt Engineering Patterns:**
| Pattern | Aplicação |
|---------|-----------|
| Prompt Chaining | H context → O prompts |
| Progressive Disclosure | Aprofundamento gradual |
| Conflict Provocation | Moderador provoca tensões |
| User Invitation | Convites ativos para participar |

**Regras de Streaming (regras_decisoes.md):**
- ✅ Sequencial, não paralelo
- ✅ Indicador "Digitando..." por persona
- ✅ Limite 150-200 palavras/turno
- ✅ Próxima persona após anterior terminar

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modo Solo ✅
- `regras_decisoes.md` — Streaming Sequencial ✅

---

## 🎭 Fase 11: Fase O (Mesa)

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Debate entre 2 conselheiros

### 📚 Skills
- `prompt-engineer` ✅
- `prompt-engineering-patterns` ✅

### ✅ Implementar

**Fluxo:**
- [x] Moderador apresenta contexto
- [x] Conselheiro 1 dá perspectiva
- [x] Conselheiro 2 responde/contrapõe
- [x] Moderador provoca tensões
- [x] Moderador convida usuário a intervir
- [x] Rounds inteligentes
- [x] Transição para Fase L

**Técnico:**
- [x] Gerenciar turnos de fala
- [x] Prompts que referenciam contexto anterior
- [x] Detecção de consenso/divergência

### 📝 Implementações

**Novo Arquivo: `src/lib/prompts/phaseOMesa.ts`**
Sistema de prompts para Fase O (Mesa com 2 conselheiros):

| Função | Descrição |
|--------|-----------|
| `getModeratorMesaPresentationPrompt()` | Apresenta contexto à mesa |
| `getCounselor1SystemPrompt()` | System prompt com context de conflito |
| `getCounselor2ReactionPrompt()` | Prompt de reação/contraponto |
| `MODERATOR_PROVOCATION_SYSTEM_PROMPT` | Técnicas de provocação de tensão |
| `getModeratorProvocationPrompt()` | Provoca tensões específicas |
| `getCounselorRebuttalPrompt()` | Resposta a contraponto |
| `getModeratorMesaTransitionPrompt()` | Síntese com consenso/divergência |
| `shouldMesaContinue()` | Heurísticas de continuação |
| `getNextMesaSpeaker()` | Gerenciamento de turnos |

**Tipos Criados:**
```typescript
interface PhaseOMesaState {
    phase: "presenting" | "counselor1_speaking" | ...;
    currentRound: number;
    maxRounds: number;
    counselor1HasSpoken: boolean;
    counselor2HasSpoken: boolean;
    userHasIntervened: boolean;
    debatePoints: DebatePoint[];
    tensionLevel: "low" | "medium" | "high";
}

interface DebatePoint {
    speaker: string;
    position: string;
    counterpoint?: string;
    resolution?: "consensus" | "divergence" | "open";
}
```

**Novo Arquivo: `src/app/api/session/phase-o-mesa/route.ts`**
API Route com ações:
- `present_context` — Moderador apresenta à mesa
- `counselor1_response` — Conselheiro 1 inicia
- `counselor2_reaction` — Conselheiro 2 reage
- `counselor1_rebuttal` — Contra-argumentação
- `counselor2_rebuttal` — Contra-argumentação
- `moderator_provoke` — Provoca tensão
- `transition` — Síntese com consenso/divergência

**Novo Hook: `src/hooks/usePhaseOMesa.ts`**
Hook React para gerenciar debate Mesa:
- Orquestra turnos: Mod → C1 → C2 → Mod → Usuário
- Streaming sequencial obrigatório
- Tracking de tensão (low/medium/high)
- Até 4 rounds (mais que Solo)
- Transição com síntese

**Integração SessionInterface:**
- Detecção automática de modo Mesa (2+ conselheiros)
- Seleção dinâmica: `usePhaseO` vs `usePhaseOMesa`
- `isMesaMode` flag baseado em counselors.length
- Transição fluida H → O/Mesa → L

**Técnicas Aplicadas (prompt-engineer):**
| Técnica | Aplicação |
|---------|-----------|
| Multi-agent Prompting | 2 conselheiros + Moderador |
| Conflict Prompting | C1 e C2 têm vieses opostos |
| Cross-reference Prompting | C2 referencia fala de C1 |
| Tension Escalation | Moderador provoca pontos de tensão |

**Prompt Engineering Patterns:**
| Pattern | Aplicação |
|---------|-----------|
| Debate Chain | C1 → C2 → C1 (debate cruzado) |
| Reaction Prompting | C2 DEVE reagir ao que C1 disse |
| Consensus/Divergence Detection | Síntese identifica onde concordam/discordam |
| Provocation Techniques | 5 técnicas de provocação no system prompt |

**Regras de Streaming (regras_decisoes.md):**
- ✅ Sequencial: C1 termina → C2 inicia
- ✅ C2 realmente reage ao C1
- ✅ "Digitando..." por persona
- ✅ Limite 150-200 palavras/turno
- ✅ Rounds de debate, não wall of text

### 📖 Consultar Antes de Implementar
- `fluxos_jornadas.md` — Modo Mesa de Debate ✅
- `regras_decisoes.md` — Streaming e Latência ✅

---

## ⚖️ Fase 12: Fase L (Decisão)

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Síntese e captura de decisão

### 📚 Skills Utilizadas
- ✅ `prompt-engineer` — Decision capture prompts
- ✅ `prompt-engineering-patterns` — Progressive disclosure, chain-of-thought

### ✅ Implementar

**Fluxo:**
- [x] Moderador sintetiza posições
- [x] Moderador apresenta opções/caminhos
- [x] Usuário escolhe
- [x] Moderador captura raciocínio
- [x] Registro de alternativas descartadas
- [x] Transição para Fase D

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — Fase L: Sintetiza → Apresenta → Captura
- ✅ `regras_decisoes.md` — Schema de Decisão (decision, reasoning, alternatives, acceptedRisks)

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prompts/phaseL.ts` | Sistema de prompts para Fase L |
| `src/app/api/session/phase-l/route.ts` | API route com streaming |
| `src/hooks/usePhaseL.ts` | Hook React para gerenciar a fase |

### 🔧 Modificações

| Arquivo | Alteração |
|---------|-----------|
| `src/components/SessionInterface.tsx` | Integração do usePhaseL hook |

### 📋 Funcionalidades Implementadas

| Feature | Implementação |
|---------|---------------|
| Síntese do Debate | Moderador analisa consensos, divergências, riscos |
| Apresentação de Opções | 2-3 opções equilibradas + "Adiar decisão" |
| Captura de Decisão | Confirmação ativa com riscos aceitos |
| Captura de Raciocínio | Por que o usuário escolheu esse caminho |
| Registro Estruturado | CapturedDecision com alternativas e riscos |
| Adiar Decisão | Opções: pausar, reduzir escopo, experimento |
| Transição para D | Mensagem elegante pedindo próxima ação |

### 🎯 Schema de Decisão (regras_decisoes.md)

```typescript
interface CapturedDecision {
    decision: string;       // Texto da decisão
    reasoning: string;      // Lógica/raciocínio
    alternatives: string[]; // Opções descartadas
    acceptedRisks: string[];// Riscos aceitos
    nextAction?: string;    // Preenchido na Fase D
    reviewDate?: Date;      // Preenchido na Fase D
}
```

---

## 🚀 Fase 13: Fase D (Ação)

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Próxima ação e encerramento

### 📚 Skills Utilizadas
- ✅ `prompt-engineer` — Action capture prompts
- ✅ `architecture` — Session record structure, data persistence patterns

### ✅ Implementar

**Fluxo:**
- [x] Moderador pede próxima ação concreta
- [x] Moderador pede prazo de revisão
- [x] Salvar sessão completa
- [x] Criar registro de decisão
- [x] Encerrar com confirmação sóbria

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — Fase D: Exige ação → Define prazo → Encerra
- ✅ `regras_decisoes.md` — CRM de Decisões, Pipeline Status

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prompts/phaseD.ts` | Sistema de prompts para Fase D |
| `src/app/api/session/phase-d/route.ts` | API route com streaming |
| `src/hooks/usePhaseD.ts` | Hook React para gerenciar a fase |

### 🔧 Modificações

| Arquivo | Alteração |
|---------|-----------|
| `src/components/SessionInterface.tsx` | Integração do usePhaseD hook |

### 📋 Funcionalidades Implementadas

| Feature | Implementação |
|---------|---------------|
| Pedido de Ação | Moderador exige ação concreta executável em 24-48h |
| Pedido de Prazo | Opções: Hoje, Amanhã, Esta semana, Personalizado |
| Data de Revisão | Opções: 1 semana, 2 semanas, 1 mês, 3 meses |
| Confirmação Final | Resume decisão, ação, prazo e revisão |
| Encerramento Sóbrio | Sem celebrações, tom profissional |
| Salvamento de Sessão | SessionRecord com todos os dados |

### 🎯 Schema de Sessão (regras_decisoes.md)

```typescript
interface SessionRecord {
    sessionId: string;
    userId: string;
    decision: CapturedDecision;
    nextAction: string;
    actionDeadline: Date;
    reviewDate: Date;
    pipelineStatus: "draft" | "pending" | "watching" | "audited";
    mode: "solo" | "mesa";
    counselors: string[];
    createdAt: Date;
    completedAt?: Date;
}
```

### 🏁 Tom de Encerramento

**Anti-patterns evitados:**
- ❌ "Parabéns!" (celebração exagerada)
- ❌ "Você vai arrasar!" (validação genérica)
- ❌ "Boa sorte!" (descarta responsabilidade)

**Frases aprovadas:**
- ✅ "Decisão registrada. Até a revisão."
- ✅ "Você decidiu com consciência. O resto é execução."
- ✅ "Vou te lembrar na data marcada."

---

## 📊 Fase 14: Banco de Decisões

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Visualizar histórico de decisões

### 📚 Skills Utilizadas
- ✅ `frontend-design` — Distinctive, high-craft interfaces
- ✅ `mobile-design` — Responsive layout adaptation
- ✅ `react-patterns` — Component composition, hooks patterns

### ✅ Implementar

- [x] Lista de decisões com filtros
- [x] Detalhe de decisão (contexto, debate, raciocínio)
- [x] Status de outcome (pendente, sucesso, falha)
- [x] Link para revisão

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — Sistema de Decisões + CRM
- ✅ `regras_decisoes.md` — Pipeline de Decisões (Kanban)
- ✅ `design_system.md` — Tokens visuais, Industrial Minimal

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useDecisions.ts` | Hook para gerenciar decisões |
| `src/components/DecisionBank/DecisionBank.tsx` | Componente principal |
| `src/components/DecisionBank/DecisionCard.tsx` | Card de decisão |
| `src/components/DecisionBank/DecisionFilters.tsx` | Filtros e stats |
| `src/components/DecisionBank/DecisionDetail.tsx` | Painel de detalhes |
| `src/components/DecisionBank/index.ts` | Exportações |

### 📋 Funcionalidades Implementadas

| Feature | Implementação |
|---------|---------------|
| **Lista de Decisões** | Grid responsivo com cards |
| **Filtros** | Por status, outcome, projeto, busca, crise |
| **Estatísticas** | Total, revisões pendentes, taxa de sucesso |
| **Detalhe de Decisão** | Slide panel com todas as informações |
| **Marcar Ação Feita** | Transição `pending` → `watching` |
| **Auditoria** | Marcar outcome (sucesso/parcial/falha/pivotei) |
| **Status Visual** | Badges coloridos por pipeline status |
| **Projetos** | Tags coloridas com vinculação |
| **Crise** | Badge e borda destacada |
| **Responsivo** | Mobile-first layout |

### 🎨 Direção Estética (frontend-design skill)

| Aspecto | Escolha |
|---------|---------|
| **Tone** | Industrial Minimal / Strategic Severity |
| **Paleta** | Slate neutrals + Violet confrontation |
| **Layout** | Sidebar filters + Grid cards |
| **Interação** | Hover elevação, slide panel smooth |
| **Diferenciador** | Cards com status, progresso e riscos visíveis |

### 📊 Pipeline Kanban (regras_decisoes.md)

| Status | Nome | Transição |
|--------|------|-----------|
| `draft` | Em Debate | Automático (Fase H/O/L) |
| `pending` | Decidido | Automático (Fase D) |
| `watching` | Em Maturação | Manual (usuário marca) |
| `audited` | Auditado | Manual (usuário marca outcome) |

### 🔧 Patterns Utilizados (react-patterns skill)

| Pattern | Implementação |
|---------|---------------|
| **Compound Components** | DecisionBank compõe Card, Filters, Detail |
| **Custom Hook** | useDecisions abstrai estado e lógica |
| **Controlled Filters** | Estado elevado para o hook |
| **Memoization** | useMemo para decisions filtradas e stats |
| **Composition over Props** | Componentes pequenos e focados |

---

## 🔄 Fase 15: Modo Revisão

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Fluxo de revisão de decisão passada

### 📚 Skills Utilizadas
- ✅ `prompt-engineer` — Prompt design, chain-of-thought, extraction
- ✅ `frontend-design` — Modal UI, Industrial Minimal aesthetic

### ✅ Implementar

- [x] Seletor de decisão para revisar
- [x] Moderador apresenta contexto original
- [x] Perguntas sobre outcome
- [x] Registro de aprendizado
- [x] Atualizar status da decisão

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — Sistema de Decisões (Revisão)
- ✅ `regras_decisoes.md` — Triggers de Revisão, Fluxo de Revisão

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prompts/revision.ts` | Prompts do Moderador em Modo Revisão |
| `src/app/api/session/revision/route.ts` | API route com SSE streaming |
| `src/hooks/useRevision.ts` | Hook para gerenciar fluxo de revisão |
| `src/components/Revision/RevisionModal.tsx` | Modal de revisão completo |
| `src/components/Revision/index.ts` | Exportações |

### 📋 Funcionalidades Implementadas

| Feature | Implementação |
|---------|---------------|
| **Apresentação** | Moderador resume decisão original |
| **Seleção de Outcome** | Botões: Funcionou, Parcial, Não funcionou, Pivotei |
| **Exploração** | Perguntas específicas por outcome |
| **Captura de Aprendizado** | Pergunta acionável para futuro |
| **Confirmação** | Resumo antes de salvar |
| **Persistência** | Salva outcome + explanation + learning |
| **Status Update** | Transição para `audited` |
| **Streaming** | SSE events (mesmo padrão fase-d) |

### 🎯 Fluxo de Revisão (regras_decisoes.md)

```
Lembrete dispara OU usuário inicia
    ↓
"Qual foi o resultado de [decisão]?"
    ↓
├─ Funcionou → Registrar aprendizado
├─ Não funcionou → O que deu errado?
└─ Parcial → O que faltou?
    ↓
Outcome salvo na decisão
```

### 📝 Prompts Implementados (prompt-engineer skill)

| Prompt | Descrição |
|--------|-----------|
| `REVISION_MODERATOR_SYSTEM` | Tom neutro, focado em aprendizado |
| `getPresentDecisionPrompt` | Apresenta contexto original |
| `getExploreOutcomePrompt` | Perguntas por tipo de outcome |
| `getCaptureLearningPrompt` | Extrai insight acionável |
| `getConfirmationPrompt` | Resumo para confirmação |
| `EXTRACT_OUTCOME_PROMPT` | Extrai outcome de texto livre |

### 🎨 UI (frontend-design skill)

| Elemento | Implementação |
|----------|---------------|
| **Modal** | Overlay com slide-up animation |
| **Header** | Ícone + título + decision title |
| **Messages** | Chat-like interface |
| **Outcome Buttons** | Grid 2x2 com cores por tipo |
| **Confirm** | Botão verde + opção de editar |
| **Complete** | Estado visual de sucesso |

### 🔧 Patterns Utilizados (react-patterns skill)

| Pattern | Implementação |
|---------|---------------|
| **Custom Hook** | useRevision abstrai todo o fluxo |
| **State Machine** | Steps controlam o fluxo |
| **SSE Streaming** | Mesmo padrão da fase-d |
| **Controlled Components** | Input gerenciado pelo hook |
| **Callback Pattern** | onComplete para notificar parent |

## ⏸️ Fase 16: Pausar/Retomar

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Sessões pausáveis

### 📚 Skills Utilizadas
- ✅ `architecture` — Simplicity, localStorage approach
- ✅ `react-patterns` — Custom hooks, state management

### ✅ Implementar

- [x] Botão pausar na interface de sessão
- [x] Salvar estado completo da sessão
- [x] Lista de sessões pausadas na sidebar
- [x] Retomar do ponto exato
- [x] Moderador recapitula contexto ao retomar

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — Recapitulação ao Retomar Sessão
- ✅ `regras_decisoes.md` — Regras de Sessão, Política de Contexto

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prompts/sessionResume.ts` | Prompts para recapitulação |
| `src/hooks/useSessionPersistence.ts` | Hook para persistência |
| `src/components/PausedSessions/PausedSessionsList.tsx` | Lista de pausadas |
| `src/components/PausedSessions/ResumeModal.tsx` | Modal de retomada |
| `src/components/PausedSessions/index.ts` | Exportações |

### 📋 Funcionalidades Implementadas

| Feature | Implementação |
|---------|---------------|
| **Pausar Sessão** | `pauseSession()` salva estado completo |
| **Listar Pausadas** | PausedSessionsList com phase badges |
| **Retomar Sessão** | ResumeModal com 3 opções |
| **Opção: Continuar** | Retoma do ponto exato |
| **Opção: Recapitular** | Moderador faz resumo |
| **Opção: Reiniciar** | Novo contexto |
| **Persistência** | localStorage (raw context) |
| **Stats** | Mensagens, duração, fase |

### 🔄 Fluxo de Recapitulação (fluxos_jornadas.md)

```
Usuário retoma sessão pausada
    ↓
Moderador: "Bem-vindo de volta. Aqui está onde paramos:

📋 Decisão em discussão: [resumo]
🎯 Fase atual: [O/L/D]
💬 Último ponto: [resumo]

Você quer:
① Continuar de onde paramos
② Recapitular os pontos principais
③ Reiniciar com novo contexto"
```

### 📐 Decisões Arquiteturais (architecture skill)

| Decisão | Rationale |
|---------|-----------|
| **localStorage** | Simplicidade, MVP, sem backend extra |
| **Raw Context** | 1M tokens Gemini = sem compressão |
| **JSON estruturado** | Serialização simples |
| **No compression** | Regra: "Resumo = Sanitização = Lobotomia" |

### 🔧 Patterns Utilizados (react-patterns skill)

| Pattern | Implementação |
|---------|---------------|
| **Custom Hook** | useSessionPersistence abstrai storage |
| **Presentational** | PausedSessionsList só renderiza |
| **Controlled State** | Modal gerencia seleção |
| **Utility First** | createNewSession factory |
| **Callbacks** | onResume, onClose, onSelect |

## 🗂️ Fase 16.5: CRM Base

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** North Star + Projetos + Kanban de Decisões

### 📚 Skills Utilizadas
- ✅ `frontend-design` — Industrial Minimal, DFII scoring
- ✅ `mobile-design` — Touch-first, accordion mobile
- ✅ `react-patterns` — Custom hooks, state management
- ✅ `architecture` — Simplicity first, localStorage

### ✅ Implementar

**Schema (Firestore/Types):**
- [x] Entidade `NorthStar` (1 por usuário)
  - `id`, `userId`, `title`, `description`, `createdAt`
- [x] Entidade `Project`
  - `id`, `userId`, `name`, `description`, `northStarId?`, `createdAt`, `status`
- [x] Adicionar `projectId?` em `Decision`
- [x] Adicionar `status` em `Decision` (enum: `draft` | `pending` | `watching` | `audited`)

**Kanban (4 colunas fixas):**
- [x] Coluna "Em Debate" (status: `draft`)
- [x] Coluna "Decidido" (status: `pending`)
- [x] Coluna "Em Maturação" (status: `watching`)
- [x] Coluna "Auditado" (status: `audited`)

**UI:**
- [x] Visualização Kanban (desktop: cards horizontais)
- [x] Visualização Lista (mobile: acordeão por status)
- [x] Cards clicáveis (abre detalhe da decisão)
- [x] SEM drag-and-drop no MVP

**North Star:**
- [x] Tela de criação/edição simplificada
- [x] Limite: 1 por usuário
- [x] Mostrar no topo do CRM

**Projetos:**
- [x] CRUD simples de projetos
- [x] Vincular decisão a projeto (opcional)
- [x] Filtrar Kanban por projeto

**Regras:**
- [x] Usuário NÃO pode criar colunas novas (metodologia opinativa)
- [x] Status muda automaticamente conforme fluxo HOLD
- [x] `draft` → enquanto em H/O
- [x] `pending` → após Fase D (ação definida)
- [x] `watching` → após marcar "ação executada"
- [x] `audited` → após marcar outcome

### 📖 Documentação Consultada
- ✅ `fluxos_jornadas.md` — CRM de Decisões + FTUX
- ✅ `regras_decisoes.md` — CRM de Decisões (Hierarquia + Kanban)
- ✅ `design_system.md` — Tokens de interface

### 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/types/crm.ts` | Types para NorthStar, Project, Kanban |
| `src/hooks/useCRM.ts` | Hook para gerenciar estado do CRM |
| `src/components/CRM/NorthStarCard.tsx` | Card do North Star |
| `src/components/CRM/ProjectList.tsx` | Lista de projetos CRUD |
| `src/components/CRM/DecisionCard.tsx` | Card de decisão |
| `src/components/CRM/DecisionKanban.tsx` | Kanban 4 colunas |
| `src/components/CRM/CRMView.tsx` | View principal |
| `src/components/CRM/index.ts` | Exportações |

### 📋 Pipeline de Decisões (regras_decisoes.md)

| Status | Nome | Quando |
|--------|------|--------|
| `draft` | Em Debate | Sessão em andamento (H/O/L) |
| `pending` | Decidido | Fase D concluída |
| `watching` | Em Maturação | Ação executada |
| `audited` | Auditado | Outcome marcado |

### 🏗️ Hierarquia do CRM (regras_decisoes.md)

```
North Star (1 por usuário)
    └── Projetos (N por usuário)
            └── Decisões (N por projeto)
                    └── Ações (N por decisão)
```

### 📐 Decisões Arquiteturais (skills)

| Decisão | Skill | Rationale |
|---------|-------|-----------|
| **localStorage** | architecture | Simplicidade MVP |
| **Colunas fixas** | architecture | Metodologia opinativa |
| **Accordion mobile** | mobile-design | Touch-first |
| **useCRM hook** | react-patterns | Encapsulamento lógica |
| **Industrial Minimal** | frontend-design | Strategic severity |

### 🔌 Integração na Interface

| Componente | Alteração |
|------------|-----------|
| `DecisionsDashboard.tsx` | ❌ Depreciado (CRM agora é tela principal) |
| `ChatInterface.tsx` | ❌ Depreciado (substituído por MainApp + SessionModal) |
| `SimplifiedSidebar.tsx` | ❌ Depreciado (substituído por CRMSidebar) |

### 🆕 Nova Arquitetura (31/01/2026)

| Componente | Descrição |
|------------|-----------|
| `MainApp.tsx` | **Tela principal** — CRM com Kanban, North Star, Projetos |
| `SessionModal.tsx` | Modal de chat (abre ao clicar "Nova Sessão") |
| `CRMSidebar.tsx` | Sidebar com projetos, sessões em andamento, menu do usuário |
| `page.tsx` | Atualizado para usar `MainApp` |

**Mudança de Paradigma:**
- **Antes:** Chat = Tela principal | CRM = Modal
- **Depois:** CRM = Tela principal | Chat = Modal

### 🔧 Features Adicionadas (31/01/2026)

| Feature | Status | Descrição |
|---------|--------|-----------|
| Limite de 3 projetos | ✅ | Usuário não pode criar mais que 3 projetos |
| Sessões em Andamento | ✅ | Lista de sessões com renomear/excluir |
| Retomar Sessão | ✅ | Clicar em sessão abre e carrega mensagens |
| Seletor de Modelo IA | ✅ | **Dentro do Chat** (não no CRM header) |
| Toggle Kanban/Lista | ✅ | Componente DecisionList criado |
| Conselheiros Externo | ✅ | Botão fora do menu do usuário |
| Opções em Projetos | ✅ | Renomear/Excluir via menu ••• |
| Opções em Sessões | ✅ | Renomear/Excluir via menu ••• |
| Diferenciação Solo/Mesa | ✅ | Ícone 👤/👥 no header da sessão |
| Menu do Usuário Limpo | ✅ | Apenas: Editar Perfil, Preferências, Sair |

---

## 🔧 Fase 16.6: Correções de API

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Corrigir configurações de modelos de IA em todas as APIs

### 📚 Skills
- `api-patterns`, `architecture`

### ✅ Implementar

**Atualizar ALLOWED_MODELS e DEFAULT_MODEL:**
- [x] `src/app/api/session/phase-o/route.ts`
  - Mudar para `["gemini-2.5-flash-lite", "gemini-3-flash-preview"]`
  - DEFAULT_MODEL = `"gemini-2.5-flash-lite"`
- [x] `src/app/api/session/phase-o-mesa/route.ts`
  - Mesma atualização
- [x] `src/app/api/session/phase-l/route.ts`
  - Mesma atualização
- [x] `src/app/api/session/phase-d/route.ts`
  - Mesma atualização
- [x] `src/app/api/session/revision/route.ts`
  - Mesma atualização

**Propagar parâmetro model nos hooks:**
- [x] `usePhaseO.ts` — Adicionar `model?: string` às opções
- [x] `usePhaseOMesa.ts` — Adicionar `model?: string` às opções
- [x] `usePhaseL.ts` — Adicionar `model?: string` às opções
- [x] `usePhaseD.ts` — Adicionar `model?: string` às opções
- [x] `SessionInterface.tsx` — Passar `selectedModel` para todos os hooks

### 🔍 Verificar
- [x] Build sem erros
- [ ] Teste manual: selecionar "Avançado" e verificar que todas as fases usam o modelo correto

---

## 🔗 Fase 16.7: Correções de Fluxo

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Corrigir transições entre fases e persistência de dados

### 📚 Skills
- `react-patterns`, `architecture`

### ✅ Implementar

**Corrigir transição de fases:**
- [ ] Refatorar `SessionInterface.tsx` para lazy initialization dos hooks O, L, D *(posposto - baixo impacto)*
- [ ] Hooks devem ser inicializados apenas quando fase anterior completar *(posposto)*
- [ ] Evitar inicialização com `defaultContext` vazio *(posposto)*

**Passar userId real:**
- [x] Adicionar `userId` prop em `SessionInterfaceProps`
- [x] `SessionModal.tsx` — Passar `userId` do contexto de auth
- [x] `usePhaseD` — Receber userId real em vez de "anonymous"

**Persistir conselheiros na sessão:**
- [x] `createConversation` — Salvar IDs dos conselheiros
- [x] `getConversation` — Retornar IDs dos conselheiros
- [x] `SessionModal.tsx` — Reconstruir array de conselheiros ao retomar

**Corrigir fluxo de revisão:**
- [x] Modo revisão marcado como "Coming Soon" no Portal
- [x] Usuários direcionados para usar DecisionBank para revisões

### 🔍 Verificar
- [ ] Transições H→O→L→D funcionam corretamente *(teste manual)*
- [x] Retomar sessão carrega conselheiros originais
- [x] Decisões são salvas com userId correto

---

## 🧹 Fase 16.8: Remoção de Código Morto

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Limpar componentes e código não utilizados

### 📚 Skills
- `codebase-cleanup-refactor-clean`

### ✅ Implementar

**Remover componentes depreciados:**
- [x] Remover `ChatInterface.tsx` (30KB) — Substituído por MainApp + SessionModal
- [x] Remover `SimplifiedSidebar.tsx` (19KB) — Substituído por CRMSidebar
- [x] Remover `DecisionsDashboard.tsx` (1.5KB) — Substituído por CRM
- [x] Remover `Sidebar.tsx` (24KB) — Substituído por CRMSidebar
- [x] Remover `ProjectSwitcher.tsx` (10KB) — Não usado

**Remover componentes legados opcionais:**
- [x] `MeetingRoom.tsx` (44KB) — Removido (código morto, meetingConfig nunca setado)
- [x] `MeetingSetup.tsx` (21KB) — Removido (código morto)
- [x] `MeetingSummary.tsx` (18KB) — Removido (dependia de MeetingRoom)
- [x] `MetricsDashboard.tsx` (25KB) — Removido (código morto)
- [x] `MeetingViewer.tsx` (10KB) — Removido (não referenciado)

**Limpar SessionModal:**
- [x] Removido import e uso de `MeetingRoom`
- [x] Removido estado `meetingConfig` e handlers relacionados

**Remover diretórios não utilizados:**
- [x] `DecisionBank/` (5 arquivos) — Removido (não importado em nenhum lugar)
- [x] `PausedSessions/` (3 arquivos) — Removido (não importado)
- [x] `Revision/` (2 arquivos) — Removido (não importado)

### 🔍 Verificar
- [x] Build sem erros após remoções
- [ ] Funcionalidades principais intactas *(teste manual)*
- [x] Bundle size reduzido (~200KB+ removidos)

---

## 🛡️ Fase 16.9: Validações e Robustez

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Adicionar validações e garantir robustez

### 📚 Skills
- `error-handling-patterns`, `architecture`

### ✅ Implementar

**Validação de projetos:**
- [x] Adicionar validação de limite de 3 projetos no backend
- [x] `createProject` service — Verificar count antes de criar
- [ ] Firestore security rules *(opcional, baixa prioridade)*

**Seed de personas:**
- [x] Seed automático de personas para novos usuários (já implementado em auth.ts)
- [x] Verificar que Moderador não pode ser deletado (adicionado check explícito)
- [x] Tratar caso de usuário sem personas (fallback para DEFAULT_PERSONAS)

**Limpar tipos não utilizados:**
- [x] Documentar `SessionMode = "mesa_completa" | "crisis"` como "(Futuro)"

**Error handling:**
- [x] APIs já têm tratamento de erro com mensagens claras
- [x] Hooks já têm try/catch com setError
- [x] Console logs estruturados para debugging

### 🔍 Verificar
- [x] Limite de projetos funciona (throw error se >= 3)
- [x] Novos usuários recebem personas automaticamente
- [x] Erros são tratados graciosamente

---

## 🎓 Fase 17: Onboarding + FTUX

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** First-Time User Experience integrado com CRM

### 📚 Skills
- `frontend-design`, `ui-ux-pro-max`

### ✅ Implementar

**Primeiro Login (FTUX):**
- [x] Detectar primeiro login (flag `hasCompletedOnboarding` via AuthContext)
- [x] Tela de boas-vindas premium com hook emocional
- [x] "Você tem uma decisão travada?" (hook emocional)
- [x] Portal simplificado: botão gigante "Comece sua primeira sessão"
- [x] Redirecionar para sessão (abre SessionModal)

**Após Primeira Sessão:**
- [x] Onboarding é marcado como completo ao fechar sessão
- [ ] Animação de transição: card "voa" para o Kanban *(fase Polish)*
- [ ] Preview do card aparece e vai para coluna "Decidido" *(fase Polish)*
- [ ] Highlight temporário no card (2s) *(fase Polish)*

**Tour de Onboarding (Cartões Flutuantes):**
- [x] `OnboardingTour` component criado
- [x] Explicar colunas do Kanban
- [x] Mostrar onde criar Projeto
- [x] Mostrar onde fica North Star
- [x] Mostrar botão Nova Sessão
- [x] Opção "Pular tour" disponível

**Requisitos:**
- [x] Animações suaves (CSS transitions)
- [x] Progress indicator no tour
- [x] Skip disponível mas discreto

### 📖 Consultar Antes de Implementar
- ✅ `fluxos_jornadas.md` — FTUX (First-Time User Experience)
- ✅ `regras_decisoes.md` — Navegação Principal
- ✅ `design_system.md` — Animações e tokens

---

## ✨ Fase 18: Polish

**Status:** [x] ✅ Concluída (31/01/2026)

**Objetivo:** Refinamentos finais

### 📚 Skills
- `tailwind-patterns`, `frontend-design`, `ui-ux-pro-max`

### ✅ Implementar

**Animações (globals.css):**
- [x] `animate-flyToKanban` — Card voa para Kanban
- [x] `animate-scaleIn` — Modais e overlays
- [x] `animate-toastSlideIn` — Notificações toast
- [x] `animate-highlightPulse` — Items recém adicionados
- [x] `animate-bounceOnce` — Chamar atenção
- [x] `.skeleton` — Loading shimmer
- [x] `@media (prefers-reduced-motion)` — Acessibilidade

**Componentes Polish:**
- [x] `EmptyState.tsx` — Estados vazios reutilizáveis
- [x] `Skeleton.tsx` — Loading skeletons variados
- [x] `DecisionFlyTransition.tsx` — Animação "card voa"
- [x] `Toast.tsx` — Já existente e funcional
- [x] `ConfirmModal.tsx` — Já existente e funcional

**Items adiados da Fase 17:**
- [x] Animação de transição: card "voa" para o Kanban (DecisionFlyTransition)
- [x] Highlight temporário no card (animate-highlightPulse)

**Outras tarefas:**
- [x] Substituir alerts nativos por modais (ConfirmModal já existe)
- [x] Loading states em todas as ações (Skeleton disponível)
- [x] Empty states com ilustrações (EmptyState com ícones)
- [x] Consistência visual (usando design tokens)
- [x] Suporte a reduced motion (acessibilidade)

### 📖 Consultar Antes de Implementar
- ✅ `fluxos_jornadas.md` — Paridade Desktop/Mobile
- ✅ `design_system.md` — Tokens e componentes
- ✅ `regras_decisoes.md` — Visão geral do produto

---

## 🗄️ Fase 19: Data Layer (Firestore)

**Status:** [x] ✅ Concluída

**Objetivo:** Migrar CRM para Firestore + Corrigir race condition do onboarding

### 📚 Skills
- `react-patterns`, `architecture`

### ✅ Implementar

**Migração localStorage → Firestore:**
- [x] Estrutura de coleções: `users/{userId}/crmProjects`, `users/{userId}/crmDecisions`, `users/{userId}/northStar`
- [x] Criar `src/lib/crmProjects.ts` — CRUD para Projects CRM
- [x] Criar `src/lib/crmDecisions.ts` — CRUD para Decisions CRM
- [x] Criar `src/lib/northstar.ts` — Get/Set North Star
- [x] Refatorar `useCRM.ts` para usar Firestore (remover localStorage para dados)
- [x] Implementar listeners em tempo real (`onSnapshot`)

**Security Rules:**
- [x] Criar `firestore.rules` para isolamento por userId
- [ ] Testar regras de segurança (deploy manual no Firebase Console)

**Fix Onboarding Race Condition:**
- [x] Investigar por que onboarding só aparece após refresh
- [x] Corrigir timing entre auth state e profile loading (adicionado `refreshProfile` após Google login)
- [x] Garantir que Google signup → CompleteProfile → Onboarding

### 📖 Consultar Antes de Implementar
- `regras_decisoes.md` — CRM de Decisões
- `design_system.md` — Tokens e UI
- `src/lib/auth.ts` — Fluxo de autenticação

### 📁 Arquivos Criados/Modificados
- `src/lib/northstar.ts` — Firestore CRUD para North Star
- `src/lib/crmProjects.ts` — Firestore CRUD para Projects
- `src/lib/crmDecisions.ts` — Firestore CRUD para Decisions
- `src/hooks/useCRM.ts` — Refatorado para usar Firestore + subscriptions
- `src/components/MainApp.tsx` — Passando userId para useCRM
- `src/components/CRM/CRMView.tsx` — Passando userId para useCRM
- `src/components/AuthPage.tsx` — Adicionado refreshProfile após Google login
- `firestore.rules` — Security rules para isolamento de dados

---

## ⚙️ Fase 20: Settings & Account

**Status:** [x] ✅ Concluída

**Objetivo:** Implementar configurações de notificações e exclusão de conta

### 📚 Skills
- `frontend-design`, `react-patterns`

### ✅ Implementar

**Notificações:**
- [x] UI de toggle para alertas e lembretes
- [x] Salvar preferências no Firestore (`users/{userId}/settings`)
- [x] Estrutura para futuras integrações (email, push)

**Exclusão de Conta:**
- [x] Modal de confirmação com input de confirmação (digitar "EXCLUIR")
- [x] Função `deleteAccount(user)` — deletar dados do Firestore
- [x] Deletar usuário do Firebase Auth
- [x] Feedback visual durante processo (barra de progresso)
- [x] Redirect para página de login após exclusão

### 📖 Consultar Antes de Implementar
- `design_system.md` — Modais e componentes
- `regras_decisoes.md` — Fluxo de configurações
- `src/components/SettingsModal.tsx` — Modal existente

### 📁 Arquivos Criados/Modificados
- `src/lib/userSettings.ts` — Firestore CRUD para settings
- `src/lib/deleteAccount.ts` — Serviço de exclusão de conta
- `src/components/SettingsModal.tsx` — Refatorado com tabs, toggles e exclusão

---

## 📁 Fase 21: Project Context

**Status:** [x] ✅ Concluída

**Objetivo:** Restaurar funcionalidade de contexto/informações por projeto

### 📚 Skills
- `frontend-design`, `ui-ux-pro-max`

### ✅ Implementar

**Campos de Contexto:**
- [x] Adicionar campos ao tipo `Project`: `context`, `goals`, `constraints`, `stakeholders`
- [x] UI de edição de contexto no card de projeto (modal dedicado)
- [x] Salvar contexto no Firestore

**Uso do Contexto:**
- [x] Estrutura pronta para passar contexto para prompts das sessões
- [x] Campos salvos e recuperados corretamente

**UX:**
- [x] Placeholder com exemplos de contexto útil
- [x] Indicador visual de projeto "configurado" (green dot) vs "sem contexto"
- [x] SVG icons substituindo emojis (ui-ux-pro-max guideline)

### 📖 Consultar Antes de Implementar
- `regras_decisoes.md` — Projetos e contexto
- `design_system.md` — Inputs e formulários
- `definicao_fluxo.md` — Como contexto influencia sessões

### 📁 Arquivos Criados/Modificados
- `src/types/crm.ts` — Adicionados campos `context`, `goals`, `constraints`, `stakeholders` + helper `hasProjectContext`
- `src/components/CRM/ProjectContextModal.tsx` — Modal com tabs para edição de contexto
- `src/components/CRM/ProjectList.tsx` — Indicador visual + menu "Editar Contexto"
- `src/lib/crmProjects.ts` — parseProject e updateCRMProject atualizados

---

## 💬 Fase 22: Chat Actions

**Status:** [x] ✅ Concluída

**Objetivo:** Implementar ações de mensagem (Copy, Edit, Regenerate) no padrão ChatGPT

### 📚 Skills
- `frontend-design`, `ui-ux-pro-max`, `react-patterns`

### ✅ Implementar

**Botões de Ação (ícones com tooltip):**
- [x] **Copy** — Copiar mensagem com formatação (clipboard API)
- [x] **Edit** — UI pronta para mensagens do usuário (callback onEdit)
- [x] **Regenerate** — UI pronta para mensagens de personas (callback onRegenerate)

**UX/UI:**
- [x] Botões aparecem em hover (group-hover:opacity-100)
- [x] Ícones SVG minimalistas
- [x] Tooltips com title attribute
- [x] Feedback visual de "copiado" (checkmark verde temporário)

**Lógica:**
- [x] Copy: Funcional com navigator.clipboard.writeText
- [x] Edit: Callback onEdit preparado (integração futura)
- [x] Regenerate: Callback onRegenerate preparado (integração futura)

### 📖 Consultar Antes de Implementar
- `design_system.md` — Botões, hover states, tooltips
- `regras_decisoes.md` — Interação com chat
- `src/components/SessionInterface.tsx` — Componente de chat existente

### 📁 Arquivos Modificados
- `src/components/SessionInterface.tsx` — SessionMessage com action buttons (Copy, Edit, Regenerate)

---

## �📎 Referências

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

> **Última atualização:** 31/01/2026