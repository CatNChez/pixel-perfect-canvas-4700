import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Bar, PageHeader } from "@/components/Shell";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "My Team — CATty" },
      { name: "description", content: "Your robotics team: members, coach, competition, schedule and shared tasks." },
      { property: "og:title", content: "My Team — CATty" },
      { property: "og:description", content: "Your robotics team: members, coach, competition, schedule and shared tasks." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { s } = useStore();
  const p = s.profile;
  return (
    <div>
      <PageHeader kicker={`Team ${p.teamNumber || "—"} ${p.teamName ? "— " + p.teamName : ""}`} title="MY TEAM">
        <Link to="/profile" className="btn"><Pencil className="h-3.5 w-3.5" />Edit team</Link>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="hud-label">Team Number</div><div className="font-display text-4xl font-bold text-primary">{p.teamNumber || "—"}</div></div>
        <div className="panel p-5"><div className="hud-label">Coach</div><div className="font-display text-2xl font-semibold">{p.coach || "—"}</div></div>
        <div className="panel p-5"><div className="hud-label">Current Competition</div><div className="font-display text-xl font-semibold text-accent">{p.competition || "—"}</div></div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Team Members</div>
          <div className="flex items-center gap-3 border-b py-2"><Users className="h-4 w-4 text-primary" /><span className="flex-1">{s.username} (you)</span><span className="hud-label">{p.role}</span></div>
          {s.members.map((m, i) => <div key={i} className="flex items-center gap-3 border-b py-2 last:border-0"><Users className="h-4 w-4 text-primary" /><span className="flex-1">{m.name}</span><span className="hud-label">{m.role}</span></div>)}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Team Goals</div>
          {s.teamGoals.map((g, i) => <div key={i} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{g.title}</span><span className="font-mono text-xs">{g.pct}%</span></div><Bar value={g.pct} className="bg-accent" /></div>)}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Practice Schedule</div>
          {s.schedule.map((x, i) => <div key={i} className="flex justify-between py-1 font-mono text-sm"><span>{x.day}</span><span className="text-muted-foreground">{x.time}</span></div>)}
        </div>
      </div>
    </div>
  );
}
