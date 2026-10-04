import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, ImagePlus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useStore, type Robot } from "@/lib/store";

export const Route = createFileRoute("/robots")({
  head: () => ({
    meta: [
      { title: "My Robots — CATty" },
      { name: "description", content: "Your personal collection of robots with build, CAD, code and performance details." },
      { property: "og:title", content: "My Robots — CATty" },
      { property: "og:description", content: "Your personal collection of robots with build, CAD, code and performance details." },
    ],
  }),
  component: RobotsPage,
});

const TABS = ["Overview", "Build", "CAD", "Code", "Notes", "Performance"] as const;

function RobotsPage() {
  const { s, set, uid } = useStore();
  const [sel, setSel] = useState(s.robots[0]?.id ?? "");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const r = s.robots.find((x) => x.id === sel);
  const upd = (p: Partial<Robot>) => set((st) => ({ ...st, robots: st.robots.map((x) => (x.id === sel ? { ...x, ...p } : x)) }));
  const F = ({ k, label }: { k: keyof Robot; label: string }) => (
    <label className="block"><span className="hud-label">{label}</span><input className="field mt-1 w-full" value={String(r?.[k] ?? "")} onChange={(e) => upd({ [k]: e.target.value } as Partial<Robot>)} /></label>
  );

  return (
    <div>
      <PageHeader kicker="Garage" title="MY ROBOTS">
        <button className="btn btn-primary" onClick={() => { const n: Robot = { id: uid(), name: "New Robot", team: "", competition: "", drivetrain: "", motors: "", sensors: "", mechanisms: "", lang: s.lang, notes: "" }; set((st) => ({ ...st, robots: [...st.robots, n] })); setSel(n.id); }}><Plus className="h-3.5 w-3.5" />Add Robot</button>
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        {s.robots.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={`panel flex items-center gap-2 px-4 py-2 ${x.id === sel ? "border-primary glow" : ""}`}><Bot className="h-4 w-4 text-primary" />{x.name}</button>)}
      </div>
      {r ? (
        <div className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-3">
            {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? "btn-primary" : ""}`}>{t}</button>)}
            <button className="btn ml-auto hover:!border-destructive hover:!text-destructive" onClick={() => set((st) => ({ ...st, robots: st.robots.filter((x) => x.id !== r.id) }))}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {tab === "Overview" && (
            <div className="grid gap-4 md:grid-cols-2">
              <F k="name" label="Robot Name" /><F k="team" label="Team" /><F k="competition" label="Competition" />
              <label className="block"><span className="hud-label">Programming Language</span>
                <select className="field mt-1 w-full" value={r.lang} onChange={(e) => upd({ lang: e.target.value as Robot["lang"] })}><option value="python">Python</option><option value="cpp">C++</option></select></label>
              <div className="md:col-span-2">
                <span className="hud-label">Photos</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(photos[r.id] ?? []).map((p, i) => <img key={i} src={p} alt={`${r.name} photo`} className="h-28 w-28 rounded-md border object-cover" />)}
                  <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                    <ImagePlus className="h-6 w-6" /><span className="text-xs">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotos((p) => ({ ...p, [r.id]: [...(p[r.id] ?? []), URL.createObjectURL(f)] })); }} />
                  </label>
                </div>
              </div>
            </div>
          )}
          {tab === "Build" && <div className="grid gap-4 md:grid-cols-2"><F k="drivetrain" label="Drivetrain" /><F k="motors" label="Motors" /><F k="sensors" label="Sensors" /><F k="mechanisms" label="Main Mechanisms" /></div>}
          {tab === "CAD" && <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">Link or upload your CAD files here (coming with accounts).</div>}
          {tab === "Code" && <div className="space-y-2">{s.projects.filter((p) => p.lang === r.lang).map((p) => <div key={p.id} className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{p.name}{p.lang === "python" ? ".py" : ".cpp"}</div>)}</div>}
          {tab === "Notes" && <textarea className="field min-h-60 w-full font-mono" value={r.notes} onChange={(e) => upd({ notes: e.target.value })} placeholder="Build notes..." />}
          {tab === "Performance" && (
            <div className="grid gap-3 sm:grid-cols-4">
              {[["Auton Avg", "18 pts"], ["Matches", "24"], ["Win Rate", "63%"], ["Skills Best", "142"]].map(([k, v]) => <div key={k} className="rounded-md bg-muted p-4"><div className="hud-label">{k}</div><div className="font-display text-2xl font-bold text-primary">{v}</div></div>)}
            </div>
          )}
        </div>
      ) : <div className="text-muted-foreground">Add your first robot.</div>}
    </div>
  );
}
