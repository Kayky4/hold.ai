/**
 * ✨ DecisionFlyTransition Component
 * 
 * Animação de transição quando uma decisão é criada.
 * O card "voa" para o Kanban simulando a adição à lista.
 * 
 * @see fluxos_jornadas.md — Animação de Transição (Fase D → Kanban)
 */

"use client";

import { useEffect, useState } from "react";

interface DecisionFlyTransitionProps {
    /** Título da decisão criada */
    decisionTitle: string;
    /** Callback quando animação termina */
    onComplete: () => void;
}

export default function DecisionFlyTransition({
    decisionTitle,
    onComplete,
}: DecisionFlyTransitionProps) {
    const [phase, setPhase] = useState<"appear" | "fly" | "done">("appear");

    useEffect(() => {
        // Phase 1: Appear (show card)
        const appearTimer = setTimeout(() => {
            setPhase("fly");
        }, 1500);

        // Phase 2: Fly animation
        const flyTimer = setTimeout(() => {
            setPhase("done");
        }, 2300);

        // Phase 3: Complete
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearTimeout(appearTimer);
            clearTimeout(flyTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm">
            {/* Success Message */}
            <div className={`text-center transition-opacity duration-500 ${phase === "done" ? "opacity-0" : "opacity-100"}`}>
                {/* Checkmark Icon */}
                <div className={`
                    w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 
                    flex items-center justify-center mx-auto mb-6
                    transition-all duration-500
                    ${phase === "appear" ? "scale-100" : "scale-75 opacity-0"}
                `}>
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className={`
                    text-2xl font-bold text-foreground mb-2
                    transition-all duration-500
                    ${phase === "appear" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                `}>
                    Decisão registrada
                </h2>

                <p className={`
                    text-slate-500 dark:text-slate-400
                    transition-all duration-500 delay-100
                    ${phase === "appear" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                `}>
                    Indo para seu painel...
                </p>
            </div>

            {/* Flying Card */}
            <div
                className={`
                    absolute bg-card border border-border rounded-xl p-4 shadow-2xl
                    max-w-xs w-full mx-4
                    transition-all duration-700 ease-in-out
                    ${phase === "appear" ? "opacity-100 scale-100 translate-x-0 translate-y-20" : ""}
                    ${phase === "fly" ? "opacity-0 scale-50 translate-x-[40vw] -translate-y-[30vh]" : ""}
                    ${phase === "done" ? "opacity-0 scale-0" : ""}
                `}
                style={{
                    transformOrigin: "center center",
                }}
            >
                {/* Card Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">
                            {decisionTitle || "Nova decisão"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Agora mesmo
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Decidido
                    </span>
                </div>
            </div>
        </div>
    );
}
