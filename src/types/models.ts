export type AIModel = "gemini-2.5-flash-lite" | "gemini-2.5-flash" | "gemini-3-flash";

export interface AIModelInfo {
    id: AIModel;
    name: string;
    description: string;
    speed: "fast" | "balanced" | "powerful";
}

export const AI_MODELS: AIModelInfo[] = [
    {
        id: "gemini-2.5-flash-lite",
        name: "Flash Lite",
        description: "O mais rápido. Ideal para conversas rápidas.",
        speed: "fast",
    },
    {
        id: "gemini-2.5-flash",
        name: "Flash",
        description: "Equilíbrio entre velocidade e qualidade.",
        speed: "balanced",
    },
    {
        id: "gemini-3-flash",
        name: "Flash 3.0",
        description: "O mais poderoso. Respostas mais elaboradas.",
        speed: "powerful",
    },
];

export const DEFAULT_MODEL: AIModel = "gemini-2.5-flash-lite";

export function getModelInfo(modelId: AIModel): AIModelInfo | undefined {
    return AI_MODELS.find(m => m.id === modelId);
}
