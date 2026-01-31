"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "./AuthPage";
import CompleteProfile from "./CompleteProfile";
import Onboarding from "./Onboarding";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, profile, loading, isAuthenticated, needsProfileCompletion, needsOnboarding } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - show login
    if (!isAuthenticated) {
        return <AuthPage />;
    }

    // Authenticated but profile incomplete - show complete profile
    if (needsProfileCompletion) {
        return <CompleteProfile />;
    }

    // Authenticated and profile complete but needs onboarding
    if (needsOnboarding) {
        return <Onboarding />;
    }

    // Authenticated and profile complete - show app
    return <>{children}</>;
}
