"use client";

import { useState, useRef, useEffect } from "react";
import { AIModel, AI_MODELS, getModelInfo } from "@/types/models";

interface ModelSelectorProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
    compact?: boolean;
}

export default function ModelSelector({
    selectedModel,
    onModelChange,
    compact = false,
}: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentModel = getModelInfo(selectedModel);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getSpeedIcon = (speed: "fast" | "balanced" | "powerful") => {
        switch (speed) {
            case "fast":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case "balanced":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                );
            case "powerful":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                );
        }
    };

    const getSpeedColor = (speed: "fast" | "balanced" | "powerful") => {
        switch (speed) {
            case "fast":
                return "text-emerald-400";
            case "balanced":
                return "text-amber-400";
            case "powerful":
                return "text-violet-400";
        }
    };

    const getSpeedBg = (speed: "fast" | "balanced" | "powerful") => {
        switch (speed) {
            case "fast":
                return "bg-emerald-500/20";
            case "balanced":
                return "bg-amber-500/20";
            case "powerful":
                return "bg-violet-500/20";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-card transition-all ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {currentModel && (
                    <>
                        <span className={`${getSpeedColor(currentModel.speed)}`}>
                            {getSpeedIcon(currentModel.speed)}
                        </span>
                        <span className="text-foreground font-medium">
                            {currentModel.name}
                        </span>
                        <svg
                            className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2">
                        <p className="text-xs text-muted px-2 py-1 mb-1">Modelo de IA</p>
                        {AI_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${selectedModel === model.id
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-background"
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg ${getSpeedBg(model.speed)} flex items-center justify-center flex-shrink-0`}>
                                    <span className={getSpeedColor(model.speed)}>
                                        {getSpeedIcon(model.speed)}
                                    </span>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground text-sm">
                                            {model.name}
                                        </span>
                                        {selectedModel === model.id && (
                                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {model.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
