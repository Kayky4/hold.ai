import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export async function POST(request: NextRequest) {
    try {
        const { messages, systemPrompt, personaName, projectContext, model: requestedModel } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Validate and set model
        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;

        // Build enhanced system prompt with project context
        let enhancedSystemPrompt = systemPrompt || "";

        if (projectContext && projectContext.trim()) {
            enhancedSystemPrompt = `${systemPrompt}

=== CONTEXTO DO PROJETO DO USUÁRIO ===
${projectContext}
=== FIM DO CONTEXTO ===

IMPORTANTE: Você DEVE usar as informações do contexto acima para personalizar suas respostas. 
Quando o usuário perguntar sobre o projeto dele, responda com base nessas informações específicas.
Não invente informações - use APENAS o que foi fornecido no contexto.`;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: selectedModel,
            systemInstruction: enhancedSystemPrompt,
        });

        // Build conversation history for Gemini
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history,
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response.text();

        return NextResponse.json({
            role: "assistant",
            content: response,
            personaName: personaName || "Assistente",
            modelUsed: selectedModel,
        });

    } catch (error: unknown) {
        console.error("Error in chat API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate response", details: errorMessage },
            { status: 500 }
        );
    }
}
