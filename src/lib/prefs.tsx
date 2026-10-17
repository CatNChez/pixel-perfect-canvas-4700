import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Layout = "sidebar" | "curved";
export type Theme = "dark" | "light" | "system";
export type Motion = "full" | "subtle" | "off";

export interface Prefs {
  layout: Layout;
  theme: Theme;
  accent: number; // oklch hue
  motion: Motion;
  stars: boolean;
  glass: number; // 0-100 panel transparency
  editorSize: number; // px
  density: "comfortable" | "compact";
  mode: "beginner" | "advanced";
  sidebarCollapsed: boolean;
  hiddenNav: string[];
  preset: string;
}

export const DEFAULT_PREFS: Prefs = {
  layout: "curved", theme: "dark", accent: 230, motion: "full", stars: true, glass: 30,
  editorSize: 14, density: "comfortable", mode: "beginner", sidebarCollapsed: false, hiddenNav: [], preset: "night",
};

export const PRESETS: { id: string; name: string; desc: string; prefs: Partial<Prefs>; lang?: string }[] = [
  { id: "beginner", name: "Beginner", desc: "Big controls, guided docs, only the essentials.", lang: "vexpy",
    prefs: { layout: "curved", mode: "beginner", editorSize: 16, density: "comfortable", motion: "subtle", hiddenNav: ["/robots", "/team", "/progress", "/calendar"] } },
  { id: "competition", name: "Competition Programmer", desc: "Code, docs, robots and tasks up front. Dense workspace.", lang: "vexcpp",
    prefs: { layout: "sidebar", mode: "advanced", editorSize: 13, density: "compact", motion: "subtle", hiddenNav: ["/notes", "/progress"] } },
  { id: "pros", name: "PROS Developer", desc: "C++, PROS and LemLib workspace with advanced docs.", lang: "pros",
    prefs: { layout: "sidebar", mode: "advanced", editorSize: 13, density: "compact", accent: 200, hiddenNav: ["/progress", "/calendar"] } },
  { id: "vexcode", name: "VEXcode User", desc: "Focused on official VEXcode Python & C++ workflows.", lang: "vexpy",
    prefs: { layout: "curved", mode: "beginner", editorSize: 15, hiddenNav: ["/team"] } },
  { id: "minimal", name: "Minimal", desc: "No stars, no extras. Just code and docs.",
    prefs: { layout: "sidebar", stars: false, motion: "off", glass: 0, density: "compact", hiddenNav: ["/notes", "/calendar", "/tasks", "/progress", "/robots", "/team"] } },
  { id: "night", name: "Immersive Night", desc: "Full midnight sky, stars, curves and glass.",
    prefs: { layout: "curved", stars: true, motion: "full", glass: 45, accent: 230, theme: "dark", hiddenNav: [] } },
];

const KEY = "catty-prefs-v1";
const Ctx = createContext<{ p: Prefs; setP: (u: Partial<Prefs>) => void; reset: () => void }>({ p: DEFAULT_PREFS, setP: () => {}, reset: () => {} });

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [p, set] = useState<Prefs>(DEFAULT_PREFS);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) set({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    const dark = p.theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : p.theme === "dark";
    el.classList.toggle("light", !dark);
    el.dataset["motion"] = p.motion;
    el.dataset["density"] = p.density;
    el.style.setProperty("--h", String(p.accent));
    el.style.setProperty("--glass", String(1 - p.glass / 100));
    el.style.setProperty("--editor-size", `${p.editorSize}px`);
  }, [p]);
  const setP = (u: Partial<Prefs>) => set((x) => { const n = { ...x, ...u }; localStorage.setItem(KEY, JSON.stringify(n)); return n; });
  const reset = () => { localStorage.removeItem(KEY); set(DEFAULT_PREFS); };
  return <Ctx.Provider value={{ p, setP, reset }}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);
