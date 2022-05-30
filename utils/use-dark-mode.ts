import { useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import { useMedia } from "react-use";

export default function useDarkMode() {
  const prefersDarkMode = usePrefersDarkMode();
  const [isEnabled, setIsEnabled] = useLocalStorage("dark-mode", true);

  const enabled = isEnabled === undefined ? prefersDarkMode : isEnabled;

  useEffect(() => {
    if (window === undefined) return;
    const root = window.document.documentElement;
    root.classList.remove(enabled ? "light" : "dark");
    root.classList.add(enabled ? "dark" : "light");
  }, [enabled]);

  return [enabled, setIsEnabled];
}

function usePrefersDarkMode() {
  return useMedia("(prefers-color-scheme: dark)", true);
}
