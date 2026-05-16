import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "ideaforge-theme";

const VALID_THEMES = ["light", "dark", "system"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) {
      return stored;
    }
    return "system";
  });

  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Determine effective theme
  const effectiveTheme = useMemo(() => {
    if (theme === "system") {
      return systemPreference;
    }
    return theme;
  }, [theme, systemPreference]);

  // Apply theme to document
  useEffect(() => {
    const htmlElement = document.documentElement;

    // Remove existing theme classes
    htmlElement.classList.remove("light", "dark");

    // Add new theme class
    htmlElement.classList.add(effectiveTheme);

    // Also set data-theme attribute for CSS access
    htmlElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  const changeTheme = useCallback((newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      effectiveTheme,
      systemPreference,
      changeTheme,
    }),
    [theme, effectiveTheme, systemPreference, changeTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
