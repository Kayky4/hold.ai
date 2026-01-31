# 📚 Auditoria de Skills — HoldAI

> **Data:** 30/01/2026  
> **Catálogo:** 553 skills disponíveis  
> **Foco:** Skills críticas para o desenvolvimento do HoldAI

---

## 📋 Sumário

1. [Skills Prioritárias por Fase](#skills-prioritárias-por-fase)
2. [Skills Críticas — Análise Detalhada](#skills-críticas--análise-detalhada)
3. [Mapeamento Skills × Fases](#mapeamento-skills--fases)
4. [Como Usar as Skills](#como-usar-as-skills)

---

## Skills Prioritárias por Fase

### 🏗️ Fundação (Fases 01-06)
| Skill | Propósito |
|-------|-----------|
| `react-patterns` | Padrões React, hooks, TypeScript, composição |
| `tailwind-patterns` | CSS-first, tokens, patterns |
| `frontend-dev-guidelines` | Standards de frontend |

---

### 🎨 Design System (Fase 03)
| Skill | Propósito |
|-------|-----------|
| `ui-ux-pro-max` | ⭐ **Principal** — 50+ estilos, paletas, tipografia, acessibilidade |
| `tailwind-design-system` | Tokens semânticos, component libraries |
| `frontend-design` | Interfaces distintas, não genéricas |

---

### 🚪 Portal de Entrada (Fases 07-10)
| Skill | Propósito |
|-------|-----------|
| `frontend-design` | Interface memorável, não template |
| `ui-ux-pro-max` | Acessibilidade, interação |
| `react-patterns` | Componentes, state management |

---

### 📝 HOLD Engine (Fases 11-31)
| Skill | Propósito |
|-------|-----------|
| `ai-agents-architect` | Arquitetura de agentes, tool use, memória |
| `ai-engineer` | LLM applications, RAG, prompts |
| `prompt-engineering` | Técnicas avançadas de prompt |
| `react-patterns` | State, composição, hooks |

---

### 💾 Banco de Decisões (Fases 32-40)
| Skill | Propósito |
|-------|-----------|
| `database-design` | Schema, indexing, ORM |
| `react-patterns` | Listas, performance |
| `react-state-management` | State global (Zustand) |

---

### 🎙️ Voice-First (Fases 41-50)
| Skill | Propósito |
|-------|-----------|
| `voice-ai-development` | OpenAI Realtime API, voice agents |
| `ai-engineer` | Multimodal AI |

---

### 🔐 Autenticação (Fases 51-56)
| Skill | Propósito |
|-------|-----------|
| `backend-dev-guidelines` | Patterns de backend |
| `nodejs-backend-patterns` | Middleware, auth, error handling |

---

## Skills Críticas — Análise Detalhada

### ⭐ `ui-ux-pro-max`

> **Quando usar:** Design de UI, escolha de cores/tipografia, review de UX, building landing pages

**Capacidades:**
- 50+ estilos (glassmorphism, brutalism, minimalism...)
- 97 paletas de cores
- 57 pares de fontes
- 99 guidelines de UX
- 25 tipos de gráficos
- 9 stacks suportados

**Prioridades de Regras:**
| Prioridade | Categoria | Impacto |
|------------|-----------|---------|
| 1 | Acessibilidade | CRÍTICO |
| 2 | Touch & Interação | CRÍTICO |
| 3 | Performance | ALTO |
| 4 | Layout Responsivo | ALTO |
| 5 | Tipografia & Cor | MÉDIO |

**Checklist Pré-Entrega:**
- [ ] Sem emojis como ícones (usar SVG)
- [ ] Todos clickables com `cursor-pointer`
- [ ] Contraste 4.5:1 mínimo
- [ ] Sem horizontal scroll mobile
- [ ] `prefers-reduced-motion` respeitado

---

### ⭐ `frontend-design`

> **Quando usar:** Criar interfaces distintas, production-grade, não genéricas

**Mandatos Obrigatórios:**
1. **Direção Estética Intencional** — Nome explícito do estilo
2. **Correção Técnica** — Código real, não mockups
3. **Memorabilidade Visual** — Elemento que lembre 24h depois
4. **Restrição Coesa** — Sem decoração aleatória

**Anti-Patterns (IMEDIATA FALHA):**
❌ Inter/Roboto/system fonts  
❌ Gradientes roxo/branco SaaS genérico  
❌ Layouts default Tailwind/ShadCN  
❌ Seções simétricas previsíveis  
❌ Decoração sem intenção

**Metodologia DFII:**
```
DFII = (Impacto + Fit + Feasibility + Performance) − Risco de Consistência
```
- 12-15: Excelente → Executar
- 8-11: Forte → Prosseguir com disciplina
- 4-7: Arriscado → Reduzir escopo
- ≤3: Fraco → Repensar direção

---

### ⭐ `ai-agents-architect`

> **Quando usar:** Building AI agents, tool use, function calling

**Patterns Principais:**
- **ReAct Loop:** Thought → Action → Observation → Repeat
- **Plan-and-Execute:** Planejamento → Execução → Replanejamento
- **Tool Registry:** Registro dinâmico de ferramentas

**Anti-Patterns:**
❌ Autonomia ilimitada  
❌ Overload de ferramentas  
❌ Memória acumuladora  

**Relacionadas:** `rag-engineer`, `prompt-engineer`, `backend`, `mcp-builder`

---

### ⭐ `ai-engineer`

> **Quando usar:** LLM features, chatbots, AI agents, RAG systems

**Capacidades:**
- LLM Integration (OpenAI, Anthropic, open-source)
- Advanced RAG Systems
- Agent Frameworks (LangChain, LangGraph, CrewAI)
- Vector Search & Embeddings
- Prompt Engineering
- Production AI Systems
- AI Safety & Governance

**Foco Comportamental:**
- Prioriza confiabilidade sobre POC
- Implementa error handling compreensivo
- Foca em custo-eficiência
- Observabilidade desde dia 1
- Considera AI safety sempre

---

### ⭐ `react-patterns`

> **Quando usar:** Componentes React, hooks, state, performance

**Tipos de Componentes:**
| Tipo | Uso | State |
|------|-----|-------|
| Server | Data fetching | None |
| Client | Interatividade | useState |
| Presentational | UI display | Props only |
| Container | Lógica | Heavy state |

**State Management:**
| Complexidade | Solução |
|--------------|---------|
| Simples | useState, useReducer |
| Compartilhado local | Context |
| Server state | React Query, SWR |
| Global complexo | Zustand, Redux |

**Anti-Patterns:**
| ❌ Don't | ✅ Do |
|----------|-------|
| Prop drilling deep | Use context |
| Componentes gigantes | Split smaller |
| useEffect para tudo | Server components |
| Otimização prematura | Profile first |

---

## Mapeamento Skills × Fases

### Bloco A: Fundação
| Fase | Skills Aplicáveis |
|------|-------------------|
| 01-02 | `clean-code` |
| 03 | `ui-ux-pro-max`, `tailwind-design-system`, `frontend-design` |
| 04-06 | `react-patterns`, `tailwind-patterns` |

### Bloco B: Portal
| Fase | Skills Aplicáveis |
|------|-------------------|
| 07-10 | `ui-ux-pro-max`, `frontend-design`, `react-patterns` |

### Bloco C: HOLD — Clarificação
| Fase | Skills Aplicáveis |
|------|-------------------|
| 11-15 | `react-patterns`, `prompt-engineering` |

### Bloco D: HOLD — Tensões
| Fase | Skills Aplicáveis |
|------|-------------------|
| 16-21 | `ai-agents-architect`, `ai-engineer`, `prompt-engineering` |

### Bloco E: HOLD — Decisão
| Fase | Skills Aplicáveis |
|------|-------------------|
| 22-26 | `react-patterns`, `ai-engineer` |

### Bloco F: HOLD — Ação
| Fase | Skills Aplicáveis |
|------|-------------------|
| 27-31 | `react-patterns`, `ui-ux-pro-max` |

### Bloco G: Banco de Decisões
| Fase | Skills Aplicáveis |
|------|-------------------|
| 32-40 | `database-design`, `react-patterns`, `react-state-management` |

### Bloco H-J: Voice
| Fase | Skills Aplicáveis |
|------|-------------------|
| 41-50 | `voice-ai-development`, `ai-engineer` |

### Bloco K-L: Rituais
| Fase | Skills Aplicáveis |
|------|-------------------|
| 51-60 | `ai-engineer`, `react-patterns` |

### Bloco M: Auth
| Fase | Skills Aplicáveis |
|------|-------------------|
| 61-66 | `backend-dev-guidelines`, `nodejs-backend-patterns` |

### Bloco N-T: Avançado
| Fase | Skills Aplicáveis |
|------|-------------------|
| 67-89 | `ai-agents-architect`, `ai-engineer`, `database-architect` |

---

## Como Usar as Skills

### 1. Antes de Cada Fase

```bash
# Ver skill completa
view_file .agent/skills/skills/<skill-name>/SKILL.md
```

### 2. Durante a Implementação

Seguir checklists e anti-patterns da skill ativa.

### 3. Workflow Recomendado

```
┌─────────────────┐
│ Iniciar Fase    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Ler Skills      │
│ Aplicáveis      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Implementar     │
│ com Patterns    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Verificar       │
│ Checklists      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Validar         │
│ Anti-Patterns   │
└─────────────────┘
```

---

## Skills Adicionais Recomendadas

| Skill | Uso |
|-------|-----|
| `prompt-engineering` | Otimização de prompts |
| `testing-patterns` | Jest, TDD |
| `e2e-testing-patterns` | Playwright, Cypress |
| `database-design` | Schema, indexing |
| `webapp-testing` | Playwright para web |
| `clean-code` | Standards de código |

---

> **Regra:** Sempre consultar a skill relevante ANTES de implementar. Skills contêm anti-patterns que evitam retrabalho.
