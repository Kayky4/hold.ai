# 📖 Regras e Decisões do Projeto HoldAI

> Documento de referência para implementação e testes.
> Última atualização: 30/01/2026

---

## 👥 Tipos de Usuário

| Tipo | Prioridade | Descrição |
|------|------------|-----------|
| **Founder** | 1 (única) | Founder solo que toma decisões estratégicas sozinho |

> **HoldAI é um produto single-user.** Cada usuário tem seu próprio banco de decisões. Não há colaboração nem compartilhamento (por design).

---

## 💰 Modelo de Negócio

### Planos de Assinatura

| | **Free** | **Plus** R$ 99,90/mês | **Pro** R$ 399,90/mês |
|---|----------|------------------------|------------------------|
| Trial | — | 14 dias grátis | — |
| **Projetos** | **1** | **1** | **3** |
| **North Stars** | **1** | **1** | **3 (1 por projeto)** |
| Decisões/mês | 5 | Ilimitadas | Ilimitadas |
| Sessões/mês | 10 | Ilimitadas | Ilimitadas |
| Modo Solo | ✅ | ✅ | ✅ |
| Modo Mesa (2) | ❌ | ✅ | ✅ |
| Modo Mesa (4) | ❌ | ❌ | ✅ |
| Sessões Sem Memória | ❌ | ✅ | ✅ |
| Personalizar Conselheiros | ❌ | ✅ | ✅ |
| Push Notifications | ❌ | ✅ | ✅ |
| Exportar | Texto simples | Markdown (Memo) | Markdown + PDF |
| Histórico | 30 dias | Ilimitado | Ilimitado |
| Prioridade IA | Padrão | Alta | Máxima |
| Suporte | FAQ | Email | Chat + Video Call |
| **CRM de Decisões** | **✅ Completo** | **✅ Completo** | **✅ Completo** |

### Limites Free (resetam mensalmente)

| Limite | Valor |
|--------|-------|
| Decisões | 5/mês |
| Sessões | 10/mês |
| Mensagens/sessão | 50 |
| Histórico | 30 dias |

### Regras Gerais

- ✅ Limites do Free resetam mensalmente
- ✅ Histórico preservado sempre (mesmo expirado)
- ✅ Exportação livre (sem lock-in de dados)
- ❌ Premium NÃO desliga confronto — apenas intensifica

### Regras de Downgrade

| Situação | Comportamento |
|----------|---------------|
| Plus → Free | Mantém histórico existente, para de acumular novo além de 30 dias |
| Pro → Plus | Perde acesso a Mesa Completa (4), mantém resto |
| Pro → Free | Combina ambos acima |

**Regra:** Downgrade NUNCA deleta dados. Apenas limita acesso a novas funcionalidades.

### Deleção de Dados

- ✅ Usuário pode deletar qualquer decisão/sessão permanentemente
- ✅ Modal de confirmação obrigatório antes de deletar
- ✅ Deleção é irreversível — sem lixeira
- ⚠️ Aviso claro: "Esta ação não pode ser desfeita"

### Notificações de Revisão

| Aspecto | Valor |
|---------|-------|
| **Prazos padrão** | Sistema pré-define (ex: 7 dias, 30 dias) |
| **Configurável** | Sim, em Configurações |
| **Tipos** | Push + In-app |
| **Conteúdo** | "Hora de revisar sua decisão: [título]" |

### Onboarding

| Aspecto | Valor |
|---------|-------|
| **Obrigatório** | Não — skipável |
| **Acessível depois** | Sim, em Configurações |
| **Conteúdo** | Método HOLD, personas, modos |

---

## 🚪 Portal de Entrada

### Regra de Ouro

> **NUNCA** campo de texto como primeira interação. Sempre escolher um modo.

### Modos de Interação (MVP)

| Modo | Composição | Quando Usar |
|------|------------|-------------|
| **Solo** | Usuário + 1 conselheiro + Moderador | Perspectiva específica (ex: "preciso de um reality check") |
| **Mesa** | Usuário + 2 conselheiros + Moderador | Decisão complexa, múltiplas perspectivas |
| **Revisão** | Usuário + Moderador | Revisar outcome de decisão passada |

### Modos Futuros (Pós-MVP)

| Modo | Composição |
|------|------------|
| **Mesa Completa** | Usuário + 4 conselheiros + Moderador |
| **Impasse** | Fluxo específico para decisões travadas |
| **Check-in Estratégico** | Revisão periódica de padrões |

### Navegação Principal (CRM é a Home)

**Usuário veterano (já tem decisões):**
```
Login → CRM (Kanban como home)
            ↓
        Sidebar: Nova Sessão / Projetos / Configurações
            ↓
        Clique em card → Detalhe da decisão
```

**Primeiro login (FTUX):**
```
Primeiro Login
    ↓
[Onboarding] "Bem-vindo ao HoldAI"
    ↓
[Portal Simplificado] "Comece sua primeira sessão" (botão gigante)
    ↓
Sessão completa (H→O→L→D)
    ↓
Animação: Card "voa" para o Kanban 🎉
    ↓
[CRM] Kanban com 1ª decisão + tour de cartões flutuantes
    ↓
Home normal (CRM)
```

**Regras de Navegação:**
- ✅ **Portal é porta de entrada** para quem nunca decidiu
- ✅ **CRM é a casa** de quem já tem decisões
- ✅ Após Fase D, animação de card indo para Kanban
- ✅ CRM vazio mostra "Comece uma nova sessão" no centro

### Anti-Padrões do Portal

| ❌ Anti-Pattern | Por que evitar |
|----------------|----------------|
| Campo de texto livre | Vira chat |
| "O que você quer fazer hoje?" | Casual demais |
| Emojis animados | Trivializa |
| Mensagens entusiasmadas | Fora do tom |

---

## 🔧 Arquitetura Técnica

### Stack Principal

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | Flutter Web |
| **Backend** | Firebase (Auth, Firestore, Functions) |
| **LLM** | Gemini 2.0 Flash (1M context, baixo custo) |
| **Hosting** | Firebase Hosting |

### Orquestração de Personas (Chained Calls)

**❌ PROIBIDO: Single-Call (gera todas as personas de uma vez)**
- IA cai em modo "Escritor de Fanfic"
- Personagens concordam/discordam superficialmente
- Pragmático não analisa realmente o que Estrategista disse

**✅ OBRIGATÓRIO: Chamadas Encadeadas (Chained Calls)**

```
Call 1: Input usuário → Output Estrategista
    ↓
Inject output no histórico
    ↓
Call 2: Histórico + "Pragmático responda ao Estrategista" → Output Pragmático
    ↓
Inject output no histórico
    ↓
Call 3: Histórico + "Moderador sintetize" → Output Moderador
```

**Justificativa:** Força cada persona a realmente "ouvir" a anterior. Custo é irrisório com Gemini Flash. Não economizar centavos sacrificando qualidade do debate.

### Política de Contexto

**❌ PROIBIDO: Compressão/Resumo no MVP**
- Resumo = Sanitização = Lobotomia do debate
- Remove nuances, números e hesitações que conselheiros precisam
- Gemini 2.0 Flash: 1M tokens disponíveis

**✅ OBRIGATÓRIO: Raw Context Sempre**

| Fato | Valor |
|------|-------|
| Context window Gemini Flash | 1M tokens |
| Sessão típica de texto | ~30k tokens máx |
| Compressão necessária no MVP | **NÃO** |

**Regra:** Manter histórico completo para IA lembrar que usuário disse "tenho medo de falir" lá no começo e usar isso no final.

### Memória Estruturada (Banco de Decisões)

**O que armazenamos em JSON estruturado:**

| Campo | Tipo | O que captura |
|-------|------|---------------|
| `decision` | `string` | Texto da decisão |
| `reasoning` | `string` | Lógica: por que escolheu isso |
| `alternatives` | `string[]` | Opções descartadas |
| `accepted_risks` | `string[]` | **Array de riscos que o usuário aceitou** |
| `next_action` | `string` | Ação definida na Fase D |
| `review_date` | `DateTime` | Data de revisão |
| `outcome` | `enum` | `success` / `failure` / `partial` / `pending` / `pivoted` |
| `learnings` | `string?` | Aprendizados após revisão (nullable) |

**⚠️ CRÍTICO:** `accepted_risks` DEVE ser `string[]`, não texto dentro de `reasoning`. Isso permite estruturar dados e cruzar com `outcome` na revisão.

**Distinção crítica:**
- ChatGPT lembra **FATOS** ("pricing é R$ 100")
- HoldAI lembra **LÓGICA + CONTRATO DE RISCO** ("Escolhemos R$ 100 *apesar* do risco de churn, porque a prioridade era margem")

**Isso é o moat.** O Banco de Decisões é o produto. O Chat é a interface de entrada.

### CRM de Decisões (Hierarquia)

```
North Star (1 por usuário)
    └── Projetos (N por usuário)
            └── Decisões (N por projeto)
                    └── Ações (N por decisão)
```

**Entidade `NorthStar`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | ID único |
| `userId` | `string` | Dono |
| `title` | `string` | Ex: "R$ 100k MRR em 2026" |
| `description` | `string?` | Contexto adicional |
| `createdAt` | `DateTime` | Data de criação |

**Entidade `Project`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | ID único |
| `userId` | `string` | Dono |
| `name` | `string` | Ex: "Marketing Q1" |
| `description` | `string?` | Contexto |
| `northStarId` | `string?` | Vinculado ao North Star |
| `status` | `enum` | `active` / `completed` / `archived` |
| `createdAt` | `DateTime` | Data de criação |

**Campos adicionais em `Decision`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `projectId` | `string?` | Vinculado a um projeto (opcional) |
| `pipelineStatus` | `enum` | `draft` / `pending` / `watching` / `audited` |

**Pipeline de Decisões (Kanban fixo):**

| Status | Nome | Quando |
|--------|------|--------|
| `draft` | Em Debate | Sessão em andamento (Fase H/O/L) |
| `pending` | Decidido | Fase D concluída, ação pendente |
| `watching` | Em Maturação | Ação executada, aguardando resultado |
| `audited` | Auditado | Outcome marcado (sucesso/falha) |

**Regras do Kanban:**
- ❌ Usuário NÃO pode criar colunas (metodologia opinativa)
- ✅ Status muda automaticamente conforme fluxo HOLD
- ✅ Transição manual: `pending` → `watching` (usuário marca "ação feita")

**Modo Crise no Kanban:**
- Decisões de crise vão para o Kanban normal
- Card tem badge 🚨 "Crise" (cor de alerta)
- Revisão obrigatória mais agressiva (24-48h)

**Paridade Desktop/Mobile:**

| Feature | Desktop | Mobile |
|---------|---------|--------|
| CRM Kanban | Colunas horizontais | Lista vertical com filtro por status |
| Nova Sessão | Modal overlay | Tela full screen |
| Detalhe decisão | Side panel | Tela full screen |
| North Star | Header do CRM | Card no topo |
| Tour onboarding | Cartões flutuantes | Cartões full-width |

**Regra:** Desktop e Mobile têm mesmas features, layouts adaptados.

### Streaming e Latência

**❌ PROIBIDO: Chamadas Paralelas**
- Conselheiros respondem ao usuário, não um ao outro
- Transforma Mesa em "Enquete" de opiniões isoladas
- Mata o debate cruzado

**✅ OBRIGATÓRIO: Sequencial com Streaming**

```
[Estrategista digitando...] → texto aparece → termina
    ↓
[Pragmático reagindo...] → texto aparece → termina
    ↓
[Moderador sintetizando...] → texto aparece → termina
```

**Implementação: Hook `useHoldSession`**

```dart
// Estado por persona
enum PersonaState { idle, thinking, streaming, done }

// Gerenciamento de fila
class HoldSessionState {
  List<Message> messages;
  Map<String, PersonaState> personaStates;
  String? currentlyStreaming; // 'estrategista' | 'pragmatico' | 'moderador'
}
```

**Requisitos de UX:**
- Indicador "Digitando..." específico para cada persona (com nome e avatar)
- Scroll suave automático conforme texto aparece (sem "piscar")
- Próxima persona só inicia quando anterior termina completamente
- Fila de mensagens pendentes no backend, não no frontend

**Benefícios:**
- Pragmático realmente reage ao Estrategista
- Sensação de conversa orgânica
- Tempo para usuário ler cada resposta
- Rounds de debate, não wall of text

### Limites de Resposta

| Elemento | Limite |
|----------|--------|
| Resposta de conselheiro | 150-200 palavras/turno |
| Sessão contínua | Recomendado pausar >60min |

**Justificativa:** Respostas densas, não prolixas. Reduz tempo de geração.

---

## 📝 Método HOLD + Mesa de Conselheiros

### Etapas Obrigatórias

| Fase | Nome | Responsável | Objetivo |
|------|------|-------------|----------|
| **H** | Clarificação | Moderador | Extrair contexto completo |
| **O** | Debate | Conselheiros + Moderador | Confronto entre perspectivas |
| **L** | Decisão | Moderador + Usuário | Sintetizar e escolher |
| **D** | Ação | Moderador | Definir próximo passo |

### Regras por Fase

**Fase H — Clarificação (Moderador Cético):**
- ✅ Moderador CÉTICO por padrão — assume que não entendeu
- ✅ PROIBIDO inferir detalhes não ditos pelo usuário
- ✅ Critérios de completude (não contagem de perguntas)
- ✅ Validação ativa: "O maior risco parece ser X. Correto?"
- ✅ Moderador apresenta resumo aos conselheiros
- ❌ Preencher lacunas com generalismo
- ❌ Avançar sem contexto completo validado

**Fase O — Debate (Divergência por Valores):**
- ✅ Cada conselheiro dá sua perspectiva baseada em seu FOCO
- ✅ Divergência vem de conflito de prioridades (Crescimento vs. Lucro)
- ✅ Conselheiros PEDEM dados ao usuário (não chutam números)
- ✅ Moderador provoca tensões entre posições
- ✅ Usuário pode intervir a qualquer momento
- ✅ Rounds inteligentes (IA decide quando avançar)
- ❌ Forçar contraponto artificial (cria "Estupidez Artificial")
- ❌ Chutar dados numéricos (CAC, LTV, taxas)
- ❌ Decisão sem confronto real

**Fase L — Decisão (com Riscos Aceitos):**
- ✅ Moderador sintetiza posições dos conselheiros
- ✅ Usuário escolhe caminho
- ✅ Captura de raciocínio
- ✅ Registro de alternativas descartadas
- ✅ Seção obrigatória: "Riscos Aceitos" (riscos que usuário ignorou)
- ❌ Decisão vaga sem declaração explícita
- ❌ Omitir riscos que foram levantados e ignorados

**Fase D — Ação:**
- ✅ Próxima ação concreta obrigatória
- ✅ Prazo de revisão definido (default: 7 dias)
- ✅ Sessão salva completamente no histórico
- ❌ Encerrar sem ação definida

### Fluxo Completo (Modo Mesa)

```
Portal → Modo "Mesa" → Escolhe 2 conselheiros
    ↓
┌─────────────────────────────────────────┐
│  H - CLARIFICAÇÃO (Moderador conduz)    │
│  └─ Perguntas → Contexto → Resumo       │
├─────────────────────────────────────────┤
│  O - DEBATE (Conselheiros + Usuário)    │
│  └─ Perspectivas → Tensões → Confronto  │
├─────────────────────────────────────────┤
│  L - DECISÃO (Moderador sintetiza)      │
│  └─ Síntese → Escolha → Raciocínio      │
├─────────────────────────────────────────┤
│  D - AÇÃO (Moderador encerra)           │
│  └─ Próxima ação → Prazo → Confirmação  │
└─────────────────────────────────────────┘
```

---

## 👥 Personas

### O Moderador (Facilitador)

| Atributo | Valor |
|----------|-------|
| **Papel** | Conduzir sessões, organizar debates, sintetizar |
| **Tom** | Neutro, organizado, calmo, firme |
| **Editável** | ❌ Não |

### Os 4 Conselheiros (Pré-definidos)

| Persona | Papel | Tom |
|---------|-------|-----|
| **Estrategista** | Visão de longo prazo, mercado | Ambicioso, visionário |
| **Pragmático** | Execução, viabilidade | Direto, realista |
| **Analista de Riscos** | Questionar, encontrar falhas | Cético, metódico |
| **Mentor** | Experiência, perspectiva | Sábio, empático |

### Regras de Personas

- ✅ Todas pré-definidas mas 100% personalizáveis
- ✅ Campos: name, description, style, tone, principles, biases, riskTolerance, objectives, instructions
- ✅ Moderador sempre presente em toda sessão
- ✅ Conselheiros têm vieses reconhecidos
- ❌ Moderador NÃO pode ser editado
- ❌ Personas NÃO opinam sobre qual decisão é melhor (só Conselheiros dão perspectivas)

---

## ⚔️ Adversarial AI

### Regra de Ouro

> **Confronto NUNCA pode ser desligado.** Intensidade configurável, existência não.

### Níveis de Intensidade

| Nível | Descrição | Comportamento |
|-------|-----------|---------------|
| **Leve** | Questionador | Faz perguntas, não afirma |
| **Médio** | Desafiador | Contraponto direto |
| **Agressivo** | Adversário | Ataca premissas ativamente |

### Regras

- ✅ Sempre gerar contraponto contextual
- ✅ Referenciar decisões passadas quando relevante
- ✅ Identificar padrões comportamentais
- ✅ Apontar evasões detectadas
- ❌ Concordar sem questionar
- ❌ Suavizar para agradar
- ❌ Usar linguagem passiva ("talvez", "considera")

### Tom de Voz

| ❌ Errado | ✅ Correto |
|----------|-----------|
| "Essa pode ser uma boa ideia..." | "Essa premissa conflita com X. Por quê?" |
| "Você poderia considerar..." | "Você está ignorando Y. Explique." |
| "Talvez valha pensar..." | "Você disse Z há 2 semanas. Mudou algo?" |

---

## 💾 Banco de Decisões

### Campos Obrigatórios

| Campo | Descrição | Preenchido em |
|-------|-----------|---------------|
| `statement` | Frase da decisão | Fase L |
| `reasoning` | Raciocínio completo | Fase L |
| `alternatives` | Alternativas descartadas | Fase L |
| `next_action` | Próximo passo | Fase D |
| `reminder_date` | Data de lembrete | Fase D |
| `context` | Contexto capturado | Fase H |
| `tensions` | Tensões mapeadas | Fase O |
| `created_at` | Timestamp | Auto |
| `status` | Status atual | Auto |

### Status de Decisão

| Status | Descrição |
|--------|-----------|
| `pending_action` | Aguardando execução da ação |
| `action_done` | Ação executada, aguardando outcome |
| `reviewed` | Outcome registrado |
| `superseded` | Substituída por outra decisão |

### Regras

- ✅ Decisões são imutáveis após salvas
- ✅ Histórico completo preservado
- ✅ Relacionamentos entre decisões permitidos
- ✅ Exportação sempre disponível
- ❌ Deletar decisões (apenas arquivar)

---

## 🔄 Revisão e Outcomes

### Lembrete Padrão

- ✅ 7 dias após decisão (configurável)
- ✅ Postura ativa: provocação sutil
- ❌ Spam de notificações

### Fluxo de Revisão

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

### Registro de Outcome

| Campo | Descrição |
|-------|-----------|
| `outcome` | funcionou / não funcionou / parcial |
| `explanation` | O que aconteceu |
| `learning` | O que aprendeu |
| `reviewed_at` | Timestamp |

---

## 👁️ Detecção de Evasão

### Regras

- ✅ Detectar decisões mencionadas mas não tomadas
- ✅ Apontar durante sessões futuras
- ✅ Listar pendentes no portal
- ✅ Tom firme, não julgador

### Mensagens de Confronto

| Situação | Mensagem |
|----------|----------|
| Evasão detectada | "Você mencionou X há 2 semanas. Ainda não decidiu." |
| Padrão de evasão | "Você tem um padrão de adiar decisões sobre Y." |
| Uso teimoso | "Você ignora contrapontos sistematicamente." |

---

## 🛡️ Proteção do Ritual

### Gatilhos de Desaceleração

| Gatilho | Resposta |
|---------|----------|
| Muitas decisões rápidas (5+/dia) | "Todas eram realmente estratégicas?" |
| Sessão sem confronto real | "Essa sessão não teve debate. Recomeçar?" |
| Uso superficial detectado | "Você está usando como chat, não como ferramenta." |

### Regras

- ✅ Recusar validação sem processo completo
- ✅ Bloquear exportação de decisões "não robustas"
- ✅ Alertar sobre banalização
- ❌ Permitir pular etapas
- ❌ Aceitar respostas vazias

---

## 🎨 Design System

> Documento completo: [design_system.md](./design_system.md)

### Princípio Central

> **NUNCA** use valores arbitrários (#3B82F6, 16px).
> **SEMPRE** use tokens semânticos.

### Tokens de Cor

| Categoria | Tokens |
|-----------|--------|
| **Texto** | `text-primary`, `text-secondary`, `text-muted`, `text-on-brand` |
| **Superfície** | `surface-page`, `surface-card`, `surface-elevated` |
| **Ação** | `action-primary`, `action-secondary`, `action-strong` |
| **Status** | `status-success`, `status-warning`, `status-error` |
| **Confronto** | `confrontation`, `confrontation-subtle` |

### Valores de Referência

| Token | Valor |
|-------|-------|
| `action-primary` | #1E293B (slate escuro) |
| `confrontation` | #7C3AED (roxo tensão) |
| `text-primary` | #0F172A (slate 900) |

### Estados Obrigatórios

Todo componente interativo **DEVE** ter:
1. **Default** — Estado normal
2. **Hover** — Feedback visual
3. **Active** — Pressed
4. **Focus** — Ring visível (acessibilidade)
5. **Disabled** — Opacidade reduzida

### Anti-Padrões de UI

| ❌ Anti-Pattern | Por que evitar |
|----------------|----------------|
| Valores arbitrários | Use tokens |
| Emojis como ícones | Use SVG |
| `alert()` / `confirm()` nativos | Use modais |
| Hover-only interactions | Quebra mobile |
| Touch targets < 44px | Inacessível |
| Fontes genéricas | Use IBM Plex Mono / Inter |
| Confetti/celebrações | Trivializa o sério |
| Linguagem entusiasmada | Fora do tom |

---

## 🎯 Personalidade

### Tom de Voz

| Aspecto | Definição |
|---------|-----------|
| **Base** | Calma, firme, precisa |
| **Nunca** | Animada, entusiástica, casual |
| **Confronto** | Direto mas respeitoso |
| **Suporte** | Competência, não simpatia |

### Exemplos

| Situação | ❌ Errado | ✅ Correto |
|----------|----------|-----------|
| Início | "Oi! Vamos decidir algo?" | "Qual decisão você precisa tomar?" |
| Confronto | "Hmm, você tem certeza?" | "Essa premissa conflita com X." |
| Conclusão | "Ótimo! Você conseguiu!" | "Decisão registrada. Próxima ação definida." |
| Sucesso | Confetti + animação | Confirmação sóbria |
| Erro | "Oops! Algo deu errado!" | "Erro: [descrição]. Tente: [ação]." |

---

## 🔐 Decisões de Stack

| Decisão | Escolha | Justificativa | Data |
|---------|---------|---------------|------|
| Framework | Next.js | Já existe, adequado para SaaS | 30/01/2026 |
| Linguagem | TypeScript | Tipagem forte | 30/01/2026 |
| Estilização | Tailwind CSS | Design System semântico com tokens | 30/01/2026 |
| Fonts | IBM Plex Mono + Inter | Precisão + Legibilidade | 30/01/2026 |
| LLM | Google Gemini API | Escolha do projeto | 30/01/2026 |
| Database | Firebase (Firestore) | Auth + DB integrados | 30/01/2026 |
| Autenticação | Firebase Auth | Simplicidade, já integrado | 30/01/2026 |
| Hosting | Vercel | Deploy automático, edge functions | 30/01/2026 |
| Notificações | Push browser + In-app | MVP web-first | 30/01/2026 |
| App Mobile | Futuro (pós-MVP) | App nativo planejado | 30/01/2026 |


---

## ❌ Anti-Patterns Globais

> O que NUNCA fazer, mesmo que pareça bom.

| Anti-Pattern | Por que evitar |
|--------------|----------------|
| Campo de texto livre como entrada | Vira chat |
| Pular etapas do HOLD | Destrói processo |
| Permitir desligar confronto | Perde identidade |
| Validar sem questionar | Vira agradador |
| Otimizar para DAU/MAU | Métrica errada |
| Adicionar features de produtividade | Dilui categoria |
| Suavizar para agradar | Perde força |
| Gamificar decisões | Trivializa o sério |
| Celebrar com confetti | Infantiliza |
| Linguagem "friendly demais" | Fora do tom |

---

## ✅ Checklist de Validação

Antes de aprovar qualquer implementação:

- [ ] Segue tokens do design_system.md?
- [ ] Tom de voz está correto?
- [ ] Não tem campo de texto livre como entrada?
- [ ] Etapas HOLD não são puláveis?
- [ ] Confronto não pode ser desligado?
- [ ] Próxima ação é obrigatória?
- [ ] Sem celebrações/confetti?
- [ ] Sem linguagem entusiasmada?
- [ ] Componentes têm todos os estados?
- [ ] Touch targets >= 44px?

---

## 📜 Histórico de Mudanças

| Data | Mudança | Justificativa |
|------|---------|---------------|
| 30/01/2026 | Documento criado | Ativação da metodologia |
| 30/01/2026 | Reestruturado (metodologia VitaSyn) | Maior clareza e eficiência |

---

## 📌 Regras de Atualização

1. **Novas decisões** → Adicionar com data e justificativa
2. **Mudanças em decisões** → Manter histórico
3. **Conflitos** → Resolver antes de continuar
4. **Princípios invioláveis** → Nunca mudam sem redesign completo
5. **Este documento** → Fonte de verdade para implementação
