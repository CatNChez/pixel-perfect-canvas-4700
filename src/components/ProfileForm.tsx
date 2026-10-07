import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore, type State } from "@/lib/store";

const ROLES = ["Programmer", "Driver", "Builder", "CAD & Notebook", "Captain", "Coach", "Scout"];

export function ProfileForm({ onboarding = false }: { onboarding?: boolean }) {
  const { s, set } = useStore();
  const [d, setD] = useState({ username: s.username, profile: s.profile, members: s.members, teamGoals: s.teamGoals, schedule: s.schedule });
  const [saved, setSaved] = useState(false);
  const p = d.profile;
  const setP = (k: keyof State["profile"], v: string) => setD({ ...d, profile: { ...p, [k]: v } });
  const save = () => { set((st) => ({ ...st, ...d, onboarded: true })); setSaved(true); setTimeout(() => setSaved(false), 1500); };

  const field = (label: string, k: keyof State["profile"], ph = "") => (
    <label className="block"><span className="hud-label">{label}</span><input className="field mt-1 w-full" placeholder={ph} value={p[k]} onChange={(e) => setP(k, e.target.value)} /></label>
  );

  return (
    <div className="space-y-4">
      {onboarding && <div><div className="hud-label text-primary">Welcome to CATty</div><h1 className="font-display text-3xl font-bold">Set up your profile</h1><p className="text-sm text-muted-foreground">Tell us about you and your team. You can change all of this any time.</p></div>}
      <div className="panel grid gap-3 p-5 md:grid-cols-2">
        <label className="block"><span className="hud-label">Your name</span><input className="field mt-1 w-full" value={d.username} onChange={(e) => setD({ ...d, username: e.target.value })} /></label>
        <label className="block"><span className="hud-label">Your role</span>
          <select className="field mt-1 w-full" value={p.role} onChange={(e) => setP("role", e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
        {field("Team name", "teamName", "Circuit Cats")}
        {field("Team number", "teamNumber", "1234C")}
        {field("Coach", "coach", "Coach name")}
        {field("School / club", "school", "")}
        {field("Current competition", "competition", "VEX V5 Regional")}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel space-y-2 p-5">
          <div className="flex items-center justify-between"><span className="hud-label text-primary">Team members</span><button className="btn !px-2" onClick={() => setD({ ...d, members: [...d.members, { name: "", role: "Builder" }] })}><Plus className="h-3.5 w-3.5" /></button></div>
          {d.members.map((m, i) => (
            <div key={i} className="flex gap-1">
              <input className="field flex-1" placeholder="Name" value={m.name} onChange={(e) => setD({ ...d, members: d.members.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
              <select className="field w-28" value={m.role} onChange={(e) => setD({ ...d, members: d.members.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
              <button className="btn !px-2" onClick={() => setD({ ...d, members: d.members.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {d.members.length === 0 && <p className="text-xs text-muted-foreground">No members yet.</p>}
        </div>
        <div className="panel space-y-2 p-5">
          <div className="flex items-center justify-between"><span className="hud-label text-primary">Team goals</span><button className="btn !px-2" onClick={() => setD({ ...d, teamGoals: [...d.teamGoals, { title: "", pct: 0 }] })}><Plus className="h-3.5 w-3.5" /></button></div>
          {d.teamGoals.map((g, i) => (
            <div key={i} className="space-y-1">
              <div className="flex gap-1">
                <input className="field flex-1" placeholder="Goal" value={g.title} onChange={(e) => setD({ ...d, teamGoals: d.teamGoals.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                <button className="btn !px-2" onClick={() => setD({ ...d, teamGoals: d.teamGoals.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center gap-2"><input type="range" min={0} max={100} className="flex-1 accent-[var(--color-primary)]" value={g.pct} onChange={(e) => setD({ ...d, teamGoals: d.teamGoals.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)) })} /><span className="w-10 font-mono text-xs">{g.pct}%</span></div>
            </div>
          ))}
        </div>
        <div className="panel space-y-2 p-5">
          <div className="flex items-center justify-between"><span className="hud-label text-primary">Practice schedule</span><button className="btn !px-2" onClick={() => setD({ ...d, schedule: [...d.schedule, { day: "", time: "" }] })}><Plus className="h-3.5 w-3.5" /></button></div>
          {d.schedule.map((x, i) => (
            <div key={i} className="flex gap-1">
              <input className="field w-20" placeholder="Day" value={x.day} onChange={(e) => setD({ ...d, schedule: d.schedule.map((y, j) => (j === i ? { ...y, day: e.target.value } : y)) })} />
              <input className="field flex-1" placeholder="Time" value={x.time} onChange={(e) => setD({ ...d, schedule: d.schedule.map((y, j) => (j === i ? { ...y, time: e.target.value } : y)) })} />
              <button className="btn !px-2" onClick={() => setD({ ...d, schedule: d.schedule.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end"><button className="btn btn-primary" onClick={save}>{saved ? "Saved ✔" : onboarding ? "Save and continue" : "Save changes"}</button></div>
    </div>
  );
}

/** A 0–100 slider the user drags to rate their own progress. */
export function RateSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[var(--color-primary)]" aria-label="Progress percent" />
      <span className="w-10 text-right font-mono text-xs">{value}%</span>
    </div>
  );
}
