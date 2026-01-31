export type AIModel = "gemini-2.5-flash-lite" | "gemini-3-flash-preview";

export interface AIModelInfo {
    id: AIModel;
    name: string;
    description: string;
    speed: "fast" | "balanced" | "powerful";
}

export const AI_MODELS: AIModelInfo[] = [
    {
        id: "gemini-2.5-flash-lite",
        name: "Rápido",
        description: "Respostas ágeis para decisões simples.",
        speed: "fast",
    },
    {
        id: "gemini-3-flash-preview",
        name: "Avançado",
        description: "Análises mais profundas e detalhadas.",
        speed: "powerful",
    },
];

export const DEFAULT_MODEL: AIModel = "gemini-2.5-flash-lite";

export function getModelInfo(modelId: AIModel): AIModelInfo | undefined {
    return AI_MODELS.find(m => m.id === modelId);
}
