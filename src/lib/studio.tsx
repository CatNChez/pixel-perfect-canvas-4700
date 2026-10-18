import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStore } from "./store";
import { starter, type Lang } from "./langs";
export interface StudioState { activeId: string; draft: string; output: string; folder: string; terminal: string[]; commandHistory: string[] }
const fresh = (): StudioState => ({ activeId: "", draft: starter("python"), output: "> Console ready.", folder: "All", terminal: ["CATty terminal · Python 3 / C++17"], commandHistory: [] });
const Ctx = createContext<{ studio: StudioState; update: (u: Partial<StudioState>) => void } | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const { scope } = useStore();
  const [studio, set] = useState<StudioState>(fresh);
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => { try { set({ ...fresh(), ...JSON.parse(localStorage.getItem(`catty-studio:${scope}`) ?? "{}") }); } catch { set(fresh()); } setReady(scope); }, [scope]);
  useEffect(() => { if (ready === scope) localStorage.setItem(`catty-studio:${scope}`, JSON.stringify(studio)); }, [studio, scope, ready]);
  return <Ctx.Provider value={{ studio, update: (u) => set((s) => ({ ...s, ...u })) }}>{children}</Ctx.Provider>;
}
export function useStudio() { const c = useContext(Ctx); if (!c) throw new Error("StudioProvider missing"); return c; }
export function isRobotLang(lang: Lang) { return lang === "vexpy" || lang === "vexcpp" || lang === "pros"; }
