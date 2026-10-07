import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Code2, Cpu, MapPin, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CATty Robotics — VEX V5 Coding & Robotics in Oakville" },
      { name: "description", content: "CATty teaches VEX V5 robotics and coding (Python, C++, PROS) to students in Oakville, Ontario. Join a team, learn to code, compete." },
      { property: "og:title", content: "CATty Robotics — VEX V5 in Oakville, Canada" },
      { property: "og:description", content: "Learn robotics and coding with VEX V5 in Oakville. Teams, classes and competition coaching." },
    ],
  }),
  component: Landing,
});

const PLANS = [
  { name: "Learn to Code", price: "$49", per: "/month", items: ["Weekly coding class", "Python & C++ for robots", "Full dashboard access"] },
  { name: "Join a Team", price: "$129", per: "/month", items: ["2 build sessions a week", "VEX V5 robot & parts", "Competition coaching", "Everything in Learn to Code"], featured: true },
  { name: "Summer Camp", price: "$349", per: "/week", items: ["5 full days", "Build and program a robot", "Mini-tournament on Friday"] },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" /><span className="font-display text-xl font-bold tracking-widest">CATty</span></div>
        <Link to="/login" className="btn btn-primary">Log in</Link>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="hud-label text-primary">VEX V5 Robotics · Oakville, Canada</div>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold md:text-6xl">Build robots. Write real code. Compete.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">CATty is a robotics academy in Oakville, Ontario. We teach students to design, build and program VEX V5 robots — and to code in Python, C++ and PROS.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/login" className="btn btn-primary">Log in to dashboard</Link><a href="#pricing" className="btn">See pricing</a></div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {[
          { icon: Users, t: "Who we are", d: "Coaches and competitors who love robotics, teaching kids and teens in Oakville and the GTA." },
          { icon: Bot, t: "What we teach", d: "VEX V5 building, drivetrains, sensors, autonomous routines and competition strategy." },
          { icon: Code2, t: "Real coding", d: "Python, VEX V5 Python, C++, VEX V5 C++ and PROS with LemLib — right in your browser." },
        ].map((c) => (
          <div key={c.t} className="panel p-6"><c.icon className="h-7 w-7 text-primary" /><h2 className="mt-3 font-display text-xl font-semibold">{c.t}</h2><p className="mt-2 text-sm text-muted-foreground">{c.d}</p></div>
        ))}
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-bold">Pricing</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`panel flex flex-col p-6 ${p.featured ? "border-primary glow" : ""}`}>
              <div className="hud-label text-accent">{p.name}</div>
              <div className="mt-2 font-display text-4xl font-bold">{p.price}<span className="text-base text-muted-foreground">{p.per}</span></div>
              <ul className="mt-4 flex-1 space-y-2 text-sm">{p.items.map((i) => <li key={i}>✔ {i}</li>)}</ul>
              <Link to="/login" className={`btn mt-6 justify-center ${p.featured ? "btn-primary" : ""}`}>Join</Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Prices in CAD.</p>
      </section>

      <footer className="border-t p-6 text-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />Oakville, Ontario, Canada</span> · <Trophy className="inline h-4 w-4" /> VEX V5 Robotics
      </footer>
    </div>
  );
}
