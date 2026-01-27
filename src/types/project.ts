// Project context types for hold.ai

export interface ProjectContext {
    id: string;
    name: string;
    description: string;
    problemSolved: string;
    targetAudience: string;
    differentials: string;
    currentStage: "idea" | "validation" | "mvp" | "growth" | "scale";
    keyMetrics: string;
    currentGoals: string;
    additionalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectContextInput {
    name: string;
    description: string;
    problemSolved: string;
    targetAudience: string;
    differentials: string;
    currentStage: "idea" | "validation" | "mvp" | "growth" | "scale";
    keyMetrics: string;
    currentGoals: string;
    additionalNotes?: string;
}

export const STAGE_LABELS: Record<ProjectContext["currentStage"], string> = {
    idea: "💡 Ideia",
    validation: "🔍 Validação",
    mvp: "🚀 MVP",
    growth: "📈 Crescimento",
    scale: "🏢 Escala",
};

export const DEFAULT_PROJECT_CONTEXT: ProjectContextInput = {
    name: "",
    description: "",
    problemSolved: "",
    targetAudience: "",
    differentials: "",
    currentStage: "idea",
    keyMetrics: "",
    currentGoals: "",
    additionalNotes: "",
};
