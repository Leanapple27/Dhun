"use client";
import { useEffect } from "react";
import { useThemeStore } from "../stores/themeStore";
import { useGlobalShortcuts } from "../hooks/useGlobalShortcuts";

export default function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  useGlobalShortcuts();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
