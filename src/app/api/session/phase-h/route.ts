import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import {
    MODERATOR_PHASE_H_SYSTEM_PROMPT,
    CONTEXT_EXTRACTION_PROMPT,
    PhaseHContext
} from "@/lib/prompts/phaseH";

// ============================================
// 📐 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 📤 POST — Phase H Chat with Streaming
// ============================================

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            counselors,
            mode,
            model: requestedModel,
            action = "chat" // "chat" | "extract_context" | "check_completeness"
        } = await request.json();

        // Validate
        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: "Messages array is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;

        // Build system prompt with counselor context
        const counselorContext = counselors?.length > 0
            ? `\n\nCONSELHEIROS DESTA SESSÃO:\n${counselors.map((c: { name: string; description: string }) =>
                `- ${c.name}: ${c.description}`
            ).join("\n")}`
            : "";

        const fullSystemPrompt = MODERATOR_PHASE_H_SYSTEM_PROMPT + counselorContext;

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: selectedModel,
            systemInstruction: fullSystemPrompt,
        });

        // Handle different actions
        if (action === "extract_context") {
            return await handleContextExtraction(genAI, selectedModel, messages);
        }

        // Build conversation history
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        console.log("[phase-h API] Messages received:", messages.length);
        console.log("[phase-h API] History entries:", history.length);
        console.log("[phase-h API] Last message role:", messages[messages.length - 1]?.role);

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || !lastMessage.content) {
            console.error("[phase-h API] No valid last message found");
            return new Response(
                JSON.stringify({ error: "No valid message content" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log("[phase-h API] Sending to Gemini:", lastMessage.content.substring(0, 100) + "...");

        // Enable streaming
        const result = await chat.sendMessageStream(lastMessage.content);

        // Create a ReadableStream for SSE
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let totalChunks = 0;
                    console.log("[phase-h API] Starting stream...");

                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        totalChunks++;
                        if (text) {
                            // Send as SSE format
                            const data = JSON.stringify({
                                type: "content",
                                content: text
                            });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }

                    console.log("[phase-h API] Stream complete, total chunks:", totalChunks);

                    // Send completion signal
                    const doneData = JSON.stringify({
                        type: "done",
                        modelUsed: selectedModel
                    });
                    controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                    controller.close();
                } catch (error) {
                    console.error("[phase-h API] Stream error:", error);
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

    } catch (error: unknown) {
        console.error("Error in phase-h API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 🔍 CONTEXT EXTRACTION
// ============================================

async function handleContextExtraction(
    genAI: GoogleGenerativeAI,
    modelName: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "Você é um extrator de contexto. Analise conversas e extraia informações estruturadas em JSON.",
        });

        // Build full conversation text
        const conversationText = messages
            .map(m => `${m.role === "user" ? "USUÁRIO" : "MODERADOR"}: ${m.content}`)
            .join("\n\n");

        const prompt = `${CONTEXT_EXTRACTION_PROMPT}\n\n=== CONVERSA ===\n${conversationText}\n=== FIM DA CONVERSA ===`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Try to parse JSON from response
        let context: Partial<PhaseHContext> = {};
        try {
            // Extract JSON from markdown code block if present
            const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
            context = JSON.parse(jsonStr);
        } catch {
            console.error("Failed to parse context JSON:", responseText);
        }

        return new Response(
            JSON.stringify({
                success: true,
                context
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error extracting context:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
