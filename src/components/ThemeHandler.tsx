"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Forzamos el tema a light siempre para evitar conflictos con el modo oscuro
    const theme = "light";

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("dark");
        localStorage.setItem("inktoons_theme", "light");
    }, []);

    const toggleTheme = () => {
        // Desactivado por petición del usuario
        console.log("Modo oscuro desactivado.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
