/**
 * 🎓 OnboardingTour Component
 * 
 * Tour com cartões flutuantes para guiar o usuário pelo CRM.
 * Mostra após primeira sessão completa.
 * 
 * @see fluxos_jornadas.md — Tour de Onboarding
 * @see design_system.md — Animações
 */

"use client";

import { useState, useEffect } from "react";

interface TourStep {
    id: string;
    title: string;
    description: string;
    targetSelector: string;
    position: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: "kanban",
        title: "Suas Decisões",
        description: "Cada coluna mostra o status da decisão: Pendente, Em Análise, Decidido ou Arquivado.",
        targetSelector: "[data-tour='kanban']",
        position: "bottom",
    },
    {
        id: "projects",
        title: "Projetos",
        description: "Organize suas decisões por projeto. Cada projeto pode ter seu North Star definido.",
        targetSelector: "[data-tour='projects']",
        position: "right",
    },
    {
        id: "northstar",
        title: "North Star",
        description: "Defina a métrica principal que guia todas as decisões do projeto.",
        targetSelector: "[data-tour='northstar']",
        position: "bottom",
    },
    {
        id: "new-session",
        title: "Nova Sessão",
        description: "Clique aqui sempre que precisar tomar uma nova decisão.",
        targetSelector: "[data-tour='new-session']",
        position: "left",
    },
];

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const step = TOUR_STEPS[currentStep];
    const isLastStep = currentStep === TOUR_STEPS.length - 1;
    const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(onSkip, 300);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
                onClick={handleSkip}
            />

            {/* Tour Card */}
            <div
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[101] w-full max-w-md px-4 transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-slate-100 dark:bg-slate-700">
                        <div
                            className="h-full bg-slate-800 dark:bg-white transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {step.description}
                                </p>
                            </div>
                            <span className="text-sm text-slate-400 whitespace-nowrap">
                                {currentStep + 1}/{TOUR_STEPS.length}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleSkip}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                Pular tour
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-5 py-2 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl font-medium text-sm transition-all hover:bg-slate-700 dark:hover:bg-slate-100"
                            >
                                {isLastStep ? "Concluir" : "Próximo →"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
