# 🔄 Fluxos e Jornadas — HoldAI

> Fluxos de interação, personas, e jornadas do usuário.
> **Última atualização:** 30/01/2026

---

## 📋 Índice

1. [Personas do Sistema](#-personas-do-sistema)
2. [Fluxo HOLD + Mesa de Conselheiros](#-fluxo-hold--mesa-de-conselheiros)
3. [Modos de Interação](#-modos-de-interação)
4. [Fluxos Especiais](#-fluxos-especiais)
5. [Engenharia de Prompt](#-engenharia-de-prompt)
6. [Configurações de Sessão](#-configurações-de-sessão)
7. [Sistema de Decisões](#-sistema-de-decisões)
8. [CRM de Decisões](#-crm-de-decisões)
9. [First-Time User Experience (FTUX)](#-first-time-user-experience-ftux)

---

## 👥 Personas do Sistema

### Estrutura de Todas as Personas

Todas as personas (Moderador + 4 Conselheiros) possuem:

| Atributo | Descrição |
|----------|-----------|
| **Avatar** | Imagem visual gerada via IA |
| **Nome** | Identificador da persona |
| **Descrição** | Texto curto sobre o papel |

### O Moderador

| Atributo | Valor |
|----------|-------|
| **Nome** | Moderador |
| **Papel** | Conduzir sessões, organizar debates, sintetizar |
| **Tom** | Neutro, organizado, calmo, firme |
| **Humor** | Raramente, depende do contexto |
| **Editável** | ❌ Não |

**Comportamento:**
- Conduz sessões usando método HOLD (H→O→L→D)
- Nunca opina sobre a decisão
- Sempre exige próxima ação concreta
- Tom neutro, sem celebrações
- Adapta o processo à necessidade do usuário (flexível, não rígido)

### Os 4 Conselheiros

| Persona | Papel | Tom | Viés |
|---------|-------|-----|------|
| **Estrategista** | Visão de longo prazo, mercado | Ambicioso, visionário | Subestima execução |
| **Pragmático** | Execução, viabilidade | Direto, realista | Pode limitar ambição |
| **Analista de Riscos** | Questionar, encontrar falhas | Cético, metódico | Pode paralisar |
| **Mentor** | Experiência, perspectiva | Sábio, empático | Projeta passado |

**Características:**
- Pré-definidos mas 100% personalizáveis (Plus/Pro)
- Podem ser "duros" mas sempre respeitosos
- Têm vieses reconhecidos em seus prompts
- Intensidade do confronto varia conforme contexto
- Podem discordar fortemente entre si em decisões críticas

### Customização de Conselheiros (Plus/Pro)

O usuário pode personalizar:

| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome personalizado |
| **Descrição** | Texto de apresentação |
| **Tom** | Como se comunica |
| **Estilo** | Formal, casual, direto, etc. |
| **Intensidade** | Nível de confronto (1-5) |
| **Vieses** | Tendências declaradas |
| **Princípios** | Valores que guiam as análises |
| **Objetivos** | O que busca trazer para o debate |

**Regra:** Não é edição de prompt raw — são campos estruturados que compõem o comportamento.

---

## 🔄 Fluxo HOLD + Mesa de Conselheiros

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│  PORTAL                                                     │
│  └─ Escolhe modo: Solo / Mesa / Revisão                     │
├─────────────────────────────────────────────────────────────┤
│  SELEÇÃO                                                    │
│  └─ Solo: 1 conselheiro | Mesa: 2 conselheiros              │
├─────────────────────────────────────────────────────────────┤
│  CONFIGURAÇÃO                                               │
│  └─ ☑️ Memória | ☑️ Contexto de projeto                     │
├─────────────────────────────────────────────────────────────┤
│  FASE H — CLARIFICAÇÃO (Moderador Cético)                   │
│  └─ Critérios de completude, não contagem de perguntas      │
├─────────────────────────────────────────────────────────────┤
│  FASE O — DEBATE                                            │
│  └─ Conselheiros debatem, usuário participa                 │
├─────────────────────────────────────────────────────────────┤
│  FASE L — DECISÃO                                           │
│  └─ Moderador sintetiza, usuário decide                     │
├─────────────────────────────────────────────────────────────┤
│  FASE D — AÇÃO                                              │
│  └─ Próxima ação + prazo de revisão                         │
└─────────────────────────────────────────────────────────────┘
```

### Papel do Moderador por Fase

| Fase | Ações |
|------|-------|
| **H** | Cético por padrão → Validação ativa → Resumo para conselheiros |
| **O** | Gerencia turnos → Provoca tensões → Convida usuário |
| **L** | Sintetiza posições → Apresenta opções → Captura decisão |
| **D** | Exige próxima ação → Define prazo → Encerra sessão |

### Fase H: Moderador Cético

O Moderador na Fase H segue regras rígidas para evitar debates genéricos:

**Comportamento Obrigatório:**
- Se contexto for vago, ASSUME QUE NÃO ENTENDEU
- PROIBIDO inferir detalhes não ditos pelo usuário
- Função: ser CÉTICO sobre a clareza do usuário
- Nunca preenche lacunas com generalismo

**Critérios de Completude (não contagem de perguntas):**
- ✅ O problema está claro?
- ✅ O contexto (negócio, timing, stakeholders) está mapeado?
- ✅ As alternativas conhecidas foram identificadas?
- ✅ O que está em jogo (riscos, ganhos) foi declarado?

**Validação Ativa (não passiva):**
```
❌ "Há algo que não capturei?" (usuário responde "não" automático)
✅ "Com base no que você disse, o maior risco parece ser X. Isso está correto?"
```

**Regra:** Força o usuário a pensar na validação, não aceita confirmação passiva.

---

## 🎮 Modos de Interação

### Solo

| Aspecto | Descrição |
|---------|-----------|
| **Composição** | Usuário + 1 conselheiro + Moderador |
| **Quando usar** | Perspectiva específica |
| **HOLD** | ✅ Completo |

### Mesa (MVP)

| Aspecto | Descrição |
|---------|-----------|
| **Composição** | Usuário + 2 conselheiros + Moderador |
| **Quando usar** | Decisão complexa, múltiplas perspectivas |
| **HOLD** | ✅ Completo |

### Mesa Completa (Pós-MVP)

| Aspecto | Descrição |
|---------|-----------|
| **Composição** | Usuário + 4 conselheiros + Moderador |

### Revisão

| Aspecto | Descrição |
|---------|-----------|
| **Composição** | Usuário + Moderador |
| **Quando usar** | Revisar decisão passada |

---

## ⚡ Fluxos Especiais

### Pausa por Silêncio

```
Conselheiro termina de falar
    ↓
Moderador: "Você quer adicionar algo?"
    ↓
└─ Sem resposta → Sessão espera (nunca avança sozinha)
```

### Pressão dos Conselheiros

Quando conselheiros querem continuar debatendo:

```
Moderador: "Os conselheiros ainda têm pontos sobre [tema].
Você deseja:
① Continuar o debate
② Avançar para a decisão
③ Fazer uma pergunta específica"
```

**Regra:** Decisão de continuar é SEMPRE do usuário.

### Usuário Não Quer Decidir

Opções oferecidas pelo Moderador:

| Opção | Resultado |
|-------|-----------|
| **Adiar** | Sessão salva como pausada |
| **Reduzir escopo** | Redefine decisão menor |
| **Experimento** | Registra teste ao invés de decisão |

### Context Shift (Quebra de Premissa)

Quando o usuário introduz informação nova que muda as premissas durante a Fase O:

```
Usuário: "Na verdade, esqueci de mencionar que [informação crucial]"
    ↓
Moderador detecta Context Shift
    ↓
Insere divisor visual no chat:
"─────── NOVAS PREMISSAS IDENTIFICADAS ───────"
    ↓
Moderador faz resumo forçado do novo cenário
    ↓
Só então conselheiros podem falar de novo
```

**Regras:**
- ❌ NÃO pergunta se quer voltar para Fase H — re-ancora automaticamente
- ❌ NÃO oferece "incorporar e continuar" — é armadilha que gera confusão
- ✅ Marcador visual obrigatório separa contexto velho do novo
- ✅ Resumo do novo cenário antes de qualquer nova fala

### Modo Crise (Debate Relâmpago)

Para decisões urgentes onde o processo completo é inviável:

**Ativação:**
- Moderador detecta linguagem de pânico/urgência no input
- OU usuário seleciona no Portal (com aviso: "Uso recomendado apenas para emergências")

**Fluxo:**

```
Moderador detecta urgência
    ↓
Oferece: "Parece urgente. Quer uma análise rápida?"
    ↓
FASE H (Express): 2-3 perguntas focadas
    ↓
FASE O (Express): 1 Conselheiro = Advogado do Diabo
    └─ 1 feedback curto e grosso: "Mas você considerou X?"
    ↓
FASE L: Decisão rápida
    ↓
FASE D: Ação imediata
    ↓
Tag: 🚨 Decisão de Crise
```

**Regras Anti-Abuso:**
- ❌ NUNCA remove o debate — apenas comprime
- ❌ NÃO coloca botão em destaque no Portal
- ✅ Revisão obrigatória em 24-48h (notificação automática)
- ✅ Sempre tem 1 contraponto antes da decisão
- ✅ Aviso visual se no Portal: "Use apenas para emergências"

**Implementação UI do Botão (Fase 06 - Portal):**
- Estilo: `action-secondary` ou link texto simples
- ❌ NUNCA card gigante igual aos modos Solo/Mesa
- Posição: abaixo dos cards principais, visualmente secundário
- Cor: neutra/cinza, não cor de destaque
- Texto: "Decisão Urgente" com ícone ⚡ pequeno
- Tooltip: "Use apenas para emergências reais"

**Justificativa:** HoldAI promete "pensar melhor", não "pensar rápido". Remover confronto esvazia a proposta de valor.

### Recapitulação ao Retomar Sessão

Quando o usuário retoma uma sessão pausada:

```
Usuário retoma sessão pausada
    ↓
Moderador: "Bem-vindo de volta. Aqui está onde paramos:

📋 Decisão em discussão: [resumo em 1-2 frases]
🎯 Fase atual: [O/L/D]
💬 Último ponto discutido: [resumo do último tema]

Você quer:
① Continuar de onde paramos
② Recapitular os pontos principais antes de continuar
③ Reiniciar a sessão com novo contexto"
```

**Regra:** Híbrido — resumo automático + opções para o usuário escolher como proceder.

### Navegação Entre Fases

O usuário pode voltar para fases anteriores:

```
Usuário na Fase L quer voltar para O
    ↓
Moderador: "Entendo que você quer voltar ao debate. 
Antes de voltarmos:

❓ O que especificamente você quer explorar mais?"
    ↓
[Usuário responde]
    ↓
Moderador redireciona para Fase O com foco no novo ponto
```

**Regras de Navegação:**

| Transição | Permitido | Observação |
|-----------|-----------|------------|
| L → O | ✅ Sim | Voltar para mais debate |
| D → L | ✅ Sim | Rever decisão antes de definir ação |
| O → H | ⚠️ Raro | Só se contexto mudou significativamente |
| Pular fases | ❌ Não | Não pode ir de H direto para D |

**Justificativa:** Flexibilidade com consciência — o Moderador pergunta o motivo para manter o rigor.

### Fluxo Flexível (Não Linear)

O fluxo HOLD nunca é 100% rígido. O Moderador adapta:

| Situação | Adaptação |
|----------|-----------|
| Decisão simples | Fase H + O mais curtas |
| Usuário já tem clareza | Menos perguntas na Fase H |
| Consenso rápido | Avança para L sem forçar debate |
| Tensão alta | Mais tempo na Fase O |

**Regra:** O Moderador lê o contexto e adapta o processo à necessidade do usuário.

---

## 🧠 Engenharia de Prompt

> Regras críticas para evitar falhas comuns de LLMs nas personas.

### Orquestração: Chamadas Encadeadas

Cada persona deve ser gerada em chamada separada para debate real:

```
Call 1: Input usuário → Output Estrategista
    ↓
Inject output no histórico
    ↓
Call 2: Histórico + "Pragmático, responda ao Estrategista" → Output Pragmático
    ↓
Inject output no histórico
    ↓
Call 3: Histórico + "Moderador, sintetize" → Output Moderador
```

**❌ PROIBIDO:** Single-call gerando todas as personas (vira "fanfic")
**✅ OBRIGATÓRIO:** Chained calls (cada um "ouve" o anterior)

**UX:** Streaming sequencial — cada persona "digita" após a anterior terminar.

### Divergência por Conflito de Valores

Os conselheiros NÃO divergem por negação ("mas..."), divergem por **FOCO diferente**.

**❌ PROIBIDO: Obrigação de Contraponto**
- Forçar a IA a discordar cria "Estupidez Artificial"
- Se uma ideia é boa, inventar críticas a torna boba
- LLMs sob pressão de instrução negativa inventam problemas inexistentes

**✅ CORRETO: Conflito de Prioridades**

| Conselheiro | Prioridade Máxima | Conflito Natural |
|-------------|-------------------|------------------|
| **Estrategista** | Market Share / Crescimento | Se falarem de Lucro, argumenta que Lucro AGORA mata Crescimento |
| **Pragmático** | Viabilidade / Execução | Se falarem de Escala, pergunta: "Como paga isso HOJE?" |
| **Analista de Riscos** | Segurança / Downside | Se falarem de Oportunidade, pergunta: "E se der errado?" |
| **Mentor** | Sustentabilidade / Valores | Se falarem de Velocidade, pergunta: "Isso está alinhado com quem você quer ser?" |

**Instrução nos Prompts:**
```
[Estrategista]:
Sua prioridade máxima é Market Share.
Se o Pragmático falar de Lucro, argumente que Lucro AGORA mata o Crescimento.
Você não discorda por discordar — você tem FOCO diferente.

[Pragmático]:
Sua prioridade máxima é Viabilidade.
Se o Estrategista falar de Escala, pergunte: "Como paga isso HOJE?"
Você não freia sonhos — você ancora no real.
```

### Tratamento de Dados: Fill in the Blank

A IA **NUNCA chuta números**. A IA **PEDE dados ao usuário**.

**❌ PROIBIDO:**
- Chutar valores (CAC, LTV, taxas, etc.)
- Usar "linguagem de incerteza" excessiva ("acho que é mais ou menos...")
- Construir argumentos sobre números inventados

**✅ CORRETO: Inverter o Ônus da Prova**

```
[Instrução para Todos os Conselheiros]:
- NÃO tente adivinhar dados numéricos do mercado ou do negócio do usuário
- PERGUNTE: "Qual é o seu [dado] atual?"
- Use os números DELE para construir ou destruir argumentos DELE
- Você fornece a LÓGICA, o usuário fornece os DADOS
```

**Exemplo:**
```
❌ Conselheiro: "O CAC do seu setor é aproximadamente R$ 50..."
✅ Conselheiro: "Qual é o seu CAC atual e o LTV projetado? 
   Com esses números posso analisar se essa estratégia escala."
```

**Benefícios:**
- Elimina alucinação numérica na raiz
- Força o usuário a conhecer seus próprios números
- Argumentos são construídos com dados reais, não inventados

### Teimosia Calibrada (Risco Aceito como Ata)

Quando o usuário ignora avisos de risco, NÃO ceder. Formalizar.

**❌ PROIBIDO:**
- Ceder à pressão do usuário para "não ser chato"
- Abandonar um risco real só porque o usuário não quer ouvir
- Ficar passivo-agressivo ("Eu avisei, hein")

**✅ CORRETO: Escalonamento Profissional**

| Pressão | Resposta |
|---------|----------|
| 1ª vez | Conselheiro reformula o ponto de forma diferente |
| 2ª vez | Conselheiro reconhece e formaliza: "Entendido. Vou pedir ao Moderador para catalogar isso como 'Risco Aceito' na documentação final. Podemos prosseguir." |
| 3ª vez+ | Moderador intervém: "Parece haver desacordo. Vamos registrar na decisão final?" |

**Instrução no Prompt:**
```
[Analista de Riscos]:
- Você pode RECONHECER os argumentos do usuário
- Você pode SUAVIZAR o tom
- Mas você NUNCA abandona um risco real
- Se o usuário insistir 2x, FORMALIZE: "Vou catalogar isso como 
  'Risco Aceito' na documentação final."
- O risco FICA no registro — não some.
```

### Registro na Fase L

A Fase L (Decisão) DEVE incluir seção de "Riscos Aceitos":

```
📋 DECISÃO REGISTRADA

Decisão: [texto da decisão]
Raciocínio: [por que escolheu isso]

⚠️ RISCOS ACEITOS:
- [Risco 1 que o usuário optou por ignorar]
- [Risco 2 que o usuário optou por ignorar]

🎯 Próxima Ação: [ação definida na Fase D]
```

**Regra:** Riscos aceitos não somem. Ficam documentados para revisão futura. Isso cria *accountability* sem ser passivo-agressivo.

---

## ⚙️ Configurações de Sessão

### Memória e Contexto

| Opção | Descrição | Tag Visual |
|-------|-----------|------------|
| **Padrão** | Memória + Contexto de projeto | — |
| **Sem Memória** | Não acessa sessões anteriores | 🔇 |
| **Sem Contexto** | Não acessa dados do projeto | 📭 |
| **Sessão Limpa** | Nenhum contexto prévio | 🔇📭 |

### Interrupção do Usuário

- Só em momentos específicos (quando convidado)
- Moderador gerencia e faz intermediação

---

## 📊 Sistema de Decisões

### Avaliação de Outcome

| Opção | Descrição |
|-------|-----------|
| ✅ **Sucesso** | Resultado positivo |
| ⚠️ **Parcial** | Alguns aspectos funcionaram |
| ❌ **Falha** | Não funcionou |
| ⏳ **Em andamento** | Muito cedo para avaliar |
| 🔄 **Pivotei** | Mudei de direção |

### Versionamento

- Decisões podem ser editadas após registro
- Histórico de versões: v1 → v2 → v3...
- Reverter cria nova versão (nunca deleta)
- Motivo de edição registrado

### Triggers de Revisão (MVP)

| Trigger | Notificação |
|---------|-------------|
| **Prazo de revisão** | "Faz 7 dias desde [decisão]. Como está?" |
| **Outcome pendente** | "Você ainda não avaliou [decisão de 30 dias]. Sucesso ou falha?" |

**Dashboard "Decisões Vencendo":**
- Seção no portal: prazo de revisão próximo
- Funciona como to-do list, não ata passiva
- Decisões pendentes de avaliação em destaque

**Pós-MVP (requer Vector DB):**
- Moderador cita passado espontaneamente
- "Há 2 meses você decidiu Y sobre este tema"
- Busca semântica no histórico

### Fluxo de Revisão de Falha

Quando o usuário marca Outcome = Falha:

```
Moderador: "Vamos analisar o que aconteceu.

1. O contexto mudou desde a decisão?
2. Houve informação que você não tinha na época?
3. A execução foi diferente do planejado?
4. O risco que aceitamos se materializou?"
    ↓
[Usuário responde]
    ↓
Moderador: "Validamos a hipótese X e ela se provou falsa 
devido ao risco Y. Esse aprendizado será considerado 
em sessões futuras sobre [tema]."
```

**Tom Obrigatório:**
- ✅ Clínico/cirúrgico
- ✅ Neutro e profissional
- ❌ Arrogante ("eu avisei")
- ❌ Passivo-agressivo

**Benefício:** Fracasso vira input valioso para futuro. Autoridade da IA aumenta quando o risco aceito se materializa.

### Exportação: Memo Executivo

**Formatos por Plano:**

| Plano | Exportação |
|-------|------------|
| **Free** | Copiar texto simples |
| **Plus** | Copiar Markdown formatado |
| **Pro** | Markdown + PDF formatado |

**❌ MORTO no MVP:** Link público temporário (risco de segurança/privacidade)

**Formato do Memo Executivo (Markdown):**

```markdown
# Decisão Estratégica

**Data:** [data da sessão]
**Sessão:** [título]

## Contexto
[Resumo do problema em 2-3 frases]

## Decisão
[O que faremos - declaração clara]

## Raciocínio
[Por que escolhemos isso - pontos principais do debate]

## Riscos Aceitos
- [Risco 1 que optamos por aceitar]
- [Risco 2 que optamos por aceitar]

## Próximos Passos
- [ ] [Ação 1 - prazo]
- [ ] [Ação 2 - prazo]
```

**Objetivo:** Colar no Notion/Slack/Email e parecer que o founder gastou 2h escrevendo. Valor tangível imediato.

---

## �️ CRM de Decisões

> O Chat é a interface de entrada. O Banco de Decisões é o produto.

### Conceito Central

HoldAI não é um chatbot. É um **Sistema Operacional de Governança** para Solo Founders. O CRM organiza o caos mental em uma hierarquia clara:

```
North Star (1-3 por conta, conforme plano)
    └── Projetos (N por North Star)
            └── Decisões (N por projeto)
                    └── Ações (N por decisão)
```

### Kanban de Decisões (4 Colunas Fixas)

| Coluna | Status | Quando |
|--------|--------|--------|
| **Em Debate** | `draft` | Sessão em andamento (Fase H/O/L) |
| **Decidido** | `pending` | Fase D concluída, ação pendente |
| **Em Maturação** | `watching` | Ação executada, aguardando resultado |
| **Auditado** | `audited` | Outcome marcado (sucesso/falha) |

**Regras:**
- ❌ Usuário NÃO pode criar colunas (metodologia opinativa)
- ✅ Status muda automaticamente conforme fluxo HOLD
- ✅ Transição manual: `pending` → `watching` (botão "Marquei como feito")

### Modo Crise no Kanban

- Decisões de crise vão para o Kanban normal
- Card tem badge 🚨 "Crise" (cor de alerta)
- Revisão obrigatória mais agressiva (24-48h)

### Decisões sem Projeto (Inbox)

- Decisões não vinculadas vão para lista "Não Vinculadas"
- Usuário pode vincular depois a um projeto
- North Star e Projetos são opcionais (mas incentivados)

### Paridade Desktop/Mobile

| Feature | Desktop | Mobile |
|---------|---------|--------|
| CRM Kanban | Colunas horizontais | Lista vertical com filtro por status |
| Nova Sessão | Modal overlay | Tela full screen |
| Detalhe decisão | Side panel | Tela full screen |
| North Star | Header do CRM | Card no topo |

---

## 🎓 First-Time User Experience (FTUX)

### O Problema do CRM Vazio

Usuário novo abre o app e vê Kanban vazio. Como abrir o Notion pela primeira vez: tela branca assustadora.

**Onde falha:** Usuário não entende onde clicar para "conversar com a IA" (a promessa do marketing) e fecha o app.

### Fluxo de Primeiro Login

```
Primeiro Login
    ↓
[Onboarding] "Bem-vindo ao HoldAI. Você tem uma decisão travada?"
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

### Animação de Transição (Fase D → Kanban)

```
Fase D concluída
    ↓
Tela: "Decisão registrada!" ✅
    ↓
Animação: Preview do card aparece e "voa" para a direita/baixo
    ↓
Transição para CRM
    ↓
Card aparece na coluna "Decidido" com highlight temporário (2s)
```

**Objetivo:** Fechar o loop mental. O trabalho virou um "asset" tangível.

### Tour de Onboarding (Cartões Flutuantes)

Após primeira sessão, cartões explicam:
- O que é cada coluna do Kanban
- Como criar novo Projeto
- Onde fica o North Star
- Como iniciar nova sessão

**Regra:** Usuário pode pular ou seguir até o fim.

### Regras de Navegação

| Situação | Destino |
|----------|---------|
| **Primeiro login** | Portal simplificado + onboarding |
| **Login com decisões** | CRM (Kanban) direto |
| **CRM vazio (decisões deletadas)** | "Comece uma nova sessão" no centro |

---

## �📎 Referência Rápida

| Documento | Conteúdo |
|-----------|----------|
| `visao_holdai.md` | Documento master com TUDO |
| `regras_decisoes.md` | Regras de negócio |
| `design_system.md` | Tokens e UI |
| `task.md` | Tasks de implementação |
| `planejamento_master.md` | Roadmap de fases |
| `implementacoes.md` | Lista de funcionalidades |

---

> **Última atualização:** 30/01/2026
