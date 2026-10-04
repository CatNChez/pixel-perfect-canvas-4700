import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Circle, Plus, Trash2 } from "lucide-react";
import { Bar, PageHeader } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — CATty" },
      { name: "description", content: "Track progress across robotics, programming, CAD, autonomous and competition." },
      { property: "og:title", content: "My Progress — CATty" },
      { property: "og:description", content: "Track progress across robotics, programming, CAD, autonomous and competition." },
    ],
  }),
  component: ProgressPage,
});

const TRACKS = [
  { name: "Robotics", pct: 72, lessons: ["Intro to V5", "Motors & Gears", "Drivetrains", "Mechanisms", "Pneumatics", "Wiring", "Brain & Controller"] },
  { name: "Programming", pct: 61, lessons: ["Variables", "Functions", "Loops", "Motor control", "Sensors", "PID basics", "State machines"] },
  { name: "CAD", pct: 44, lessons: ["Sketching", "Extrude", "Assemblies", "VEX parts library", "Drawings"] },
  { name: "Autonomous", pct: 38, lessons: ["Timed driving", "Encoders", "Inertial turns", "Odometry", "Path planning"] },
  { name: "Competition", pct: 52, lessons: ["Game manual", "Scouting", "Driver practice", "Engineering notebook", "Interviews"] },
];

function ProgressPage() {
  const { s, set, uid } = useStore();
  const [open, setOpen] = useState<string>("Robotics");
  const [goal, setGoal] = useState("");
  const track = TRACKS.find((t) => t.name === open)!;
  const doneCount = Math.round((track.pct / 100) * track.lessons.length);

  return (
    <div>
      <PageHeader kicker="Learning Journey" title="MY PROGRESS" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-4 p-5">
          {TRACKS.map((t) => (
            <button key={t.name} onClick={() => setOpen(t.name)} className={`block w-full rounded-md p-3 text-left transition ${open === t.name ? "bg-secondary" : "hover:bg-muted"}`}>
              <div className="mb-1.5 flex justify-between"><span className="hud-label !text-foreground">{t.name}</span><span className="font-mono text-sm text-primary">{t.pct}%</span></div>
              <Bar value={t.pct} />
            </button>
          ))}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">{track.name} Lessons — {doneCount}/{track.lessons.length}</div>
          <ul className="space-y-2">
            {track.lessons.map((l, i) => (
              <li key={l} className="flex items-center gap-3 rounded-md bg-muted/60 px-3 py-2">
                {i < doneCount ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                <span className={i < doneCount ? "text-muted-foreground" : ""}>{l}</span>
                {i === doneCount && <span className="ml-auto hud-label text-accent">Up next</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="hud-label mb-3 mt-8">My Goals</h2>
      <div className="panel p-5">
        <div className="mb-4 flex gap-2">
          <input className="field flex-1" placeholder="New goal..." value={goal} onChange={(e) => setGoal(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { if (goal) { set((st) => ({ ...st, goals: [...st.goals, { id: uid(), title: goal, current: 0, target: 100 }] })); setGoal(""); } }}><Plus className="h-3.5 w-3.5" />Add</button>
        </div>
        <div className="space-y-4">
          {s.goals.map((g) => (
            <div key={g.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm"><span>{g.title}</span><span className="font-mono text-xs text-muted-foreground">{g.target === 100 ? `${g.current}%` : `${g.current} / ${g.target}`}</span></div>
                <input type="range" min={0} max={g.target} value={g.current} className="w-full accent-primary" onChange={(e) => set((st) => ({ ...st, goals: st.goals.map((x) => (x.id === g.id ? { ...x, current: +e.target.value } : x)) }))} />
              </div>
              <button className="text-muted-foreground hover:text-destructive" onClick={() => set((st) => ({ ...st, goals: st.goals.filter((x) => x.id !== g.id) }))}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
