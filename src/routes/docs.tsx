import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/Shell";
import { ENVIRONMENTS, EXAMPLES, ERRORS, PORTS } from "@/lib/docs";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [
    { title: "VEX V5 Docs & Examples — CATty" },
    { name: "description", content: "Setup guides, labeled code examples, common errors and port references for VEXcode, VS Code and PROS + LemLib." },
    { property: "og:title", content: "VEX V5 Docs & Examples — CATty" },
    { property: "og:description", content: "Setup guides, examples and references for VEX V5 coding." },
  ] }),
  component: Docs,
});

function Docs() {
  const [q, setQ] = useState("");
  const m = (t: string) => t.toLowerCase().includes(q.toLowerCase());
  const ex = EXAMPLES.filter((e) => m(e.title + e.topic + e.env + e.code));
  return (
    <div>
      <PageHeader kicker="Learn" title="Documentation">
        <input className="field w-64" placeholder="Search docs…" value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>
      <h2 className="hud-label mb-3">Environments — setup</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ENVIRONMENTS.filter((e) => m(e.name + e.summary)).map((e) => (
          <div key={e.id} className="panel p-5">
            <div className="flex justify-between"><span className="hud-label text-primary">{e.level}</span><span className="text-xs text-muted-foreground">{e.official ? "Official VEX" : "Third-party"}</span></div>
            <h3 className="mt-1 font-display text-lg font-semibold">{e.name}</h3>
            <p className="text-sm text-muted-foreground">{e.summary}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{e.setup.map((s) => <li key={s}>{s}</li>)}</ol>
            <a className="mt-3 inline-block text-sm text-primary" href={e.url} target="_blank" rel="noreferrer">Official docs →</a>
          </div>
        ))}
      </div>
      <h2 className="hud-label mb-3 mt-8">Examples (each works only in its labeled environment)</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ex.map((e) => (
          <div key={e.id} className="panel overflow-hidden">
            <div className="flex justify-between border-b px-4 py-2 text-sm"><span>{e.topic} · {e.title}</span><span className="text-primary">{e.env}</span></div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">{e.code}</pre>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-5"><h2 className="hud-label mb-3">Common mistakes</h2>{ERRORS.filter((e) => m(e.err + e.fix)).map((e) => <div key={e.err} className="mb-3 text-sm"><div className="font-semibold">{e.err}</div><div className="text-muted-foreground">{e.fix}</div></div>)}</div>
        <div className="panel p-5"><h2 className="hud-label mb-3">Ports & reference</h2>{PORTS.map(([a, b]) => <div key={a} className="mb-2 text-sm"><span className="font-semibold">{a}:</span> <span className="text-muted-foreground">{b}</span></div>)}</div>
      </div>
    </div>
  );
}
