"use client";

import { useState } from "react";
import { SessionMode } from "@/types";

// ============================================
// 📐 PORTAL TYPES
// ============================================

interface PortalProps {
    /** Callback quando usuário seleciona um modo */
    onSelectMode: (mode: SessionMode) => void;
    /** Se é primeira vez do usuário (FTUX) */
    isFirstTime?: boolean;
    /** Callback para cancelar e voltar */
    onCancel?: () => void;
}

interface ModeCardProps {
    mode: SessionMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    isDisabled?: boolean;
    comingSoon?: boolean;
}

// ============================================
// 🎨 MODE CONFIGURATIONS
// ============================================

const MODE_CONFIG: Record<
    "solo" | "mesa" | "revision",
    {
        title: string;
        description: string;
        fullDescription: string;
    }
> = {
    solo: {
        title: "Solo",
        description: "Consulte 1 conselheiro para perspectiva específica",
        fullDescription:
            "Ideal para quando você precisa de uma visão focada sobre um aspecto da sua decisão. Um conselheiro irá analisar seu contexto e oferecer insights direcionados.",
    },
    mesa: {
        title: "Mesa",
        description: "Reúna 2 conselheiros para debate estruturado",
        fullDescription:
            "Perfeito para decisões complexas que se beneficiam de múltiplas perspectivas. Dois conselheiros irão debater os pontos, revelando tensões e oportunidades.",
    },
    revision: {
        title: "Revisão",
        description: "Use o Banco de Decisões para revisar",
        fullDescription:
            "Acesse suas decisões passadas através do Banco de Decisões na barra lateral. Lá você pode revisar outcomes e registrar aprendizados.",
    },
};

// ============================================
// 🧱 MODE CARD COMPONENT
// ============================================

function ModeCard({
    mode,
    title,
    description,
    icon,
    isSelected,
    onClick,
    isDisabled = false,
    comingSoon = false,
}: ModeCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled || comingSoon}
            className={`
                relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
                ${isSelected
                    ? "bg-primary/5 border-primary shadow-lg"
                    : "bg-card border-border hover:border-border-hover hover:shadow-md"
                }
                ${isDisabled || comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"}
            `}
        >
            {/* Coming Soon Badge */}
            {comingSoon && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                    Em breve
                </div>
            )}

            {/* Icon */}
            <div
                className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-4
                    transition-all duration-300
                    ${isSelected
                        ? "bg-primary text-white"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 group-hover:from-primary/10 group-hover:to-primary/20 group-hover:text-primary"
                    }
                `}
            >
                {icon}
            </div>

            {/* Content */}
            <h3
                className={`
                    text-xl font-semibold mb-2 transition-colors duration-200
                    ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary"}
                `}
            >
                {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}

// ============================================
// 🚪 PORTAL COMPONENT
// ============================================

export default function Portal({
    onSelectMode,
    isFirstTime = false,
    onCancel,
}: PortalProps) {
    const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSelectMode = (mode: SessionMode) => {
        setSelectedMode(mode);
    };

    const handleContinue = () => {
        if (!selectedMode) return;

        setIsAnimating(true);
        // Pequeno delay para animação
        setTimeout(() => {
            onSelectMode(selectedMode);
        }, 200);
    };

    // Icons para cada modo
    const SoloIcon = (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const MesaIcon = (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const RevisionIcon = (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    );

    return (
        <div
            className={`
                min-h-screen bg-background flex flex-col items-center justify-center p-6
                transition-opacity duration-200
                ${isAnimating ? "opacity-50" : "opacity-100"}
            `}
        >
            {/* Container */}
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-12">
                    {isFirstTime ? (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6">
                                <span className="text-white font-bold text-2xl">h</span>
                            </div>
                            <h1 className="text-3xl font-semibold text-foreground mb-3">
                                Comece sua primeira sessão
                            </h1>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Escolha como deseja abordar sua decisão. Cada modo oferece uma experiência diferente de análise.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold text-foreground mb-2">
                                Nova Sessão
                            </h1>
                            <p className="text-muted-foreground">
                                Selecione o modo de interação
                            </p>
                        </>
                    )}
                </div>

                {/* Mode Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <ModeCard
                        mode="solo"
                        title={MODE_CONFIG.solo.title}
                        description={MODE_CONFIG.solo.description}
                        icon={SoloIcon}
                        isSelected={selectedMode === "solo"}
                        onClick={() => handleSelectMode("solo")}
                    />
                    <ModeCard
                        mode="mesa"
                        title={MODE_CONFIG.mesa.title}
                        description={MODE_CONFIG.mesa.description}
                        icon={MesaIcon}
                        isSelected={selectedMode === "mesa"}
                        onClick={() => handleSelectMode("mesa")}
                    />
                    <ModeCard
                        mode="revision"
                        title={MODE_CONFIG.revision.title}
                        description={MODE_CONFIG.revision.description}
                        icon={RevisionIcon}
                        isSelected={selectedMode === "revision"}
                        onClick={() => handleSelectMode("revision")}
                        comingSoon={true}
                    />
                </div>

                {/* Selected Mode Details */}
                {selectedMode && selectedMode !== "revision" && (
                    <div className="bg-card border border-border rounded-xl p-5 mb-8 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {MODE_CONFIG[selectedMode as "solo" | "mesa"].fullDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleContinue}
                        disabled={!selectedMode || isAnimating}
                        className={`
                            px-8 py-3 rounded-xl font-medium text-sm transition-all duration-200
                            flex items-center gap-2
                            ${selectedMode
                                ? "bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }
                        `}
                    >
                        {isAnimating ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Continuar
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Subtle Footer Note */}
                {isFirstTime && (
                    <p className="text-center text-xs text-muted mt-8">
                        Todas as sessões passam pelo método HOLD: Clarificação → Debate → Decisão → Ação
                    </p>
                )}
            </div>
        </div>
    );
}
