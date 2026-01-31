import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import {
    MODERATOR_PHASE_D_SYSTEM_PROMPT,
    getAskActionPrompt,
    getAskDeadlinePrompt,
    getAskReviewDatePrompt,
    getFinalConfirmationPrompt,
    getSessionClosingMessage,
    SESSION_CLOSING_SYSTEM_PROMPT,
    ACTION_EXTRACTION_PROMPT,
    DEADLINE_EXTRACTION_PROMPT,
    PhaseDState,
    SessionRecord
} from "@/lib/prompts/phaseD";
import { CapturedDecision } from "@/lib/prompts/phaseL";

// ============================================
// 📐 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 📤 POST — Phase D with Streaming
// ============================================

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            decision,
            nextAction,
            actionDeadline,
            reviewDate,
            sessionId,
            userId,
            counselors,
            mode,
            model: requestedModel,
            action = "ask_action"
            // Actions: "ask_action" | "ask_deadline" | "ask_review" | 
            //          "confirm" | "close" | "extract_action" | "extract_deadline" | "chat"
        } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log("[phase-d API] Action:", action);

        // Handle different actions
        switch (action) {
            case "ask_action":
                return await handleAskAction(genAI, selectedModel, decision);

            case "ask_deadline":
                return await handleAskDeadline(genAI, selectedModel, nextAction);

            case "ask_review":
                return await handleAskReview(genAI, selectedModel, nextAction, actionDeadline);

            case "confirm":
                return await handleConfirm(genAI, selectedModel, decision, nextAction, actionDeadline, reviewDate);

            case "close":
                return await handleClose(genAI, selectedModel, decision, reviewDate);

            case "extract_action":
                return await handleExtractAction(genAI, selectedModel, messages);

            case "extract_deadline":
                return await handleExtractDeadline(genAI, selectedModel, messages);

            case "save_session":
                return await handleSaveSession(
                    sessionId, userId, decision, nextAction,
                    actionDeadline, reviewDate, counselors, mode
                );

            default:
                return await handleChat(genAI, selectedModel, decision, messages);
        }

    } catch (error: unknown) {
        console.error("Error in phase-d API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 📌 ASK ACTION HANDLER
// ============================================

async function handleAskAction(
    genAI: GoogleGenerativeAI,
    modelName: string,
    decision: CapturedDecision | string
): Promise<Response> {
    console.log("[phase-d API] Asking for action...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PHASE_D_SYSTEM_PROMPT,
    });

    const decisionText = typeof decision === "string"
        ? decision
        : decision.decision;

    const prompt = getAskActionPrompt(decisionText);

    return streamResponse(model, prompt);
}

// ============================================
// 📅 ASK DEADLINE HANDLER
// ============================================

async function handleAskDeadline(
    genAI: GoogleGenerativeAI,
    modelName: string,
    nextAction: string
): Promise<Response> {
    console.log("[phase-d API] Asking for deadline...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PHASE_D_SYSTEM_PROMPT,
    });

    const prompt = getAskDeadlinePrompt(nextAction);

    return streamResponse(model, prompt);
}

// ============================================
// 📆 ASK REVIEW HANDLER
// ============================================

async function handleAskReview(
    genAI: GoogleGenerativeAI,
    modelName: string,
    nextAction: string,
    actionDeadline: string
): Promise<Response> {
    console.log("[phase-d API] Asking for review date...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PHASE_D_SYSTEM_PROMPT,
    });

    const prompt = getAskReviewDatePrompt(nextAction, actionDeadline);

    return streamResponse(model, prompt);
}

// ============================================
// ✅ CONFIRM HANDLER
// ============================================

async function handleConfirm(
    genAI: GoogleGenerativeAI,
    modelName: string,
    decision: CapturedDecision | string,
    nextAction: string,
    actionDeadline: string,
    reviewDate: string
): Promise<Response> {
    console.log("[phase-d API] Confirming session...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PHASE_D_SYSTEM_PROMPT,
    });

    const decisionText = typeof decision === "string"
        ? decision
        : decision.decision;

    const prompt = getFinalConfirmationPrompt(
        decisionText,
        nextAction,
        actionDeadline,
        reviewDate
    );

    return streamResponse(model, prompt);
}

// ============================================
// 🏁 CLOSE HANDLER
// ============================================

async function handleClose(
    genAI: GoogleGenerativeAI,
    modelName: string,
    decision: CapturedDecision | string,
    reviewDate: string
): Promise<Response> {
    console.log("[phase-d API] Closing session...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SESSION_CLOSING_SYSTEM_PROMPT,
    });

    const decisionText = typeof decision === "string"
        ? decision
        : decision.decision;

    // Use the pre-defined closing message
    const closingMessage = getSessionClosingMessage(decisionText, reviewDate);

    // Stream a slightly personalized version
    const prompt = `Encerre a sessão com uma mensagem sóbria e profissional.

Decisão: "${decisionText}"
Data de revisão: ${reviewDate}

Use este template como base:
${closingMessage}

Personalize sutilmente mantendo o tom sóbrio. Não adicione celebrações.`;

    return streamResponse(model, prompt);
}

// ============================================
// 📊 EXTRACT ACTION HANDLER
// ============================================

async function handleExtractAction(
    genAI: GoogleGenerativeAI,
    modelName: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-d API] Extracting action...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você extrai informações estruturadas de conversas.",
    });

    const lastMessage = messages[messages.length - 1];

    const prompt = `${ACTION_EXTRACTION_PROMPT}

Resposta do usuário: "${lastMessage?.content || ""}"`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let extracted = {
            action: null as string | null,
            isSpecific: false,
            needsClarification: true,
            clarificationQuestion: "Pode ser mais específico sobre qual ação você vai tomar?"
        };

        try {
            const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
            extracted = JSON.parse(jsonStr);
        } catch {
            // Try to extract directly
            const cleanText = responseText.replace(/```json?\s*|\s*```/g, '');
            try {
                extracted = JSON.parse(cleanText);
            } catch {
                console.error("Failed to parse action JSON:", responseText);
            }
        }

        return new Response(
            JSON.stringify({ success: true, ...extracted }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error extracting action:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Failed to extract action" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 📅 EXTRACT DEADLINE HANDLER
// ============================================

async function handleExtractDeadline(
    genAI: GoogleGenerativeAI,
    modelName: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-d API] Extracting deadline...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você extrai informações de data de conversas. Use a data de hoje como referência.",
    });

    const lastMessage = messages[messages.length - 1];
    const today = new Date().toISOString().split('T')[0];

    const prompt = `${DEADLINE_EXTRACTION_PROMPT}

Data de hoje: ${today}

Resposta do usuário: "${lastMessage?.content || ""}"`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let extracted = {
            deadline: null as string | null,
            deadlineText: "",
            isValid: false
        };

        try {
            const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
            extracted = JSON.parse(jsonStr);
        } catch {
            const cleanText = responseText.replace(/```json?\s*|\s*```/g, '');
            try {
                extracted = JSON.parse(cleanText);
            } catch {
                console.error("Failed to parse deadline JSON:", responseText);
            }
        }

        return new Response(
            JSON.stringify({ success: true, ...extracted }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error extracting deadline:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Failed to extract deadline" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 💾 SAVE SESSION HANDLER
// ============================================

async function handleSaveSession(
    sessionId: string,
    userId: string,
    decision: CapturedDecision | string,
    nextAction: string,
    actionDeadline: string,
    reviewDate: string,
    counselors: string[],
    mode: string
): Promise<Response> {
    console.log("[phase-d API] Saving session...");

    const decisionData = typeof decision === "string"
        ? { decision }
        : decision;

    const sessionRecord: SessionRecord = {
        sessionId: sessionId || `session-${Date.now()}`,
        userId: userId || "anonymous",
        decision: decisionData as CapturedDecision,
        nextAction: nextAction || "",
        actionDeadline: new Date(actionDeadline),
        reviewDate: new Date(reviewDate),
        pipelineStatus: "pending",
        mode: mode as "solo" | "mesa",
        counselors: counselors || [],
        createdAt: new Date(),
        completedAt: new Date()
    };

    // TODO: Save to Firebase/Firestore
    // For now, just return the record
    console.log("[phase-d API] Session record:", sessionRecord);

    return new Response(
        JSON.stringify({
            success: true,
            sessionRecord,
            message: "Sessão salva com sucesso"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}

// ============================================
// 💬 CHAT HANDLER
// ============================================

async function handleChat(
    genAI: GoogleGenerativeAI,
    modelName: string,
    decision: CapturedDecision | string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-d API] General chat...");

    const decisionText = typeof decision === "string"
        ? decision
        : decision?.decision || "";

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `${MODERATOR_PHASE_D_SYSTEM_PROMPT}

## CONTEXTO

Decisão registrada: "${decisionText}"`,
    });

    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
        return new Response(
            JSON.stringify({ error: "No message content" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return streamResponse(chat, lastMessage.content, true);
}

// ============================================
// 📡 STREAM RESPONSE HELPER
// ============================================

async function streamResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelOrChat: any,
    prompt: string,
    isChat = false
): Promise<Response> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                let result;
                let totalChunks = 0;

                console.log("[phase-d API] Starting stream...");

                if (isChat) {
                    result = await modelOrChat.sendMessageStream(prompt);
                } else {
                    result = await modelOrChat.generateContentStream(prompt);
                }

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    totalChunks++;
                    if (text) {
                        const data = JSON.stringify({
                            type: "content",
                            content: text
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                }

                console.log("[phase-d API] Stream complete, chunks:", totalChunks);

                const doneData = JSON.stringify({ type: "done" });
                controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                controller.close();

            } catch (error) {
                console.error("[phase-d API] Stream error:", error);
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
