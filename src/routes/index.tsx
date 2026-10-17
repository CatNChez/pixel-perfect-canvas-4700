import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, Code2, FolderOpen, MapPin } from "lucide-react";
import { Logo, Wordmark } from "@/components/Brand";
import { ENVIRONMENTS } from "@/lib/docs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CATty — Make VEX V5 Robot Coding Easier" },
      { name: "description", content: "A free coding hub for VEX V5 robotics: write Python, C++ and PROS/LemLib code, follow guides, and keep your robot projects organized." },
      { property: "og:title", content: "CATty — Make VEX V5 Robot Coding Easier" },
      { property: "og:description", content: "Write VEX V5 Python, C++ and PROS/LemLib code, learn with guides, and organize robot projects." },
    ],
  }),
  component: Landing,
});

const TABS = [
  { id: "home", label: "Home" },
  { id: "who", label: "Who we are" },
  { id: "what", label: "What it does" },
  { id: "why", label: "Why we built it" },
  { id: "tools", label: "Coding tools" },
] as const;
type Tab = typeof TABS[number]["id"];

function Landing() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-3 z-30 mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-6xl items-center gap-2 rounded-full border bg-card/60 px-3 py-2 backdrop-blur-xl">
        <button onClick={() => setTab("home")} className="shrink-0"><Wordmark /></button>
        <nav className="mx-auto flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
          ))}
          <Link to="/docs" className="shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Docs</Link>
        </nav>
        <Link to="/login" className="btn btn-primary shrink-0">Log in</Link>
      </header>

      <main key={tab} className="rise mx-auto w-full max-w-5xl flex-1 px-4 py-16 md:py-24">
        {tab === "home" && (
          <section className="text-center">
            <Logo className="mx-auto h-20 w-20 drop-shadow-[0_0_30px_var(--primary)]" />
            <div className="hud-label mt-6 text-primary">VEX V5 Robotics · Oakville, Ontario</div>
            <h1 className="text-gradient mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">Robot code, made simple.</h1>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Write and test VEX V5 Python, C++ and PROS + LemLib code in your browser, learn with clear examples, and keep every project in one place.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn btn-primary px-5 py-2.5"><Code2 className="h-4 w-4" />Start coding</Link>
              <button onClick={() => setTab("tools")} className="btn px-5 py-2.5"><BookOpen className="h-4 w-4" />Explore languages</button>
              <Link to="/code" className="btn px-5 py-2.5"><FolderOpen className="h-4 w-4" />Open my projects</Link>
            </div>
            <div className="panel mx-auto mt-14 max-w-2xl overflow-hidden text-left">
              <div className="flex gap-1.5 border-b px-4 py-2.5"><span className="h-2.5 w-2.5 rounded-full bg-destructive/70" /><span className="h-2.5 w-2.5 rounded-full bg-warning/70" /><span className="h-2.5 w-2.5 rounded-full bg-success/70" /><span className="ml-3 font-mono text-xs text-muted-foreground">src/main.cpp — PROS + LemLib</span></div>
              <pre className="overflow-x-auto p-5 font-mono text-sm leading-6"><span className="text-syn-com">// drive 24 inches, then turn to face 90°</span>{"\n"}<span className="text-syn-key">void</span> autonomous() {"{"}{"\n"}  chassis.setPose(<span className="text-syn-num">0</span>, <span className="text-syn-num">0</span>, <span className="text-syn-num">0</span>);{"\n"}  chassis.moveToPoint(<span className="text-syn-num">0</span>, <span className="text-syn-num">24</span>, <span className="text-syn-num">2000</span>);{"\n"}  chassis.turnToHeading(<span className="text-syn-num">90</span>, <span className="text-syn-num">1000</span>);{"\n"}{"}"}</pre>
            </div>
          </section>
        )}
        {tab === "who" && <Info title="Who we are" body={["CATty is a small group of VEX V5 students, coaches and competitors from Oakville, Ontario.", "We've spent seasons fighting with port numbers, gear ratios and confusing compiler errors — so we're building the tool we wished we had when we started."]} />}
        {tab === "what" && <Info title="What it does" body={["A browser workspace for robot code: pick a language, start from a working template, run it, and save versions as you go.", "Normal Python runs in your browser. Normal C++ is compiled by a real online compiler. VEX and PROS code is compiled for real against a practice robot so you see every move it would make — then you export the file and load it with VEXcode or PROS.", "Plus guides, ready-made examples, a ports reference, notes, tasks and a team calendar."]} />}
        {tab === "why" && <Info title="Why we built it" body={["Getting a robot to drive straight shouldn't require hunting through five websites.", "New members get stuck choosing between Blocks, Python, C++ and PROS, and copy code that only works in a different tool. CATty explains which tool each example is for and keeps beginners and competition programmers moving."]} />}
        {tab === "tools" && (
          <section>
            <h2 className="font-display text-3xl font-semibold">Coding tools</h2>
            <p className="mt-2 text-muted-foreground">Five real ways to program a VEX V5 robot. They are not interchangeable.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ENVIRONMENTS.map((e, i) => (
                <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="panel rise group p-5 transition hover:-translate-y-1 hover:border-primary" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between"><span className="hud-label text-primary">{e.level}</span><span className="text-xs text-muted-foreground">{e.official ? "Official VEX" : "Third-party"}</span></div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{e.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">Official site <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-card/40 p-6 text-center text-sm text-muted-foreground backdrop-blur">
        <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />Oakville, Ontario</span> · <Link to="/docs" className="hover:text-primary">Documentation</Link> · Not affiliated with VEX Robotics or Purdue SIGBots.
      </footer>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string[] }) {
  return (
    <section className="panel mx-auto max-w-2xl p-8 md:p-10">
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-4 text-muted-foreground">{body.map((b) => <p key={b}>{b}</p>)}</div>
    </section>
  );
}
