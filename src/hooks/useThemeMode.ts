import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export function useThemeMode() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light", isLight);
    window.localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
  }, [isLight]);

  return {
    isLight,
    toggleTheme: () => setIsLight((current) => !current),
  };
}
