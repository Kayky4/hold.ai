/**
 * 🎓 FTUX Onboarding Component
 * 
 * First-Time User Experience para novos usuários.
 * Fluxo simples: Hook emocional → Sessão → CRM
 * 
 * @see fluxos_jornadas.md — FTUX
 * @see design_system.md — Industrial Minimal
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import SessionModal from "./SessionModal";
import { completeOnboarding } from "@/lib/auth";

type FTUXStep = "welcome" | "decision" | "session";

export default function Onboarding() {
    const { user, refreshProfile } = useAuth();
    const [step, setStep] = useState<FTUXStep>("welcome");
    const [showSession, setShowSession] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Handle session closed (complete onboarding)
    const handleSessionClose = async () => {
        setShowSession(false);

        if (!user) return;

        // Complete onboarding
        setIsCompleting(true);
        try {
            await completeOnboarding(user.uid);
            await refreshProfile();
        } catch (error) {
            console.error("Error completing onboarding:", error);
        } finally {
            setIsCompleting(false);
        }
    };

    // Skip onboarding
    const handleSkip = async () => {
        if (!user) return;
        setIsCompleting(true);
        try {
            await completeOnboarding(user.uid);
            await refreshProfile();
        } catch (error) {
            console.error("Error skipping onboarding:", error);
        } finally {
            setIsCompleting(false);
        }
    };

    // Start first session
    const handleStartSession = () => {
        setShowSession(true);
    };

    // Render loading overlay
    if (isCompleting) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                    <div className="w-8 h-8 border-3 border-slate-400 border-t-white rounded-full animate-spin" />
                </div>
                <p className="text-slate-400">Preparando sua mesa...</p>
            </div>
        );
    }

    // Step: Welcome - Hook Emocional
    if (step === "welcome") {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
                {/* Theme Toggle */}
                <div className="absolute top-4 right-4 z-50">
                    <ThemeToggle />
                </div>

                {/* Skip button - discreto */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 left-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    Pular
                </button>

                <div className="max-w-lg text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {/* Hook Question */}
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                        Você tem uma decisão <span className="text-slate-500 dark:text-slate-400">travada?</span>
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto">
                        Aquele dilema que fica girando na sua cabeça, sem resposta clara?
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setStep("decision")}
                            className="w-full px-8 py-4 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Sim, quero resolver agora
                        </button>
                        <button
                            onClick={handleSkip}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Só quero explorar primeiro
                        </button>
                    </div>
                </div>

                {/* Bottom hint */}
                <p className="absolute bottom-6 text-sm text-slate-400">
                    Hold.ai — Mesa de Conselheiros Virtuais
                </p>
            </div>
        );
    }

    // Step: Decision - Prepare for session
    if (step === "decision") {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
                {/* Theme Toggle */}
                <div className="absolute top-4 right-4 z-50">
                    <ThemeToggle />
                </div>

                {/* Back button */}
                <button
                    onClick={() => setStep("welcome")}
                    className="absolute top-4 left-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                </button>

                <div className="max-w-lg text-center">
                    {/* Counselor Icon */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Vamos destravá-la juntos
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                        Você vai conversar com um conselheiro virtual que vai te ajudar a pensar. Sem julgamento, sem pressa.
                    </p>

                    {/* HOLD Framework Preview */}
                    <div className="flex justify-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">H</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">O</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">L</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">D</span>
                        </div>
                    </div>

                    {/* Giant CTA */}
                    <button
                        onClick={handleStartSession}
                        className="w-full px-10 py-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-bold text-xl transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                    >
                        Começar minha primeira sessão →
                    </button>

                    {/* Time estimate */}
                    <p className="text-sm text-slate-400 mt-4">
                        ⏱️ ~10-15 minutos
                    </p>
                </div>

                {/* Session Modal */}
                <SessionModal
                    isOpen={showSession}
                    onClose={handleSessionClose}
                />
            </div>
        );
    }

    return null;
}
