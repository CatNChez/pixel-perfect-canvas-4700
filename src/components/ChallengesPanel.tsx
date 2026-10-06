import { useState } from "react";
import { Check, Plus, Trash2, Trophy, X } from "lucide-react";
import { useStore, type Challenge } from "@/lib/store";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export function ChallengesPanel({ activeId, onStart }: { activeId: string | null; onStart: (c: Challenge) => void }) {
  const { s, set, uid } = useStore();
  const [form, setForm] = useState<Challenge | null>(null);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button className="btn border-accent text-accent" onClick={() => setForm({ id: "", level: "BEGINNER", text: "", points: 50, keyword: "" })}><Plus className="h-3.5 w-3.5" />Add challenge</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {s.challenges.map((c) => {
          const done = s.completedChallenges.includes(c.id);
          return (
            <div key={c.id} className={`panel flex flex-col p-4 ${activeId === c.id ? "border-accent" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="hud-label text-accent">{c.level}</span>
                <div className="flex items-center gap-2">
                  {done ? <Check className="h-4 w-4 text-success" /> : <Trophy className="h-4 w-4 text-muted-foreground" />}
                  <button title="Remove challenge" className="text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Remove this challenge?")) set((st) => ({ ...st, challenges: st.challenges.filter((x) => x.id !== c.id) })); }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="my-3 flex-1">{c.text}</p>
              <div className="mb-3 grid grid-cols-2 gap-1 font-mono text-[11px] text-muted-foreground">
                <span>PTS: {c.points}</span><span className={done ? "text-success" : ""}>{done ? "COMPLETE" : "OPEN"}</span>
              </div>
              <button className="btn justify-center" onClick={() => onStart(c)}>Start</button>
            </div>
          );
        })}
        {s.challenges.length === 0 && <div className="text-sm text-muted-foreground">No challenges. Add one!</div>}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setForm(null)}>
          <div className="panel glow w-full max-w-md space-y-3 bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><span className="hud-label text-primary">New Challenge</span><button onClick={() => setForm(null)}><X className="h-4 w-4" /></button></div>
            <textarea className="field w-full" placeholder="What should the code do?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} autoFocus />
            <div className="flex gap-2">
              <select className="field flex-1" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
              <input type="number" className="field w-24" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
            </div>
            <input className="field w-full" placeholder="Word the code must contain to pass (e.g. turn)" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
            <div className="flex justify-end"><button className="btn btn-primary" onClick={() => { if (!form.text) return; set((st) => ({ ...st, challenges: [...st.challenges, { ...form, id: uid(), keyword: form.keyword || "." }] })); setForm(null); }}>Add</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
