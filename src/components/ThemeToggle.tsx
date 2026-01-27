"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-[var(--background)] border border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 group overflow-hidden"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {/* Background gradient animation */}
            <div
                className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isDark
                        ? "opacity-100 bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-indigo-900/30"
                        : "opacity-100 bg-gradient-to-r from-amber-100/50 via-orange-100/50 to-yellow-100/50"
                    }`}
            />

            {/* Stars (visible in dark mode) */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" />
                <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute top-2 left-6 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Toggle circle with sun/moon */}
            <div
                className={`absolute top-0.5 w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-out transform ${isDark
                        ? "translate-x-0.5 bg-gradient-to-br from-slate-200 to-slate-400"
                        : "translate-x-7 bg-gradient-to-br from-amber-300 to-orange-400"
                    }`}
            >
                {/* Moon icon */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                        }`}
                >
                    <svg
                        className="w-3.5 h-3.5 text-slate-700"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                </div>

                {/* Sun icon */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
                        }`}
                >
                    <svg
                        className="w-3.5 h-3.5 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>

                {/* Sun rays animation (light mode) */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"
                        }`}
                >
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-0.5 h-1 bg-amber-400/60 rounded-full"
                            style={{
                                top: "50%",
                                left: "50%",
                                transformOrigin: "center",
                                transform: `rotate(${i * 45}deg) translateY(-10px) translateX(-50%)`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Hover glow effect */}
            <div
                className={`absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isDark
                        ? "shadow-[inset_0_0_12px_rgba(99,102,241,0.3)]"
                        : "shadow-[inset_0_0_12px_rgba(251,191,36,0.3)]"
                    }`}
            />
        </button>
    );
}
