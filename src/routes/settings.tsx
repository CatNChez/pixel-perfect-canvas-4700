import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Shell";
import { usePrefs, PRESETS, type Prefs } from "@/lib/prefs";
import { useStore, type Lang } from "@/lib/store";
import { LANGS, LANG_IDS } from "@/lib/langs";
import type { ReactNode } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — CATty" },
    { name: "description", content: "Customize layout, theme, accent, animations, editor and presets." },
    { property: "og:title", content: "Settings — CATty" },
    { property: "og:description", content: "Customize your CATty coding workspace." },
  ] }),
  component: SettingsPage,
});

function Seg<T extends string>({ value, opts, on }: { value: T; opts: [T, string][]; on: (v: T) => void }) {
  return <div className="flex flex-wrap gap-1">{opts.map(([v, l]) => <button key={v} onClick={() => on(v)} className={`btn ${value === v ? "btn-primary" : ""}`}>{l}</button>)}</div>;
}
const Row = ({ label, children }: { label: string; children: ReactNode }) => <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"><span className="text-sm">{label}</span>{children}</div>;

function SettingsPage() {
  const { p, setP, reset } = usePrefs();
  const { s, set } = useStore();
  const u = (x: Partial<Prefs>) => setP({ ...x, preset: "custom" });
  return (
    <div>
      <PageHeader kicker="Preferences" title="Settings"><button className="btn" onClick={reset}>Reset to defaults</button></PageHeader>
      <h2 className="hud-label mb-3">Presets</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((pr) => (
          <button key={pr.id} onClick={() => { setP({ ...pr.prefs, preset: pr.id }); if (pr.lang) set((x) => ({ ...x, lang: pr.lang as Lang })); }}
            className={`panel p-4 text-left transition hover:-translate-y-0.5 hover:border-primary ${p.preset === pr.id ? "border-primary glow" : ""}`}>
            <div className="font-display font-semibold">{pr.name}</div><div className="text-sm text-muted-foreground">{pr.desc}</div>
          </button>
        ))}
      </div>
      <div className="panel mt-6 p-5">
        <Row label="Layout"><Seg value={p.layout} opts={[["curved", "Curved floating"], ["sidebar", "Sidebar workspace"]]} on={(v) => u({ layout: v })} /></Row>
        <Row label="Theme"><Seg value={p.theme} opts={[["dark", "Dark"], ["light", "Light"], ["system", "System"]]} on={(v) => u({ theme: v })} /></Row>
        <Row label="Accent colour"><div className="flex gap-2">{[230, 200, 260, 175, 300].map((h) => <button key={h} aria-label={`Accent ${h}`} onClick={() => u({ accent: h })} className={`h-7 w-7 rounded-full border-2 ${p.accent === h ? "border-foreground" : "border-transparent"}`} style={{ background: `oklch(0.75 0.13 ${h})` }} />)}</div></Row>
        <Row label="Animations"><Seg value={p.motion} opts={[["full", "Full"], ["subtle", "Subtle"], ["off", "Off"]]} on={(v) => u({ motion: v })} /></Row>
        <Row label="Night stars"><Seg value={p.stars ? "on" : "off"} opts={[["on", "On"], ["off", "Off"]]} on={(v) => u({ stars: v === "on" })} /></Row>
        <Row label={`Panel transparency (${p.glass}%)`}><input type="range" min={0} max={80} value={p.glass} onChange={(e) => u({ glass: +e.target.value })} /></Row>
        <Row label={`Editor font size (${p.editorSize}px)`}><input type="range" min={11} max={20} value={p.editorSize} onChange={(e) => u({ editorSize: +e.target.value })} /></Row>
        <Row label="Density"><Seg value={p.density} opts={[["comfortable", "Comfortable"], ["compact", "Compact"]]} on={(v) => u({ density: v })} /></Row>
        <Row label="Learning mode"><Seg value={p.mode} opts={[["beginner", "Beginner"], ["advanced", "Advanced"]]} on={(v) => u({ mode: v })} /></Row>
        <Row label="Sidebar"><Seg value={p.sidebarCollapsed ? "c" : "e"} opts={[["e", "Expanded"], ["c", "Collapsed"]]} on={(v) => u({ sidebarCollapsed: v === "c" })} /></Row>
        <Row label="Preferred language"><select className="field" value={s.lang} onChange={(e) => set((x) => ({ ...x, lang: e.target.value as Lang }))}>{LANG_IDS.map((l) => <option key={l} value={l}>{LANGS[l].label}</option>)}</select></Row>
      </div>
    </div>
  );
}
