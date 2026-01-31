"use client";

import { useState, useCallback } from "react";
import { Persona, SessionMode } from "@/types";
import { STRATEGIST, PRAGMATIST, RISK_ANALYST, MENTOR } from "@/lib/defaultPersonas";

// ============================================
// 📐 TYPES
// ============================================

interface CounselorSelectionProps {
    /** Modo selecionado: solo (1) ou mesa (2) */
    mode: SessionMode;
    /** Callback quando seleção for confirmada */
    onConfirm: (counselors: Persona[]) => void;
    /** Callback para voltar */
    onBack: () => void;
}

interface CounselorCardProps {
    counselor: Persona;
    isSelected: boolean;
    onClick: () => void;
    isDisabled?: boolean;
}

// ============================================
// 🎨 COUNSELOR VISUAL CONFIG
// ============================================

const COUNSELOR_COLORS: Record<string, {
    gradient: string;
    border: string;
    bg: string;
    text: string;
    icon: string;
}> = {
    "system-strategist": {
        gradient: "from-indigo-500 to-blue-600",
        border: "border-indigo-500",
        bg: "bg-indigo-500/10",
        text: "text-indigo-500",
        icon: "🧠"
    },
    "system-pragmatist": {
        gradient: "from-emerald-500 to-green-600",
        border: "border-emerald-500",
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        icon: "🔧"
    },
    "system-risk-analyst": {
        gradient: "from-amber-500 to-orange-600",
        border: "border-amber-500",
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        icon: "⚠️"
    },
    "system-mentor": {
        gradient: "from-violet-500 to-purple-600",
        border: "border-violet-500",
        bg: "bg-violet-500/10",
        text: "text-violet-500",
        icon: "🧓"
    }
};

// ============================================
// 🧱 COUNSELOR CARD COMPONENT
// ============================================

function CounselorCard({ counselor, isSelected, onClick, isDisabled = false }: CounselorCardProps) {
    const colors = COUNSELOR_COLORS[counselor.id] || COUNSELOR_COLORS["system-strategist"];

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
                relative w-full text-left p-5 rounded-2xl transition-all duration-300
                ${isSelected
                    ? `bg-card ${colors.border} border-2 shadow-lg scale-[1.02]`
                    : "bg-card border-2 border-border hover:border-border-hover hover:shadow-md"
                }
                ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer group"}
                min-h-[160px] flex flex-col
            `}
        >
            {/* Selection Checkmark */}
            {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${colors.bg}`}>
                    <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}

            {/* Avatar / Icon */}
            <div
                className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-3
                    transition-all duration-300
                    ${isSelected
                        ? `bg-gradient-to-br ${colors.gradient}`
                        : `${colors.bg} group-hover:bg-gradient-to-br group-hover:${colors.gradient}`
                    }
                `}
            >
                <span className="text-xl">{colors.icon}</span>
            </div>

            {/* Content */}
            <h3
                className={`
                    text-lg font-semibold mb-1.5 transition-colors duration-200
                    ${isSelected ? colors.text : "text-foreground group-hover:text-foreground"}
                `}
            >
                {counselor.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {counselor.description}
            </p>

            {/* Tone indicator */}
            <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted">
                    <span className="font-medium">Tom:</span> {counselor.tone.split(",")[0]}
                </p>
            </div>
        </button>
    );
}

// ============================================
// 👥 COUNSELOR SELECTION COMPONENT
// ============================================

export default function CounselorSelection({
    mode,
    onConfirm,
    onBack
}: CounselorSelectionProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Counselors disponíveis
    const counselors: Persona[] = [STRATEGIST, PRAGMATIST, RISK_ANALYST, MENTOR];

    // Quantos conselheiros pode selecionar
    const maxSelection = mode === "solo" ? 1 : 2;

    // Handler de seleção
    const handleSelect = useCallback((counselor: Persona) => {
        setSelectedIds(prev => {
            // Se já selecionado, remove
            if (prev.includes(counselor.id)) {
                return prev.filter(id => id !== counselor.id);
            }

            // Se modo solo, substitui
            if (mode === "solo") {
                return [counselor.id];
            }

            // Se modo mesa e ainda pode adicionar
            if (prev.length < maxSelection) {
                return [...prev, counselor.id];
            }

            // Se modo mesa e já tem 2, substitui o mais antigo
            return [...prev.slice(1), counselor.id];
        });
    }, [mode, maxSelection]);

    // Handler de confirmação
    const handleConfirm = () => {
        if (selectedIds.length === 0) return;
        if (mode === "mesa" && selectedIds.length < 2) return;

        setIsAnimating(true);
        const selectedCounselors = counselors.filter(c => selectedIds.includes(c.id));

        setTimeout(() => {
            onConfirm(selectedCounselors);
        }, 200);
    };

    // Título dinâmico baseado no modo
    const getTitle = () => {
        if (mode === "solo") {
            return "Escolha seu conselheiro";
        }
        return "Escolha 2 conselheiros para a mesa";
    };

    const getSubtitle = () => {
        if (mode === "solo") {
            return "Este conselheiro irá analisar sua situação e oferecer uma perspectiva focada.";
        }
        return "Os conselheiros selecionados irão debater entre si, revelando diferentes ângulos da sua decisão.";
    };

    // Validação do botão
    const isConfirmDisabled = mode === "solo"
        ? selectedIds.length !== 1
        : selectedIds.length !== 2;

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
                <div className="text-center mb-10">
                    {/* Mode Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-4">
                        {mode === "solo" ? (
                            <>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs font-medium text-muted-foreground">Modo Solo</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-xs font-medium text-muted-foreground">Modo Mesa</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                        {getTitle()}
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        {getSubtitle()}
                    </p>
                </div>

                {/* Counselor Grid — 2x2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {counselors.map((counselor) => (
                        <CounselorCard
                            key={counselor.id}
                            counselor={counselor}
                            isSelected={selectedIds.includes(counselor.id)}
                            onClick={() => handleSelect(counselor)}
                        />
                    ))}
                </div>

                {/* Selection Summary (Mesa mode) */}
                {mode === "mesa" && selectedIds.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4 mb-6 animate-fade-in">
                        <p className="text-sm text-muted-foreground mb-2">
                            Selecionados ({selectedIds.length}/2):
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {selectedIds.map(id => {
                                const c = counselors.find(c => c.id === id);
                                const colors = COUNSELOR_COLORS[id];
                                if (!c || !colors) return null;
                                return (
                                    <span
                                        key={id}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}
                                    >
                                        {colors.icon} {c.name}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled || isAnimating}
                        className={`
                            px-8 py-3 rounded-xl font-medium text-sm transition-all duration-200
                            flex items-center gap-2
                            ${!isConfirmDisabled
                                ? "bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }
                        `}
                    >
                        {isAnimating ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Iniciar Sessão
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Helper text */}
                <p className="text-center text-xs text-muted mt-6">
                    {mode === "solo"
                        ? "Clique no card para selecionar"
                        : "Clique nos cards para selecionar (2 necessários)"
                    }
                </p>
            </div>
        </div>
    );
}
