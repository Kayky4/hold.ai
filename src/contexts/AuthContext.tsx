"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import {
    onAuthChange,
    getUserProfile,
    UserProfile,
    logOut as authLogOut,
} from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    needsProfileCompletion: boolean;
    needsOnboarding: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    setProfile(userProfile);
                } catch (error) {
                    console.error("Error loading user profile:", error);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            const updatedProfile = await getUserProfile(user.uid);
            setProfile(updatedProfile);
        }
    };

    const signOut = async () => {
        await authLogOut();
        setUser(null);
        setProfile(null);
    };

    const isAuthenticated = !!user;
    const needsProfileCompletion = isAuthenticated && profile && !profile.isProfileComplete;
    const needsOnboarding = isAuthenticated && profile && profile.isProfileComplete && !profile.hasCompletedOnboarding;

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isAuthenticated,
                needsProfileCompletion: needsProfileCompletion || false,
                needsOnboarding: needsOnboarding || false,
                refreshProfile,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
