import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeCtx {
  theme: "light" | "dark";
  toggleTheme?: () => void;
  switchable: boolean;
}

function getSystemTheme(): "light" | "dark" {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = false,
}: {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark" | "system";
  switchable?: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    }
    return defaultTheme === "system" ? getSystemTheme() : (defaultTheme as "light" | "dark");
  });

  useEffect(() => {
    const el = document.documentElement;
    theme === "dark" ? el.classList.add("dark") : el.classList.remove("dark");
    if (switchable) localStorage.setItem("theme", theme);
  }, [theme, switchable]);

  useEffect(() => {
    if (defaultTheme !== "system" || switchable) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [defaultTheme, switchable]);

  const toggleTheme = switchable ? () => setTheme((t) => (t === "light" ? "dark" : "light")) : undefined;

  return <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
