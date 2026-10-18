import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "./store";
export type Layout = "sidebar" | "curved";
export type Theme = "dark" | "light" | "system";
export type Motion = "full" | "subtle" | "off";
export interface Prefs {
  layout: Layout; theme: Theme; accent: number; motion: Motion; stars: boolean; glass: number;
  editorSize: number; density: "comfortable" | "compact"; mode: "beginner" | "advanced";
  sidebarCollapsed: boolean; hiddenNav: string[]; preset: string;
  font: "Manrope" | "Sora" | "system"; editorFont: "JetBrains Mono" | "IBM Plex Mono" | "monospace";
  textSize: number; style: "sky" | "flat" | "neon"; split: "none" | "docs" | "music"; mini: boolean;
}
export interface SavedConfig { id: string; name: string; notes: string; prefs: Prefs; at: number }
export const DEFAULT_PREFS: Prefs = {
  layout: "sidebar", theme: "dark", accent: 230, motion: "subtle", stars: true, glass: 20,
  editorSize: 14, density: "comfortable", mode: "beginner", sidebarCollapsed: false, hiddenNav: [], preset: "night",
  font: "Manrope", editorFont: "JetBrains Mono", textSize: 15, style: "sky", split: "none", mini: true,
};
export const PRESETS: { id: string; name: string; desc: string; prefs: Partial<Prefs>; lang?: string }[] = [
  { id: "beginner", name: "Beginner", desc: "Room to learn.", lang: "vexpy", prefs: { editorSize: 16, density: "comfortable", motion: "subtle", split: "docs", hiddenNav: ["/robots", "/team", "/progress", "/calendar"] } },
  { id: "competition", name: "Competition", desc: "Code and reference.", lang: "vexcpp", prefs: { layout: "sidebar", mode: "advanced", editorSize: 13, density: "compact", split: "docs", hiddenNav: ["/notes", "/progress"] } },
  { id: "pros", name: "PROS developer", desc: "LemLib, front and center.", lang: "pros", prefs: { layout: "sidebar", mode: "advanced", editorSize: 13, accent: 200, split: "docs" } },
  { id: "vexcode", name: "VEXcode", desc: "Official VEX workflows.", lang: "vexpy", prefs: { layout: "curved", editorSize: 15, hiddenNav: ["/team"] } },
  { id: "minimal", name: "Minimal", desc: "Only the essentials.", prefs: { layout: "curved", stars: false, motion: "off", glass: 0, density: "compact", style: "flat", mini: false, hiddenNav: ["/notes", "/calendar", "/tasks", "/progress", "/robots", "/team"] } },
  { id: "night", name: "Immersive night", desc: "Blue sky and a soundtrack.", prefs: { stars: true, motion: "full", glass: 35, accent: 230, theme: "dark", style: "sky", mini: true, split: "music", hiddenNav: [] } },
];
const Ctx = createContext<{ p: Prefs; setP: (u: Partial<Prefs>) => void; reset: () => void; configs: SavedConfig[]; saveConfig: (name: string, notes: string) => void; removeConfig: (id: string) => void }>({ p: DEFAULT_PREFS, setP: () => {}, reset: () => {}, configs: [], saveConfig: () => {}, removeConfig: () => {} });
export function PrefsProvider({ children }: { children: ReactNode }) {
  const { scope } = useStore();
  const [p, set] = useState<Prefs>(DEFAULT_PREFS);
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [readyScope, setReadyScope] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`catty-prefs:${scope}`) ?? (scope === "public" ? localStorage.getItem("catty-prefs-v1") : null);
      const saved = raw ? JSON.parse(raw) : null;
      set({ ...DEFAULT_PREFS, ...(saved?.p ?? saved ?? {}) }); setConfigs(saved?.configs ?? []);
    } catch { set(DEFAULT_PREFS); setConfigs([]); }
    setReadyScope(scope);
  }, [scope]);
  useEffect(() => {
    if (readyScope !== scope) return;
    localStorage.setItem(`catty-prefs:${scope}`, JSON.stringify({ p, configs }));
    const el = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => el.classList.toggle("light", p.theme === "light" || (p.theme === "system" && !media.matches));
    applyTheme(); media.addEventListener("change", applyTheme);
    el.dataset.motion = p.motion; el.dataset.density = p.density; el.dataset.style = p.style;
    el.style.setProperty("--h", String(p.accent)); el.style.setProperty("--glass", String(1 - p.glass / 100));
    el.style.setProperty("--editor-size", `${p.editorSize}px`); el.style.setProperty("--body-size", `${p.textSize}px`);
    el.style.setProperty("--user-font", p.font === "system" ? "system-ui, sans-serif" : `"${p.font}", sans-serif`);
    el.style.setProperty("--editor-font", `"${p.editorFont}", monospace`);
    return () => media.removeEventListener("change", applyTheme);
  }, [p, configs, scope, readyScope]);
  return <Ctx.Provider value={{ p, setP: (u) => set((x) => ({ ...x, ...u })), reset: () => set(DEFAULT_PREFS), configs,
    saveConfig: (name, notes) => { if (name.trim()) setConfigs((list) => [{ id: crypto.randomUUID(), name: name.trim(), notes, prefs: { ...p }, at: Date.now() }, ...list]); },
    removeConfig: (id) => setConfigs((list) => list.filter((c) => c.id !== id)) }}>{children}</Ctx.Provider>;
}
export const usePrefs = () => useContext(Ctx);
