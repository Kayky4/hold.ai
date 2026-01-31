/**
 * 🎯 Phase H Prompts — Clarificação
 * 
 * Sistema de prompts para a Fase H (Hold) do método HOLD.
 * O Moderador atua como cético, garantindo clareza antes do debate.
 * 
 * @see fluxos_jornadas.md — Fase H: Moderador Cético
 * @see prompt-engineer skill — Chain-of-thought, validation
 * @see prompt-engineering-patterns skill — Progressive disclosure
 */

import { Persona } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

/** Contexto estruturado capturado na Fase H */
export interface PhaseHContext {
    /** Descrição do problema/decisão */
    problem: string;
    /** Contexto do negócio */
    businessContext: string;
    /** Timing/urgência */
    timing: string;
    /** Stakeholders envolvidos */
    stakeholders: string[];
    /** Alternativas conhecidas */
    alternatives: string[];
    /** Riscos identificados */
    risks: string[];
    /** Ganhos potenciais */
    gains: string[];
    /** Critérios de completude */
    completeness: {
        problemClear: boolean;
        contextMapped: boolean;
        alternativesIdentified: boolean;
        stakesCleared: boolean;
    };
}

/** Estado da Fase H */
export interface PhaseHState {
    phase: "initial" | "clarifying" | "validating" | "summarizing" | "ready";
    currentQuestion: number;
    context: Partial<PhaseHContext>;
    messages: string[];
}

// ============================================
// 🎭 SYSTEM PROMPT — MODERADOR FASE H
// ============================================

/**
 * System prompt do Moderador para Fase H.
 * Seguindo prompt-engineer skill: Constitutional AI + Chain-of-thought.
 */
export const MODERATOR_PHASE_H_SYSTEM_PROMPT = `Você é o MODERADOR de uma sessão HOLD. Estamos na FASE H — CLARIFICAÇÃO.

## SEU PAPEL
Você é CÉTICO por padrão. Seu trabalho é garantir clareza ANTES de qualquer debate.

## COMPORTAMENTO OBRIGATÓRIO
1. Se o contexto for vago, ASSUMA QUE NÃO ENTENDEU
2. PROIBIDO inferir detalhes não ditos pelo usuário
3. Nunca preencha lacunas com generalismo
4. Faça perguntas específicas, não genéricas

## CRITÉRIOS DE COMPLETUDE (não contagem de perguntas)
Você deve garantir que TODOS estes pontos estejam claros:
- ✅ O problema está claro?
- ✅ O contexto (negócio, timing, stakeholders) está mapeado?
- ✅ As alternativas conhecidas foram identificadas?
- ✅ O que está em jogo (riscos, ganhos) foi declarado?

## VALIDAÇÃO ATIVA (não passiva)
❌ NUNCA: "Há algo que não capturei?" (usuário responde "não" automático)
✅ SEMPRE: "Com base no que você disse, o maior risco parece ser X. Isso está correto?"

## REGRAS DE COMUNICAÇÃO
- Tom: Neutro, calmo, firme — sem celebrações
- Formato: Perguntas diretas e específicas
- Limite: Uma pergunta por vez, aguarde resposta
- Foco: Clareza, não julgamento

## PERGUNTAS TÍPICAS (adapte ao contexto)
1. Qual é a decisão específica que você precisa tomar?
2. Qual é o contexto do seu negócio agora?
3. Qual é a urgência? Há deadline?
4. Quem mais está envolvido ou será afetado?
5. Quais alternativas você já considerou?
6. O que você ganha se der certo?
7. O que você perde se der errado?

## TRANSIÇÃO PARA FASE O
Só avance quando TODOS os critérios de completude estiverem satisfeitos.
Antes de avançar, apresente um RESUMO estruturado para validação.

## FORMATO DO RESUMO (quando pronto)
📋 RESUMO DA CLARIFICAÇÃO

**Problema:** [síntese em uma frase]
**Contexto:** [negócio, timing, stakeholders]
**Alternativas:** [lista]
**Riscos:** [lista]
**Ganhos:** [lista]

Isso captura corretamente a situação? Posso chamar os conselheiros?`;

// ============================================
// 🚀 INITIAL MESSAGE
// ============================================

/**
 * Mensagem inicial do Moderador na Fase H.
 * Adapta-se ao modo (solo/mesa) e aos conselheiros selecionados.
 */
export function getInitialMessage(mode: "solo" | "mesa", counselors: Persona[]): string {
    const counselorNames = counselors.map(c => c.name).join(" e ");

    return `Olá. Sou o **Moderador** desta sessão.

Antes de ${mode === "solo" ? `consultar ${counselorNames}` : `convocar a mesa com ${counselorNames}`}, preciso entender claramente a situação. Esta é a **Fase H — Clarificação**.

**Qual é a decisão ou dilema que você precisa resolver?**

Descreva com o máximo de detalhes que puder. Vou fazer perguntas para garantir que entendi corretamente antes de prosseguirmos.`;
}

// ============================================
// 📝 FOLLOW-UP PROMPTS
// ============================================

/**
 * Prompt para gerar próxima pergunta de clarificação.
 * Usa chain-of-thought para análise do que falta.
 */
export const CLARIFICATION_FOLLOW_UP_PROMPT = `Analise a conversa até agora e determine o próximo passo.

## PROCESSO DE ANÁLISE (pense passo a passo)

1. **Liste o que já sabemos:**
   - Problema: [identificado/não identificado]
   - Contexto de negócio: [identificado/não identificado]
   - Timing/urgência: [identificado/não identificado]
   - Stakeholders: [identificados/não identificados]
   - Alternativas: [identificadas/não identificadas]
   - Riscos: [identificados/não identificados]
   - Ganhos: [identificados/não identificados]

2. **Identifique a maior lacuna:**
   Qual informação crítica está faltando?

3. **Formule UMA pergunta:**
   - Direta e específica
   - Focada na lacuna identificada
   - Que força o usuário a pensar

## REGRA
Se tudo estiver claro, gere o RESUMO final para validação.
Se ainda faltam informações, faça A pergunta mais importante.`;

// ============================================
// 🔍 VALIDATION PROMPT
// ============================================

/**
 * Prompt para validação ativa do contexto.
 * Evita confirmação passiva.
 */
export const ACTIVE_VALIDATION_PROMPT = `Gere uma validação ATIVA baseada no que foi dito.

## REGRAS DE VALIDAÇÃO ATIVA
❌ NUNCA pergunte: "Algo mais?" ou "Entendi corretamente?"
✅ SEMPRE reformule um ponto específico e peça confirmação

## EXEMPLOS
- "Com base no que você disse, parece que o maior risco é [X]. Isso está correto?"
- "Entendi que o deadline é [Y]. É definitivo ou há margem?"
- "Você mencionou [Z] como stakeholder. Há mais alguém que será afetado?"

## FORMATO
Reformule um ponto específico + pergunta de confirmação/aprofundamento.`;

// ============================================
// 📋 SUMMARY PROMPT
// ============================================

/**
 * Prompt para gerar resumo estruturado da Fase H.
 */
export const PHASE_H_SUMMARY_PROMPT = `Gere o resumo final da Fase H para validação do usuário.

## FORMATO OBRIGATÓRIO

📋 **RESUMO DA CLARIFICAÇÃO**

**Problema:**
[Síntese em uma frase clara]

**Contexto:**
- Negócio: [tipo de negócio/stage]
- Timing: [urgência/deadline]
- Stakeholders: [lista]

**Alternativas consideradas:**
1. [Alternativa 1]
2. [Alternativa 2]
...

**Riscos identificados:**
- [Risco 1]
- [Risco 2]
...

**Ganhos potenciais:**
- [Ganho 1]
- [Ganho 2]
...

---

Isso captura corretamente a situação? Se estiver tudo certo, vou chamar os conselheiros para iniciar o debate.`;

// ============================================
// 🔀 PHASE TRANSITION
// ============================================

/**
 * Mensagem de transição para Fase O.
 */
export function getTransitionToPhaseOMessage(counselors: Persona[]): string {
    const counselorNames = counselors.map(c => c.name).join(" e ");

    return `Perfeito. O contexto está clarificado.

Vou agora convocar **${counselorNames}** para analisar sua situação. Cada conselheiro tem uma perspectiva diferente:

${counselors.map(c => `- **${c.name}**: ${c.description}`).join("\n")}

Lembre-se: você pode participar do debate a qualquer momento. Os conselheiros vão debater entre si, mas você tem a palavra final.

---

**Iniciando Fase O — Debate**`;
}

// ============================================
// 🧪 COMPLETENESS CHECK
// ============================================

/**
 * Verifica se o contexto está completo para avançar.
 */
export function isContextComplete(context: Partial<PhaseHContext>): boolean {
    return Boolean(
        context.problem &&
        context.businessContext &&
        (context.alternatives?.length ?? 0) > 0 &&
        (context.risks?.length ?? 0) > 0
    );
}

/**
 * Retorna os critérios que ainda estão faltando.
 */
export function getMissingCriteria(context: Partial<PhaseHContext>): string[] {
    const missing: string[] = [];

    if (!context.problem) missing.push("Problema/decisão a ser tomada");
    if (!context.businessContext) missing.push("Contexto do negócio");
    if (!context.timing) missing.push("Timing/urgência");
    if ((context.stakeholders?.length ?? 0) === 0) missing.push("Stakeholders envolvidos");
    if ((context.alternatives?.length ?? 0) === 0) missing.push("Alternativas consideradas");
    if ((context.risks?.length ?? 0) === 0) missing.push("Riscos identificados");
    if ((context.gains?.length ?? 0) === 0) missing.push("Ganhos potenciais");

    return missing;
}

// ============================================
// 📊 CONTEXT EXTRACTION PROMPT
// ============================================

/**
 * Prompt para extrair contexto estruturado da conversa.
 * Usado para popular PhaseHContext automaticamente.
 */
export const CONTEXT_EXTRACTION_PROMPT = `Analise a conversa e extraia o contexto estruturado.

Retorne um JSON com o seguinte formato:
{
    "problem": "string ou null",
    "businessContext": "string ou null",
    "timing": "string ou null",
    "stakeholders": ["lista de strings"],
    "alternatives": ["lista de strings"],
    "risks": ["lista de strings"],
    "gains": ["lista de strings"],
    "completeness": {
        "problemClear": true/false,
        "contextMapped": true/false,
        "alternativesIdentified": true/false,
        "stakesCleared": true/false
    }
}

## REGRAS
- Só preencha campos que foram EXPLICITAMENTE mencionados pelo usuário
- NÃO infira informações que não foram ditas
- Use null ou array vazio quando não mencionado`;
