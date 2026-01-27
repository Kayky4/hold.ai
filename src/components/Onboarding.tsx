"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action?: string;
}

export default function Onboarding() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const steps: OnboardingStep[] = [
        {
            id: "welcome",
            title: "Bem-vindo ao Hold.ai! 🎉",
            description: "Sua mesa de advisors virtuais está pronta. Vamos fazer um tour rápido para você aproveitar ao máximo.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
        },
        {
            id: "personas",
            title: "Conheça as Personas",
            description: "Personas são seus advisors virtuais especializados. Cada uma tem expertise, vieses e estilo único. Você pode usar as padrão ou criar suas próprias.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            action: "Ver Personas",
        },
        {
            id: "meetings",
            title: "Reuniões Estratégicas",
            description: "Coloque duas personas para debater seu dilema. Elas vão discordar, concordar, e te ajudar a ver ângulos que você não veria sozinho.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            action: "Iniciar Reunião",
        },
        {
            id: "hold",
            title: "Framework HOLD",
            description: "Cada reunião é estruturada automaticamente: Hipótese → Objeções → Alavancas → Decisão. Você percebe o framework só no resumo final.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
        },
        {
            id: "decisions",
            title: "Dashboard de Decisões",
            description: "Todas as decisões ficam salvas num só lugar. Acompanhe o que foi decidido, o que está pendente, e revisiste quando precisar.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            action: "Ver Decisões",
        },
        {
            id: "ready",
            title: "Tudo Pronto! 🚀",
            description: "Você está pronto para tomar decisões melhores. Comece criando seu primeiro projeto ou iniciando uma reunião.",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await completeOnboarding(user.uid);
            await refreshProfile();
            router.push("/");
        } catch (error) {
            console.error("Error completing onboarding:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await completeOnboarding(user.uid);
            await refreshProfile();
            router.push("/");
        } catch (error) {
            console.error("Error skipping onboarding:", error);
        } finally {
            setLoading(false);
        }
    };

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${index <= currentStep
                                        ? "w-8 bg-gradient-to-r from-violet-600 to-purple-600"
                                        : "w-4 bg-[var(--border)]"
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        Pular tutorial
                    </button>
                </div>

                {/* Card */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
                    {/* Content */}
                    <div className="p-8 md:p-12 text-center">
                        {/* Icon */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 text-violet-400">
                            {step.icon}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-4">
                            {step.title}
                        </h1>

                        {/* Description */}
                        <p className="text-[var(--muted-foreground)] text-lg max-w-md mx-auto">
                            {step.description}
                        </p>

                        {/* Visual hints for specific steps */}
                        {step.id === "personas" && (
                            <div className="mt-8 flex justify-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <span className="text-2xl">💼</span>
                                </div>
                                <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-2xl">🔬</span>
                                </div>
                                <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <span className="text-2xl">📊</span>
                                </div>
                            </div>
                        )}

                        {step.id === "hold" && (
                            <div className="mt-8 grid grid-cols-4 gap-2 max-w-sm mx-auto">
                                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                    <span className="text-lg font-bold text-violet-400">H</span>
                                    <p className="text-[10px] text-[var(--muted)]">Hipótese</p>
                                </div>
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                    <span className="text-lg font-bold text-rose-400">O</span>
                                    <p className="text-[10px] text-[var(--muted)]">Objeções</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-lg font-bold text-emerald-400">L</span>
                                    <p className="text-[10px] text-[var(--muted)]">Alavancas</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-lg font-bold text-amber-400">D</span>
                                    <p className="text-[10px] text-[var(--muted)]">Decisão</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="px-8 py-6 bg-[var(--background)] border-t border-[var(--border)] flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Anterior
                        </button>

                        <div className="text-sm text-[var(--muted)]">
                            {currentStep + 1} de {steps.length}
                        </div>

                        {isLastStep ? (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Finalizando...
                                    </span>
                                ) : (
                                    "Começar! 🚀"
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all"
                            >
                                Próximo →
                            </button>
                        )}
                    </div>
                </div>

                {/* Tips */}
                <p className="text-center text-sm text-[var(--muted)] mt-6">
                    💡 Dica: Você pode revisitar este tutorial a qualquer momento nas configurações
                </p>
            </div>
        </div>
    );
}
