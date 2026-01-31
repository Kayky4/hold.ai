# 🎯 Definição de Fluxo — HoldAI

> Documento de definição do produto: personas, modos de interação e fluxo HOLD.
> **Data:** 30/01/2026 | **Status:** Aguardando aprovação

---

## 👥 AS 5 PERSONAS

### Os 4 Conselheiros

| Persona | Papel | Estilo | Foco |
|---------|-------|--------|------|
| **Estrategista** | Visão de longo prazo | Ambicioso, visionário | Mercado, posicionamento, crescimento |
| **Pragmático** | Execução e viabilidade | Direto, realista | Recursos, timeline, capacidade |
| **Analista de Riscos** | Questionar e encontrar falhas | Cético, metódico | Riscos, edge cases, o que pode dar errado |
| **Mentor** | Experiência e perspectiva | Sábio, empático | Contexto emocional, aprendizados, padrões |

### O Facilitador (5ª Persona)

| Atributo | Definição |
|----------|-----------|
| **Nome** | O Moderador |
| **Papel** | Conduzir a sessão, organizar o debate, sintetizar |
| **Tom** | Neutro, organizado, claro |
| **Nunca faz** | Opinar sobre a decisão, tomar partido |

---

## 🔄 O PAPEL DO FACILITADOR

O Facilitador é o **maestro** da sessão. Ele:

### Fase H — Clarificação
1. **Abre a sessão** com pergunta inicial: *"Qual decisão você precisa tomar?"*
2. **Faz perguntas de acompanhamento** para extrair contexto completo
3. **Verifica com o usuário** se o contexto está completo
4. **Apresenta aos conselheiros** um resumo estruturado do problema

### Fase O — Debate (Mesa)
5. **Convoca os conselheiros** a darem suas perspectivas
6. **Gerencia turnos** — garante que cada conselheiro fale
7. **Provoca tensões** — *"Estrategista, o que você acha do ponto do Analista?"*
8. **Convida o usuário** a participar — *"Você quer responder ou adicionar algo?"*
9. **Detecta consensos e divergências** — *"Vejo que há discordância sobre X"*
10. **Aprofunda quando necessário** — *"Analista, pode elaborar esse risco?"*

### Fase L — Decisão
11. **Sintetiza o debate** — resume as posições de cada conselheiro
12. **Apresenta as opções** — *"Baseado no debate, você tem X caminhos..."*
13. **Pede ao usuário a decisão** — *"Qual caminho você escolhe?"*
14. **Captura o raciocínio** — *"Por que essa escolha?"*
15. **Registra alternativas descartadas** — *"Entendo que você descartou Y porque..."*

### Fase D — Ação
16. **Exige próxima ação** — *"Qual é o primeiro passo concreto?"*
17. **Define prazo de revisão** — *"Quando devemos revisitar essa decisão?"*
18. **Encerra a sessão** — *"Decisão registrada. Boa sorte."*

---

## 🎮 MODOS DE INTERAÇÃO

### Modo Solo (1 Conselheiro)
> Usuário + 1 Conselheiro + Facilitador

```
┌─────────────────────────────────────────┐
│  MODO SOLO                              │
├─────────────────────────────────────────┤
│  Usuário escolhe 1 conselheiro          │
│  Facilitador conduz H → O → L → D       │
│  Conselheiro dá perspectiva única       │
│  Usuário decide com base em 1 visão     │
└─────────────────────────────────────────┘
```

**Quando usar:** Decisões que precisam de uma perspectiva específica (ex: "preciso de um reality check" → Analista de Riscos)

**Aplica HOLD:** ✅ Sim, completo

---

### Modo Mesa (2+ Conselheiros)
> Usuário + 2 Conselheiros + Facilitador (MVP)
> Futuro: Usuário + 4 Conselheiros + Facilitador

```
┌─────────────────────────────────────────┐
│  MODO MESA (MVP: 2 conselheiros)        │
├─────────────────────────────────────────┤
│  Usuário escolhe 2 conselheiros         │
│  Facilitador conduz H → O → L → D       │
│  Conselheiros debatem entre si          │
│  Usuário participa e intervém           │
│  Facilitador sintetiza e pede decisão   │
└─────────────────────────────────────────┘
```

**Quando usar:** Decisões complexas que precisam de múltiplas perspectivas

**Aplica HOLD:** ✅ Sim, completo

---

### Modo Revisão
> Usuário + Facilitador (sem conselheiros)

```
┌─────────────────────────────────────────┐
│  MODO REVISÃO                           │
├─────────────────────────────────────────┤
│  Usuário escolhe decisão passada        │
│  Facilitador apresenta contexto original│
│  Facilitador pergunta sobre outcome     │
│  Usuário registra aprendizado           │
└─────────────────────────────────────────┘
```

**Quando usar:** Revisar outcomes de decisões passadas

---

## 📊 FLUXO COMPLETO — MODO MESA (MVP)

```
┌──────────────────────────────────────────────────────────────┐
│                         PORTAL                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Solo    │  │   Mesa   │  │ Revisão  │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
└───────┼─────────────┼─────────────┼──────────────────────────┘
        │             │             │
        │             ▼             │
        │    ┌────────────────┐     │
        │    │ SELEÇÃO CONSELHEIROS │
        │    │ (escolhe 2 de 4)     │
        │    └────────┬───────┘     │
        │             │             │
        ▼             ▼             │
┌───────────────────────────────────┤
│           FASE H — CLARIFICAÇÃO   │
├───────────────────────────────────┤
│ Facilitador:                      │
│ "Qual decisão você precisa tomar?"│
│                                   │
│ [Perguntas de acompanhamento]     │
│ [Mínimo 5 perguntas]              │
│ [IA adapta dinamicamente]         │
│                                   │
│ Facilitador:                      │
│ "Contexto completo. Vou apresentar│
│  aos conselheiros."               │
└─────────────┬─────────────────────┘
              │
              ▼
┌───────────────────────────────────┐
│           FASE O — DEBATE         │
├───────────────────────────────────┤
│ Facilitador:                      │
│ "Vamos começar. [Conselheiro 1],  │
│  qual sua perspectiva?"           │
│                                   │
│ Conselheiro 1: [Perspectiva]      │
│ Conselheiro 2: [Contraponto]      │
│                                   │
│ Facilitador:                      │
│ "[Usuário], quer responder?"      │
│                                   │
│ Usuário: [Intervenção opcional]   │
│                                   │
│ [Debate continua por N rounds]    │
│ [Mínimo de confronto obrigatório] │
│                                   │
│ Facilitador:                      │
│ "O debate revelou essas tensões..." │
└─────────────┬─────────────────────┘
              │
              ▼
┌───────────────────────────────────┐
│           FASE L — DECISÃO        │
├───────────────────────────────────┤
│ Facilitador:                      │
│ "Baseado no debate, resumo:       │
│  - [Conselheiro 1] defende X      │
│  - [Conselheiro 2] defende Y      │
│  - Tensões identificadas: [...]   │
│                                   │
│  Qual caminho você escolhe?"      │
│                                   │
│ Usuário: [Decisão]                │
│                                   │
│ Facilitador:                      │
│ "Por que essa escolha?"           │
│                                   │
│ Usuário: [Raciocínio]             │
└─────────────┬─────────────────────┘
              │
              ▼
┌───────────────────────────────────┐
│           FASE D — AÇÃO           │
├───────────────────────────────────┤
│ Facilitador:                      │
│ "Decisão registrada.              │
│  Qual o primeiro passo concreto?" │
│                                   │
│ Usuário: [Próxima ação]           │
│                                   │
│ Facilitador:                      │
│ "Prazo para revisão?"             │
│                                   │
│ Usuário: [7 dias / 14 dias / ...]│
│                                   │
│ Facilitador:                      │
│ "Sessão encerrada. Boa sorte."    │
└───────────────────────────────────┘
```

---

## 💬 EXEMPLOS DE INTERAÇÃO DO FACILITADOR

### Fase H — Clarificação

```
Facilitador: Qual decisão você precisa tomar hoje?

Usuário: Estou pensando em pivotar meu produto.

Facilitador: Entendido. Para que eu possa apresentar isso aos 
conselheiros, preciso de mais contexto:
1. Qual é o produto atual e há quanto tempo existe?
2. O que motivou essa consideração de pivô?
3. Você já tem uma direção de pivô em mente?
4. Quais são as restrições (tempo, dinheiro, equipe)?
5. Qual seria o cenário ideal após o pivô?
```

### Fase O — Debate

```
Facilitador: Contexto apresentado. Estrategista, comece.

Estrategista: Se o mercado atual está saturado, o pivô pode 
ser a única forma de encontrar tração. Eu olharia para 
adjacências com maior TAM...

Facilitador: Analista de Riscos, o que você vê?

Analista de Riscos: O problema é que pivotar queima caixa e 
moral da equipe. Já considerou que pode ser um problema de 
go-to-market e não de produto?

Facilitador: Estrategista, quer responder?

Estrategista: Até pode ser, mas se o produto não tem market 
fit, otimizar go-to-market é desperdiçar recursos...

Facilitador: [Usuário], você quer intervir?
```

### Fase L — Síntese

```
Facilitador: O debate revelou duas posições:

1. Estrategista defende: Pivotar para um mercado adjacente 
   com maior TAM, aceitando o custo de transição.

2. Analista de Riscos sugere: Primeiro validar se o problema 
   é produto ou go-to-market, antes de pivotar.

Tensão central: Velocidade vs. Certeza

[Usuário], qual caminho você escolhe?
```

---

## ✅ DECISÕES CONFIRMADAS

| Aspecto | Decisão |
|---------|---------|
| Personas | 4 conselheiros + 1 facilitador |
| Conselheiros iniciais | Estrategista, Pragmático, Analista de Riscos, Mentor |
| Facilitador | Sempre presente, guia todas as fases |
| Modo Solo | 1 conselheiro + facilitador, HOLD completo |
| Modo Mesa MVP | 2 conselheiros + facilitador |
| Modo Mesa Futuro | 4 conselheiros + facilitador |
| Usuário no debate | Participa e intervém |
| Personalização | Pré-definidos mas 100% editáveis |

---

## 📎 Próximos Passos

Após aprovação deste documento:
1. Atualizar `regras_decisoes.md` com fluxo de personas
2. Atualizar `planejamento_master.md` com fases revisadas
3. Atualizar `task.md` com implementações ajustadas
4. Atualizar `analise_sistema.md` — Meeting/Persona serão mantidos e adaptados

---

> **Aguardando aprovação:** Este documento define o core do produto.
