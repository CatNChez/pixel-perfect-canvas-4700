import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Calendar, CheckSquare, Code2, NotebookPen, PlayCircle, Users, Flame, Trophy, Gauge, Clock, Play, RotateCcw, Save, Send, Check } from "lucide-react";
import { Bar, PageHeader } from "@/components/Shell";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { ChallengesPanel } from "@/components/ChallengesPanel";
import { catColor, fmtTime, todayStr, useStore, type Challenge } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — CATty" },
      { name: "description", content: "Your coding command center: write and run Python or C++ robot code, take challenges, and see today's schedule." },
      { property: "og:title", content: "Command Center — CATty" },
      { property: "og:description", content: "Your coding command center: write and run Python or C++ robot code, take challenges, and see today's schedule." },
    ],
  }),
  component: Home,
});

const TABS = [
  { id: "code", label: "Code" },
  { id: "challenges", label: "Challenges" },
  { id: "overview", label: "Overview" },
] as const;
type Tab = typeof TABS[number]["id"];

const ACTIONS = [
  { to: "/code", label: "Write Code", icon: Code2 },
  { to: "/progress", label: "Continue Lesson", icon: PlayCircle },
  { to: "/notes", label: "Add Note", icon: NotebookPen },
  { to: "/tasks", label: "Add Task", icon: CheckSquare },
  { to: "/calendar", label: "Open Calendar", icon: Calendar },
  { to: "/robots", label: "My Robots", icon: Bot },
  { to: "/team", label: "My Team", icon: Users },
] as const;

function Home() {
  const { s } = useStore();
  const [tab, setTab] = useState<Tab>("code");
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const today = todayStr();
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const todayEv = s.events.filter((e) => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const tomEv = s.events.filter((e) => e.date === tomorrow);
  const next = [...s.events].filter((e) => e.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).find((e) => e.title.toLowerCase().includes("due")) ?? null;

  const stats = [
    { label: "Robotics Level", value: "Level 4", bar: 64, icon: Bot },
    { label: "Course Progress", value: "72%", bar: 72, icon: Gauge },
    { label: "Coding Level", value: "Intermediate", bar: 55, icon: Code2 },
    { label: "Challenges Completed", value: String(37 + s.completedChallenges.length), bar: 76, icon: Trophy },
    { label: "Current Streak", value: "12 days", bar: 40, icon: Flame },
  ];

  return (
    <div>
      <PageHeader kicker="Your Coding Command Center" title={`WELCOME BACK, ${s.username.toUpperCase()}`} />

      <div className="mb-6 flex justify-center">
        <div className="flex gap-1 rounded-md border bg-card/60 p-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "code" && <CodeWorkspace challenge={challenge} onClearChallenge={() => setChallenge(null)} showProjects={false} />}
      {tab === "challenges" && <ChallengesPanel activeId={challenge?.id ?? null} onStart={(c) => { setChallenge(c); setTab("code"); }} />}

      {tab === "overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {stats.map((st) => (
              <div key={st.label} className="panel p-4">
                <div className="flex items-center justify-between"><span className="hud-label">{st.label}</span><st.icon className="h-4 w-4 text-primary" /></div>
                <div className="my-2 font-display text-2xl font-bold">{st.value}</div>
                <Bar value={st.bar} />
              </div>
            ))}
            <div className="panel border-accent/40 p-4">
              <div className="flex items-center justify-between"><span className="hud-label">Next Deadline</span><Clock className="h-4 w-4 text-accent" /></div>
              <div className="mt-2 font-display text-lg font-semibold leading-tight text-accent">{next ? next.title : "Nothing due"}</div>
              {next && <div className="mt-1 font-mono text-xs text-muted-foreground">{new Date(next.date + "T00:00").toLocaleDateString(undefined, { weekday: "long" })}</div>}
            </div>
          </div>

          <h2 className="hud-label mb-3 mt-8">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ACTIONS.map((a) => (
              <Link key={a.label} to={a.to} className="panel group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-1 hover:border-primary hover:glow">
                <a.icon className="h-8 w-8 text-primary transition group-hover:scale-110" />
                <span className="font-mono text-xs uppercase tracking-widest">{a.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="panel p-5 lg:col-span-2">
              <h2 className="hud-label mb-4 text-primary">Today</h2>
              <ul className="space-y-2">
                {todayEv.length === 0 && <li className="text-sm text-muted-foreground">Nothing scheduled.</li>}
                {todayEv.map((e) => (
                  <li key={e.id} className="flex items-center gap-4 rounded-md bg-muted/60 px-3 py-2">
                    <span className="w-20 font-mono text-sm text-primary">{fmtTime(e.time)}</span>
                    <span className={`h-2 w-2 rounded-full ${catColor[e.category]}`} />
                    <span>{e.title}</span>
                  </li>
                ))}
              </ul>
              {tomEv.length > 0 && (
                <>
                  <h3 className="hud-label mb-2 mt-5">Tomorrow</h3>
                  {tomEv.map((e) => <div key={e.id} className="text-sm text-accent">{e.title}</div>)}
                </>
              )}
            </div>
            <div className="panel p-5">
              <h2 className="hud-label mb-4 text-primary">My Goals</h2>
              <div className="space-y-4">
                {s.goals.map((g) => (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-sm"><span>{g.title}</span><span className="font-mono text-xs text-muted-foreground">{g.target === 100 ? `${g.current}%` : `${g.current} / ${g.target}`}</span></div>
                    <Bar value={(g.current / g.target) * 100} className="bg-accent" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
