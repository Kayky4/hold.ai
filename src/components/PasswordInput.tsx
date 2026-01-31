"use client";

import { useState } from "react";

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    className?: string;
    id?: string;
}

export default function PasswordInput({
    value,
    onChange,
    placeholder = "••••••••",
    required = false,
    minLength,
    className = "",
    id,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                id={id}
                className={`w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${className}`}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border transition-all duration-200 group"
                tabIndex={-1}
            >
                {/* Eye icon container with animation */}
                <div className="relative w-5 h-5 overflow-hidden">
                    {/* Eye Open Icon */}
                    <svg
                        className={`w-5 h-5 absolute inset-0 transition-all duration-300 ease-out ${showPassword
                                ? "opacity-0 scale-90 rotate-12"
                                : "opacity-100 scale-100 rotate-0"
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>

                    {/* Eye Closed Icon */}
                    <svg
                        className={`w-5 h-5 absolute inset-0 transition-all duration-300 ease-out ${showPassword
                                ? "opacity-100 scale-100 rotate-0"
                                : "opacity-0 scale-90 -rotate-12"
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                    </svg>
                </div>

                {/* Ripple effect on click */}
                <span className="absolute inset-0 rounded-lg bg-primary/0 group-active:bg-primary/10 transition-colors duration-150" />
            </button>
        </div>
    );
}
