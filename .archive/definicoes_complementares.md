# 🔧 Definições Complementares — HoldAI

> Fluxos especiais, planos de assinatura e regras adicionais.
> **Data:** 30/01/2026 | **Status:** Aguardando aprovação

---

## ⏸️ Fluxo de Pausa por Silêncio

Quando o usuário fica em silêncio por X segundos:

```
Conselheiro termina de falar
    ↓
Moderador: "[Usuário], você quer adicionar algo, 
contribuir ou ajustar alguma coisa?"
    ↓
├─ Usuário responde → Continua
└─ Usuário não responde → Sessão entra em "espera"
    ↓
Interface mostra: "Aguardando sua resposta..."
    ↓
Usuário pode digitar quando quiser
```

**Regra:** A sessão nunca avança sem input do usuário.

---

## 🔄 Fluxo de Pressão dos Conselheiros

Quando os conselheiros querem continuar debatendo mas o Moderador detecta que o debate está maduro:

```
┌─────────────────────────────────────────────────────────────┐
│  DETECÇÃO: Conselheiros ainda têm pontos para fazer        │
│                                                             │
│  Moderador: "Percebi que os conselheiros ainda têm         │
│  pontos a levantar sobre [tema].                           │
│                                                             │
│  ✦ [Conselheiro 1] quer explorar [X]                       │
│  ✦ [Conselheiro 2] quer responder sobre [Y]                │
│                                                             │
│  Você deseja:                                               │
│  ① Continuar o debate                                       │
│  ② Avançar para a decisão                                  │
│  ③ Fazer uma pergunta específica antes de decidir"         │
└─────────────────────────────────────────────────────────────┘
```

**Regra:** A decisão de continuar ou avançar é SEMPRE do usuário.

---

## 🧠 Sessões Sem Memória / Sem Contexto

### Opções no Início da Sessão

Ao iniciar uma sessão, o usuário pode escolher:

| Opção | Descrição | Tag Visual |
|-------|-----------|------------|
| **Memória Global** | Conselheiros lembram de todas as sessões anteriores | (padrão) |
| **Sem Memória** | Conselheiros não acessam sessões anteriores | 🔇 Sem Memória |
| **Sem Contexto do Projeto** | Conselheiros não acessam dados do projeto | 📭 Sem Contexto |
| **Sessão Limpa** | Ambos: sem memória + sem contexto | 🔇📭 Sessão Limpa |

### Fluxo na Interface

```
Portal → Escolhe modo (Solo/Mesa)
    ↓
Seleção de Conselheiros
    ↓
┌─────────────────────────────────────────────────────────────┐
│  CONFIGURAÇÃO DA SESSÃO                                     │
│                                                             │
│  ☑️ Usar memória de sessões anteriores                      │
│  ☑️ Usar contexto do meu projeto                            │
│                                                             │
│  💡 Desmarcar estas opções cria uma sessão "às cegas"       │
│     onde você precisará fornecer todo o contexto.           │
│                                                             │
│  [Iniciar Sessão]                                           │
└─────────────────────────────────────────────────────────────┘
```

### No Histórico

Sessões com configurações especiais mostram tags:
- 🔇 = Sem Memória
- 📭 = Sem Contexto de Projeto
- 🔇📭 = Sessão Limpa

---

## ❌ Fluxo: Usuário Não Quer Decidir

Se o usuário chega na Fase L e não quer decidir:

```
Moderador: "Qual caminho você escolhe?"
    ↓
Usuário: "Não sei" / "Preciso pensar mais" / Hesita
    ↓
Moderador: "Entendo. Você tem algumas opções:

① Adiar esta decisão para depois
   → Vou salvar o debate e você pode retomar quando quiser.

② Reduzir o escopo
   → Podemos focar em uma parte menor da decisão agora.

③ Pedir mais perspectivas
   → Posso convocar outro conselheiro para dar uma nova visão.

④ Definir um experimento
   → Ao invés de decidir, definir um teste pequeno para validar.

O que prefere?"
```

### Possíveis Outcomes

| Escolha | Ação | Status da Sessão |
|---------|------|------------------|
| **Adiar** | Salva sessão como "pausada" | `paused` |
| **Reduzir escopo** | Redefine a decisão e continua | `in_progress` |
| **Mais perspectivas** | Adiciona conselheiro (pós-MVP) | `in_progress` |
| **Experimento** | Registra experimento ao invés de decisão | `experiment` |

---

## 📊 Sistema de Medição de Sucesso

### Ao Revisar uma Decisão

```
Moderador: "Você tomou esta decisão em [data]:

📋 Decisão: [texto]
🎯 Próxima ação definida: [ação]
📅 Prazo: [prazo]

Como você avalia o resultado?"
    ↓
┌─────────────────────────────────────────────────────────────┐
│  AVALIAÇÃO DE OUTCOME                                       │
│                                                             │
│  ○ ✅ Sucesso — Resultado positivo, atingiu objetivo        │
│  ○ ⚠️ Parcial — Alguns aspectos funcionaram, outros não     │
│  ○ ❌ Falha — Não funcionou como esperado                   │
│  ○ ⏳ Ainda em andamento — Muito cedo para avaliar          │
│  ○ 🔄 Pivotei — Mudei de direção por novos fatores          │
│                                                             │
│  [Avaliar]                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Após Avaliar

```
Moderador: "O que você aprendeu com esta decisão?"
    ↓
[Campo de texto livre]
    ↓
Moderador: "Há algo que você faria diferente?"
    ↓
[Campo de texto livre]
    ↓
Moderador: "Avaliação registrada. Este aprendizado será 
considerado em futuras sessões."
```

---

## 📝 Versionamento de Decisões

### Estrutura

Cada decisão tem um histórico de versões:

```typescript
interface Decision {
  id: string;
  currentVersion: number;
  versions: DecisionVersion[];
  // ... outros campos
}

interface DecisionVersion {
  version: number;
  decision: string;
  reasoning: string;
  nextAction: string;
  editedAt: Date;
  editReason?: string;
}
```

### Fluxo de Edição

```
Usuário clica em "Editar Decisão"
    ↓
Modal: "Por que você está editando esta decisão?"
    ↓
├─ "Corrigi um erro de digitação"
├─ "Mudei de ideia após novos fatos"
├─ "Quero refinar o raciocínio"
└─ [Outro: texto livre]
    ↓
Edita campos (decisão, raciocínio, próxima ação)
    ↓
Salva como nova versão
    ↓
Histórico mostra: "v1 → v2 → v3..."
```

### Reverter Versão

```
Usuário visualiza histórico de versões
    ↓
Clica em versão anterior
    ↓
"Reverter para esta versão?"
    ↓
Cria nova versão (v4) com conteúdo da versão selecionada
```

**Regra:** Versões nunca são deletadas. Reverter cria uma nova versão.

---

## 💰 Planos de Assinatura

### Visão Geral

| | **Free** | **Plus** R$ 99,90/mês | **Pro** R$ 399,90/mês |
|---|----------|------------------------|------------------------|
| Trial | — | 14 dias grátis | — |
| Decisões/mês | 5 | Ilimitadas | Ilimitadas |
| Sessões/mês | 10 | Ilimitadas | Ilimitadas |
| Modo Solo | ✅ | ✅ | ✅ |
| Modo Mesa (2) | ❌ | ✅ | ✅ |
| Modo Mesa (4) | ❌ | ❌ | ✅ |
| Modo Revisão | ✅ | ✅ | ✅ |
| Sessões Sem Memória | ❌ | ✅ | ✅ |
| Personalizar Conselheiros | ❌ | ✅ | ✅ |
| Exportar Decisões | ❌ | PDF | PDF + CSV + API |
| Push Notifications | ❌ | ✅ | ✅ |
| Histórico Completo | 30 dias | Ilimitado | Ilimitado |
| Prioridade IA | Padrão | Alta | Máxima |
| Suporte | FAQ | Email | Chat + Video Call |

### Limites que Resetam Mensalmente (Free)

| Limite | Valor |
|--------|-------|
| Decisões | 5/mês |
| Sessões | 10/mês |
| Mensagens por sessão | 50 |
| Histórico | 30 dias |

### Diferenciadores por Plano

**Free → Plus:**
- Modo Mesa (debate entre conselheiros)
- Personalização de conselheiros
- Sessões sem memória
- Push notifications
- Exportação PDF
- Histórico ilimitado

**Plus → Pro:**
- Modo Mesa Completo (4 conselheiros)
- Exportação avançada (CSV + API)
- Prioridade máxima na IA (menor latência)
- Suporte premium (chat + video call)

---

## ⚡ Otimização de Tokens

### Estratégias

| Estratégia | Descrição |
|------------|-----------|
| **Context Windowing** | Manter apenas últimas N mensagens no contexto ativo |
| **Auto-Sumarização** | Quando atinge limite, resumir histórico automaticamente |
| **Lazy Loading** | Carregar memória/contexto de projeto sob demanda |
| **Prompt Caching** | Reutilizar prompts de sistema entre sessões |
| **Compression** | Comprimir mensagens antigas antes de incluir |

### Limites Recomendados

| Componente | Tokens |
|------------|--------|
| System Prompt (Moderador) | ~1.500 |
| System Prompt (Conselheiro) | ~800 cada |
| Contexto de Projeto | ~2.000 |
| Memória de Sessões | ~3.000 |
| Histórico da Sessão Atual | ~8.000 |
| **Total Máximo** | ~20.000 |

### Fluxo de Auto-Sumarização

```
Sessão atinge 15.000 tokens
    ↓
Sistema detecta e aciona sumarização
    ↓
├─ Mantém últimas 10 mensagens intactas
├─ Resume mensagens anteriores em 1 parágrafo
└─ Injeta resumo no contexto
    ↓
Sessão continua com contexto otimizado
```

**Regra:** O usuário nunca percebe a sumarização. É transparente.

### Por Plano

| Plano | Token Budget/Sessão | Prioridade |
|-------|---------------------|------------|
| Free | 20k | Padrão |
| Plus | 50k | Alta |
| Pro | 100k | Máxima |

---

## ✅ Decisões Confirmadas

| Aspecto | Decisão |
|---------|---------|
| Duração da sessão | Sem limite |
| Interrupção | Só em momentos específicos, Moderador gerencia |
| Silêncio | Moderador pergunta, sessão espera resposta |
| Pressão dos conselheiros | Usuário decide se continua ou avança |
| Consenso total | Moderador busca nuances, pergunta ao usuário |
| Memória | Global por padrão, pode desativar por sessão |
| Recusa de decidir | Opções: adiar, reduzir escopo, experimento |
| Edição de decisões | Sim, com versionamento |
| Sucesso | 5 opções: Sucesso, Parcial, Falha, Em andamento, Pivotei |
| Humor do Moderador | Raramente, depende do contexto |
| Confronto | Sim, mas respeitoso e depende do conselheiro |
| Notificações | Push + In-app |
| Planos | Free, Plus (R$ 99,90), Pro (R$ 399,90) |
| Streaming | Palavra por palavra |
| Tokens | Auto-sumarização, limits por plano |

---

> **Aguardando aprovação:** Este documento define fluxos críticos de UX e monetização.
