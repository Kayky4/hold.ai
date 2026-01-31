/**
 * 🔄 Revision API Route
 * 
 * API para fluxo de revisão de decisões.
 * Streaming responses para experiência responsiva.
 * Usa Gemini API (mesmo padrão das outras rotas).
 * 
 * @see regras_decisoes.md — Revisão e Outcomes
 * @see prompt-engineer skill — Prompt patterns
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import {
    REVISION_MODERATOR_SYSTEM,
    getPresentDecisionPrompt,
    getExploreOutcomePrompt,
    getCaptureLearningPrompt,
    getConfirmationPrompt,
    EXTRACT_OUTCOME_PROMPT
} from "@/lib/prompts/revision";
import { Decision, DecisionOutcome, PipelineStatus } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

type RevisionAction =
    | "present_decision"    // Apresentar decisão para revisão
    | "process_outcome"     // Processar resposta sobre outcome
    | "explore_outcome"     // Explorar o outcome selecionado
    | "capture_learning"    // Capturar aprendizado
    | "confirm"             // Confirmar e salvar
    | "save_revision";      // Salvar revisão final

interface RevisionRequest {
    action: RevisionAction;
    decision: Decision;
    outcome?: DecisionOutcome;
    userMessage?: string;
    explanation?: string;
    learning?: string;
}

// ============================================
// 🔧 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 🌊 STREAMING HELPER
// ============================================

async function streamResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any,
    prompt: string
): Promise<Response> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const result = await model.generateContentStream(prompt);

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        const data = JSON.stringify({
                            type: "content",
                            content: text
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                }

                const doneData = JSON.stringify({ type: "done" });
                controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                controller.close();

            } catch (error) {
                console.error("[Revision API] Stream error:", error);
                const errorData = JSON.stringify({
                    type: "error",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

// ============================================
// 📤 POST Handler
// ============================================

export async function POST(request: NextRequest) {
    try {
        const body: RevisionRequest = await request.json();
        const { action, decision, outcome, userMessage, explanation, learning } = body;

        // Validate required fields
        if (!action || !decision) {
            return NextResponse.json(
                { error: "Missing required fields: action, decision" },
                { status: 400 }
            );
        }

        // Setup Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: DEFAULT_MODEL,
            systemInstruction: REVISION_MODERATOR_SYSTEM
        });

        switch (action) {
            // ============================================
            // 1. PRESENT DECISION
            // ============================================
            case "present_decision": {
                const prompt = getPresentDecisionPrompt(decision);
                return streamResponse(model, prompt);
            }

            // ============================================
            // 2. PROCESS OUTCOME (Extract from user response)
            // ============================================
            case "process_outcome": {
                if (!userMessage) {
                    return NextResponse.json(
                        { error: "Missing userMessage for process_outcome" },
                        { status: 400 }
                    );
                }

                // Create extraction model
                const extractModel = genAI.getGenerativeModel({
                    model: DEFAULT_MODEL,
                    systemInstruction: EXTRACT_OUTCOME_PROMPT
                });

                const result = await extractModel.generateContent(userMessage);
                const extractedOutcome = result.response.text().trim().toLowerCase();

                // Validate extracted outcome
                const validOutcomes: DecisionOutcome[] = ["success", "partial", "failure", "pending", "pivoted"];

                if (extractedOutcome && validOutcomes.includes(extractedOutcome as DecisionOutcome)) {
                    return NextResponse.json({
                        outcome: extractedOutcome as DecisionOutcome,
                        status: "extracted"
                    });
                }

                // If unclear, ask for clarification
                return NextResponse.json({
                    outcome: null,
                    status: "unclear",
                    message: "Não consegui identificar o resultado. Você pode escolher:\n\n1. ✅ Funcionou\n2. ⚠️ Parcial\n3. ❌ Não funcionou\n4. 🔄 Pivotei"
                });
            }

            // ============================================
            // 3. EXPLORE OUTCOME
            // ============================================
            case "explore_outcome": {
                if (!outcome) {
                    return NextResponse.json(
                        { error: "Missing outcome for explore_outcome" },
                        { status: 400 }
                    );
                }

                const prompt = getExploreOutcomePrompt(outcome, decision);
                return streamResponse(model, prompt);
            }

            // ============================================
            // 4. CAPTURE LEARNING
            // ============================================
            case "capture_learning": {
                if (!outcome) {
                    return NextResponse.json(
                        { error: "Missing outcome for capture_learning" },
                        { status: 400 }
                    );
                }

                const prompt = getCaptureLearningPrompt(outcome);
                return streamResponse(model, prompt);
            }

            // ============================================
            // 5. CONFIRM
            // ============================================
            case "confirm": {
                if (!outcome || !explanation || !learning) {
                    return NextResponse.json(
                        { error: "Missing fields for confirm" },
                        { status: 400 }
                    );
                }

                const prompt = getConfirmationPrompt(decision, outcome, explanation, learning);
                return streamResponse(model, prompt);
            }

            // ============================================
            // 6. SAVE REVISION
            // ============================================
            case "save_revision": {
                if (!outcome || !explanation || !learning) {
                    return NextResponse.json(
                        { error: "Missing fields for save_revision" },
                        { status: 400 }
                    );
                }

                // TODO: Implement actual database save
                // For now, return success with the revision data
                const revisionResult = {
                    decisionId: decision.id,
                    outcome,
                    explanation,
                    learning,
                    reviewedAt: new Date().toISOString(),
                    pipelineStatus: "audited" as PipelineStatus
                };

                console.log("[Revision API] Saving revision:", revisionResult);

                return NextResponse.json({
                    status: "saved",
                    revision: revisionResult
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error("[Revision API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
