import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
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

const MEMBERS = [["Alan", "Programmer"], ["Priya", "Driver"], ["Marcus", "Builder"], ["Sofia", "CAD & Notebook"]];

function TeamPage() {
  return (
    <div>
      <PageHeader kicker="Team 1234C — Circuit Cats" title="MY TEAM" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="hud-label">Team Number</div><div className="font-display text-4xl font-bold text-primary">1234C</div></div>
        <div className="panel p-5"><div className="hud-label">Coach</div><div className="font-display text-2xl font-semibold">Ms. Rivera</div></div>
        <div className="panel p-5"><div className="hud-label">Current Competition</div><div className="font-display text-xl font-semibold text-accent">Regional Qualifier</div></div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Team Members</div>
          {MEMBERS.map(([n, r]) => <div key={n} className="flex items-center gap-3 border-b py-2 last:border-0"><Users className="h-4 w-4 text-primary" /><span className="flex-1">{n}</span><span className="hud-label">{r}</span></div>)}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Team Goals</div>
          {[["Qualify for State", 60], ["Auton win point every match", 45], ["Finish engineering notebook", 80]].map(([g, v]) => <div key={g} className="mb-3"><div className="mb-1 text-sm">{g}</div><Bar value={v as number} className="bg-accent" /></div>)}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Practice Schedule</div>
          {[["Mon", "4–6 PM"], ["Wed", "4–6 PM"], ["Sat", "10 AM–2 PM"]].map(([d, t]) => <div key={d} className="flex justify-between py-1 font-mono text-sm"><span>{d}</span><span className="text-muted-foreground">{t}</span></div>)}
        </div>
        <div className="panel p-5">
          <div className="hud-label mb-3 text-primary">Team Tasks & Notes</div>
          <ul className="space-y-1 text-sm">
            <li>☐ Rebuild intake roller — Marcus</li><li>☐ Tune turn PID — Alan</li><li>☑ Order spare motors — Sofia</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Real team collaboration arrives once accounts are added.</p>
        </div>
      </div>
    </div>
  );
}
