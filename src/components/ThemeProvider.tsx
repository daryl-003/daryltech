import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

const DASHBOARD_PREFIXES = ["/admin", "/staff", "/student", "/profile", "/blog/admin"];
const isDashboardPath = (p: string) => DASHBOARD_PREFIXES.some((pre) => p.startsWith(pre));

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("dten-theme") as Theme) || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const inDashboard = isDashboardPath(location.pathname);
    const applied: Theme = inDashboard ? theme : "dark";
    root.classList.remove("light", "dark");
    root.classList.add(applied);
    if (inDashboard) localStorage.setItem("dten-theme", theme);
  }, [theme, location.pathname]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "light" ? "dark" : "light"));

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
