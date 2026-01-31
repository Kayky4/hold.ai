"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeUserProfile } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function CompleteProfile() {
    const { user, profile, refreshProfile } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
    const [company, setCompany] = useState(profile?.company || "");
    const [role, setRole] = useState(profile?.role || "");
    const [projectType, setProjectType] = useState(profile?.projectType || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const roles = [
        { value: "founder", label: "Founder / CEO" },
        { value: "cofounder", label: "Co-founder" },
        { value: "product", label: "Product Manager" },
        { value: "tech", label: "CTO / Tech Lead" },
        { value: "marketing", label: "Marketing / Growth" },
        { value: "operations", label: "Operações" },
        { value: "other", label: "Outro" },
    ];

    const projectTypes = [
        { value: "saas", label: "SaaS / Software" },
        { value: "marketplace", label: "Marketplace" },
        { value: "ecommerce", label: "E-commerce" },
        { value: "fintech", label: "Fintech" },
        { value: "healthtech", label: "Healthtech" },
        { value: "edtech", label: "Edtech" },
        { value: "agency", label: "Agência / Consultoria" },
        { value: "other", label: "Outro" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setError(null);
        setLoading(true);

        try {
            if (!displayName.trim()) {
                throw new Error("Digite seu nome");
            }

            await completeUserProfile(user.uid, {
                displayName,
                company: company || undefined,
                role: role || undefined,
                projectType: projectType || undefined,
            });

            await refreshProfile();
            router.push("/");
        } catch (err: any) {
            console.error("Error completing profile:", err);
            setError(err.message || "Erro ao salvar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Complete seu Perfil
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Nos conte um pouco mais sobre você para personalizar sua experiência
                    </p>
                </div>

                {/* Avatar Preview */}
                {user?.photoURL && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={user.photoURL}
                            alt="Foto de perfil"
                            className="w-20 h-20 rounded-full border-4 border-primary/20"
                        />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Como podemos te chamar? *
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Seu nome"
                                required
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Empresa ou Projeto
                            </label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Nome da sua startup ou empresa"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Qual seu papel?
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${role === r.value
                                            ? "bg-primary text-white"
                                            : "bg-background border border-border text-foreground hover:bg-border"
                                            }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Project Type */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Tipo de projeto
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {projectTypes.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setProjectType(t.value)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${projectType === t.value
                                            ? "bg-primary text-white"
                                            : "bg-background border border-border text-foreground hover:bg-border"
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Salvando...
                            </span>
                        ) : (
                            "Continuar"
                        )}
                    </button>

                    <p className="text-xs text-muted text-center">
                        Essas informações nos ajudam a personalizar suas experiências e sugestões.
                    </p>
                </form>
            </div>
        </div>
    );
}
