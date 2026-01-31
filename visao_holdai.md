# 🎯 VISÃO HOLDAI — Documento Master

> Documento central com TODAS as informações do projeto.
> **Versão:** 1.0 | **Última atualização:** 30/01/2026

---

## 📋 Índice

1. [O que é HoldAI](#-o-que-é-holdai)
2. [Diferenciais](#-diferenciais)
3. [Princípios de Produto](#-princípios-de-produto)
4. [Visão de Futuro](#-visão-de-futuro)
5. [Core do Produto](#-core-do-produto)
6. [Personas](#-personas)
7. [Fluxos Principais](#-fluxos-principais)
8. [Modelo de Negócio](#-modelo-de-negócio)
9. [Stack Técnica](#-stack-técnica)
10. [Regras de Ouro](#-regras-de-ouro)
11. [Roadmap MVP](#-roadmap)
12. [Documentos de Referência](#-documentos-de-referência)

---

## 🎯 O que é HoldAI

### Definição

**HoldAI** é uma plataforma de tomada de decisão para founders. Uma "Mesa de Conselheiros" virtual onde o usuário debate decisões estratégicas com personas de IA especializadas, guiado por um moderador que estrutura o processo.

### Problema que Resolve

Founders tomam decisões sozinhos, sem:
- Conselho de administração para consultar
- Mentores disponíveis 24/7
- Perspectivas divergentes estruturadas
- Registro de raciocínio para revisão futura
- Processo que force pensamento rigoroso
- Histórico de padrões de decisão

### Proposta de Valor

> "Um board de conselheiros que nunca dorme, nunca julga, e sempre confronta você a pensar melhor."

**O Paradigma Correto:**

| ❌ O que NÃO somos | ✅ O que SOMOS |
|-------------------|---------------|
| Chatbot melhorado | **CRM de Decisões** |
| Wrapper de IA | **Sistema de Governança para Solo Founders** |
| IA que conversa | **Auditor de decisões estratégicas** |

**A Distinção Killer (vs ChatGPT):**

| ChatGPT | HoldAI |
|---------|--------|
| Lembra **Fatos** ("O pricing é R$ 100") | Lembra **Lógica + Contrato de Risco** ("Escolhemos R$ 100 *apesar* do risco de churn, porque a prioridade era margem") |
| É um **Arquivo** | É um **Auditor** |
| Você INPUT via chat | **O Chat é a interface de entrada. O Banco de Decisões é o produto.** |

**Os 4 Pilares:**

| Pilar | O que significa |
|-------|-----------------|
| **Nunca dorme** | Disponível 24/7, sem agenda, sem espera |
| **Nunca julga** | Sem viés político, sem interesses pessoais |
| **Sempre confronta** | Confronto real, não validação barata |
| **Audita você** | Registra lógica, riscos aceitos, e cobra revisão |

**O Teste Final do MVP:**

| ❌ FALHA | ✅ SUCESSO |
|----------|------------|
| Usuário sentiu que teve "conversa legal" | **Usuário sentiu que assinou um contrato consigo mesmo** |

### Público-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Founders Solo** | Empreendedores que tomam decisões estratégicas sem sócios |
| **Startup Early-Stage** | Times pequenos sem board formal |
| **Freelancers/Consultores** | Profissionais que tomam decisões de carreira e negócio |
| **Uso** | Single-user (cada usuário tem seu próprio banco de decisões) |

---

## 💎 Diferenciais

### Por que HoldAI é diferente?

| Diferencial | Descrição |
|-------------|-----------|
| **Confronto obrigatório** | Não é um chatbot que concorda. É um conselheiro que desafia. O confronto nunca pode ser desligado. |
| **Estrutura HOLD** | Processo estruturado (H→O→L→D) que força clareza, debate, decisão e ação. Não é conversa livre. |
| **Múltiplas perspectivas** | 4 conselheiros com vieses diferentes debatem entre si. Não é uma única "opinião da IA". |
| **Moderador neutro** | O Moderador conduz mas nunca opina. Separa organização de conteúdo. |
| **Decisão + Ação** | Toda sessão termina com decisão E próxima ação concreta. Não é só "pensar sobre". |
| **Histórico versionado** | Decisões podem ser editadas com versionamento. Raciocínio preservado para revisão. |
| **Memória inteligente** | Conselheiros lembram de sessões anteriores e apontam padrões. |
| **IA pede, não chuta** | Conselheiros PEDEM dados ao usuário (CAC, LTV, etc.) em vez de chutar números. Elimina alucinação. |
| **CRM de Decisões** | O Chat é a entrada. O Banco de Decisões é o produto. Kanban com 4 colunas fixas. |
| **Hierarquia estruturada** | North Star → Projetos → Decisões → Ações. Organiza o caos mental do founder. |
| **Riscos documentados** | Riscos ignorados ficam registrados como "Riscos Aceitos" na decisão. Cria accountability. |
| **Memo Executivo** | Exporta decisão em Markdown formatado que cola perfeito no Notion/Slack. Parece que você escreveu. |

### O que NÃO somos

| ❌ NÃO somos | ✅ Somos |
|--------------|----------|
| Chatbot genérico | Mesa de conselheiros estruturada |
| Validação de ideias | Confronto de premissas |
| Conversa aberta | Processo H→O→L→D |
| Opinião única | 4 perspectivas divergentes |
| Sugestão passiva | Exigência de ação concreta |
| IA que chuta dados | IA que pede dados ao usuário |
| Risco some se ignorado | Risco fica registrado na ata |

---

## 🧭 Princípios de Produto

### 1. Confronto > Conforto

> O usuário vem aqui para ser desafiado, não validado.

- Todo conselheiro tem vieses conhecidos que serão usados para questionar
- O Moderador provoca tensões entre posições
- Evasões são detectadas e apontadas
- "Você está evitando decidir" é uma frase válida

### 2. Estrutura > Liberdade (com Flexibilidade)

> O processo HOLD existe para forçar rigor, mas o Moderador adapta à necessidade.

- Cada fase tem objetivo claro
- Não é possível pular fases (H direto para D)
- Pode voltar para fases anteriores (L → O, D → L)
- O Moderador guia a progressão e adapta o ritmo
- Fluxo nunca é 100% linear — adapta ao contexto

### 3. Ação > Reflexão

> Pensar é meio, não fim. Toda sessão termina com ação.

- A Fase D exige próxima ação concreta
- "Vou pensar mais" não é ação válida
- Prazo de revisão é definido
- Sem ação = sessão incompleta

### 4. Memória > Esquecimento

> O sistema lembra para que o usuário possa evoluir.

- Sessões anteriores informam novas sessões
- Padrões de decisão são identificados
- Decisões passadas são referenciadas quando relevante
- Aprendizados são registrados nas revisões

### 5. Neutralidade > Opinião

> O sistema facilita, não decide.

- O Moderador nunca opina sobre a decisão
- Conselheiros dão perspectivas, não recomendações
- O usuário sempre decide
- A ferramenta não tem "preferência"

### 6. Sobriedade > Celebração

> Tom profissional, sem gamificação barata.

- Sem emojis excessivos
- Sem "Parabéns pela decisão!"
- Som confirmação sóbria: "Decisão registrada."
- Respeito pela seriedade do processo

---

## 🔮 Visão de Futuro

### Curto Prazo (MVP)

| Feature | Status |
|---------|--------|
| Modo Solo (1 conselheiro) | 🎯 MVP |
| Modo Mesa (2 conselheiros) | 🎯 MVP |
| Modo Revisão | 🎯 MVP |
| 4 conselheiros pré-definidos | 🎯 MVP |
| Fluxo HOLD completo | 🎯 MVP |
| Banco de decisões | 🎯 MVP |
| Versionamento de decisões | 🎯 MVP |
| Pausar/retomar sessões | 🎯 MVP |

### Médio Prazo (3-6 meses)

| Feature | Descrição |
|---------|-----------|
| **Mesa Completa** | 4 conselheiros + Moderador debatendo |
| **Modo Impasse** | Fluxo especial para decisões travadas onde usuário está paralisado |
| **Check-in Estratégico** | Revisão periódica de padrões de decisão ("Você evita riscos 80% das vezes") |
| **Personas do Zero** | Criar conselheiros completamente customizados além dos 4 padrão |
| **Templates de Decisão** | Decisões comuns pré-estruturadas (pricing, contratação, pivot, etc.) |
| **Push Notifications** | Lembretes de revisão de decisões no prazo definido |

### Longo Prazo (6-12 meses)

| Feature | Descrição |
|---------|-----------|
| **Integração Calendário** | Sincronizar prazos de revisão com Google Calendar |
| **API de Decisões** | Exportar e integrar banco de decisões com outras ferramentas |
| **Decisões em Equipe** | Múltiplos usuários na mesma sessão (para startups com sócios) |
| **Análise de Padrões** | Dashboard com insights sobre estilo de decisão do usuário |
| **Conselheiros Especialistas** | Personas treinadas em domínios específicos (legal, financeiro, marketing) |
| **Modo Mentor** | Conectar com mentores humanos reais para sessões híbridas |

### Longo Prazo (12+ meses)

| Feature | Descrição |
|---------|-----------|
| **HoldAI for Teams** | Versão enterprise para boards e C-level |
| **Integração com BI** | Conselheiros acessam dados reais do negócio |
| **Decisões Recorrentes** | Sessões automáticas para decisões periódicas (OKRs, budget) |
| **Marketplace de Conselheiros** | Comunidade criando e compartilhando personas |

### Filosofia de Evolução

> **Profundidade antes de amplitude.** Preferimos fazer o fluxo HOLD extremamente bem antes de adicionar features paralelas. Cada nova feature deve reforçar o core, não diluir.

---

## 🔄 Core do Produto

### Método HOLD

| Fase | Nome | Objetivo |
|------|------|----------|
| **H** | Clarificação | Extrair contexto completo |
| **O** | Debate | Confronto entre perspectivas |
| **L** | Decisão | Sintetizar e escolher |
| **D** | Ação | Definir próximo passo concreto |

### Mesa de Conselheiros

- **O Moderador** conduz toda sessão (nunca opina)
- **4 Conselheiros** com perspectivas distintas debatem
- **O Usuário** participa, decide e define ação

### Modos de Interação

| Modo | Composição | Uso |
|------|------------|-----|
| **Solo** | 1 conselheiro + Moderador | Perspectiva específica |
| **Mesa** | 2 conselheiros + Moderador | Decisão complexa |
| **Revisão** | Moderador | Revisar decisão passada |

---

## 👥 Personas

### Estrutura de Todas as Personas

| Atributo | Descrição |
|----------|-----------|
| **Avatar** | Imagem visual gerada via IA |
| **Nome** | Identificador da persona |
| **Descrição** | Texto curto sobre o papel |

### O Moderador

| Atributo | Valor |
|----------|-------|
| **Nome** | Moderador |
| **Papel** | Conduzir, organizar, sintetizar |
| **Tom** | Neutro, organizado, calmo |
| **Editável** | ❌ Não |

### Os 4 Conselheiros

| Persona | Foco | Tom |
|---------|------|-----|
| **Estrategista** | Mercado, crescimento | Ambicioso, visionário |
| **Pragmático** | Execução, viabilidade | Direto, realista |
| **Analista de Riscos** | Falhas, riscos | Cético, metódico |
| **Mentor** | Experiência, valores | Sábio, empático |

**Características:**
- Pré-definidos mas 100% personalizáveis (Plus/Pro)
- Cada um tem vieses reconhecidos
- Podem ser "duros" mas respeitosos
- Intensidade do confronto varia conforme contexto

### Customização (Plus/Pro)

| Campo | Descrição |
|-------|-----------|
| Nome | Nome personalizado |
| Descrição | Texto de apresentação |
| Tom | Como se comunica |
| Estilo | Formal, casual, direto |
| Intensidade | Nível de confronto (1-5) |
| Vieses | Tendências declaradas |
| Princípios | Valores que guiam análises |
| Objetivos | O que busca no debate |

**Regra:** Campos estruturados que compõem comportamento — não é edição de prompt raw.

---

## 🔀 Fluxos Principais

### Fluxo de Sessão

```
Portal → Escolhe modo
    ↓
Seleção de conselheiros
    ↓
Configuração (memória/contexto)
    ↓
Fase H: Moderador extrai contexto
    ↓
Fase O: Conselheiros debatem
    ↓
Fase L: Usuário decide
    ↓
Fase D: Define próxima ação
    ↓
Sessão salva no histórico
```

### Configurações de Sessão

| Opção | Tag |
|-------|-----|
| Sem Memória de sessões anteriores | 🔇 |
| Sem Contexto de projeto | 📭 |
| Sessão Limpa (ambos) | 🔇📭 |

### Fluxos Especiais

| Situação | Comportamento |
|----------|---------------|
| **Silêncio do usuário** | Moderador pergunta, sessão espera |
| **Conselheiros querem continuar** | Usuário decide se avança |
| **Usuário não quer decidir** | Opções: adiar, reduzir, experimento |

---

## 💰 Modelo de Negócio

### Planos de Assinatura

| | **Free** | **Plus** R$ 99,90/mês | **Pro** R$ 399,90/mês |
|---|----------|------------------------|------------------------|
| Trial | — | 14 dias | — |
| Decisões/mês | 5 | Ilimitadas | Ilimitadas |
| Sessões/mês | 10 | Ilimitadas | Ilimitadas |
| Modo Solo | ✅ | ✅ | ✅ |
| Modo Mesa (2) | ❌ | ✅ | ✅ |
| Modo Mesa (4) | ❌ | ❌ | ✅ |
| Personalizar Conselheiros | ❌ | ✅ | ✅ |
| Push Notifications | ❌ | ✅ | ✅ |
| Exportar | ❌ | PDF | PDF + CSV + API |
| Histórico | 30 dias | Ilimitado | Ilimitado |
| Suporte | FAQ | Email | Chat + Video |

### Limites Free (resetam mensalmente)

- 5 decisões/mês
- 10 sessões/mês
- 50 mensagens/sessão
- 30 dias de histórico

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Next.js 16 |
| **UI** | React 19 + Tailwind CSS v4 |
| **Linguagem** | TypeScript |
| **Auth** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **IA** | Google Gemini API |
| **Deploy** | Vercel (futuro) |

### Estrutura do Projeto

```
src/
├── app/           # Rotas e páginas
├── components/    # Componentes React
├── contexts/      # AuthContext, ThemeContext
├── lib/           # Services (auth, sessions, decisions)
└── types/         # TypeScript interfaces
```

---

## ⚖️ Regras de Ouro

### Portal

> **NUNCA** campo de texto livre como primeira interação.

### Confronto

> Confronto **NUNCA** pode ser desligado. Intensidade configurável, existência não.

### Decisão

> Sessão **NUNCA** encerra sem próxima ação concreta definida.

### Tom

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| "Ótima escolha!" | "Decisão registrada." |
| "Vamos lá!" | "Qual o primeiro passo?" |
| Emojis excessivos | Tom neutro, profissional |

### UI

> **NUNCA** usar valores arbitrários (hex, px). Apenas tokens semânticos.

---

## 📅 Roadmap

### MVP (19 Fases)

| Bloco | Fases | Conteúdo |
|-------|-------|----------|
| 🏗️ Fundação | 00-05 | Design System, Limpeza, Personas, Schema, Auth, Layout |
| 🎯 Core | 06-13 | Portal, Seleção, Interface, Fases HOLD |
| 📦 Complemento | 14-16 | Banco, Revisão, Pausar |
| ✨ Polish | 17-18 | Onboarding, Refinamentos |

**Estimativa:** 12-17 dias

### Pós-MVP

- Mesa Completa (4 conselheiros)
- Modo Impasse
- Check-in Estratégico
- Personas customizadas do zero
- Exportação avançada

---

## 📎 Documentos de Referência

| Documento | Conteúdo |
|-----------|----------|
| `planejamento_master.md` | Roadmap detalhado com Mermaid |
| `design_system.md` | Tokens CSS, componentes, UI |
| `regras_decisoes.md` | Regras de negócio detalhadas |
| `task.md` | Tasks de implementação por fase |
| `implementacoes.md` | Lista de 96 funcionalidades |
| `fluxos_jornadas.md` | Fluxos, personas, jornadas |

---

## 🔢 Números do Projeto

| Métrica | Valor |
|---------|-------|
| Fases de implementação | 19 |
| Implementações totais | 96 |
| Personas | 5 (1 moderador + 4 conselheiros) |
| Modos de interação | 3 (Solo, Mesa, Revisão) |
| Planos de assinatura | 3 (Free, Plus, Pro) |

---

> **Este documento é a fonte de verdade do projeto. Mantenha-o atualizado.**