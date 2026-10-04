import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, CopyPlus, FolderOpen, Play, RotateCcw, Save, Send, Trash2, Plus, Trophy, Check } from "lucide-react";
import { Bar, PageHeader } from "@/components/Shell";
import { CodeEditor, runPython } from "@/components/CodeEditor";
import { starter, timeAgo, useStore, type Lang } from "@/lib/store";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code Workspace — CATty" },
      { name: "description", content: "Write, run and save Python or C++ robot code, and take on coding challenges." },
      { property: "og:title", content: "Code Workspace — CATty" },
      { property: "og:description", content: "Write, run and save Python or C++ robot code, and take on coding challenges." },
    ],
  }),
  component: CodePage,
});

const FOLDERS = ["All", "Competition", "Practice", "Autonomous", "Experiments", "School"];

const CHALLENGES = [
  { id: "b1", level: "BEGINNER", text: "Make the drivetrain move forward.", points: 50, check: /forward|speed|drive/i, best: 100 },
  { id: "i1", level: "INTERMEDIATE", text: "Make the robot turn exactly 90 degrees.", points: 120, check: /90/, best: null },
  { id: "a1", level: "ADVANCED", text: "Use a distance sensor to stop the robot at a specific distance.", points: 250, check: /distance/i, best: null },
  { id: "e1", level: "EXPERT", text: "Create a fully autonomous scoring routine.", points: 500, check: /(auton|score)[\s\S]*(turn|drive)/i, best: null },
];

function CodePage() {
  const { s, set, uid } = useStore();
  const [activeId, setActiveId] = useState(s.projects[0]?.id ?? "");
  const active = s.projects.find((p) => p.id === activeId);
  const [draft, setDraft] = useState(active?.code ?? starter(s.lang));
  const [output, setOutput] = useState("> Console ready.");
  const [busy, setBusy] = useState(false);
  const [folder, setFolder] = useState("All");
  const [challenge, setChallenge] = useState<string | null>(null);
  const lang: Lang = active?.lang ?? s.lang;

  const open = (id: string) => { const p = s.projects.find((x) => x.id === id); if (p) { setActiveId(id); setDraft(p.code); setOutput("> Opened " + p.name); setChallenge(null); } };
  const save = () => {
    if (!active) return;
    set((st) => ({ ...st, projects: st.projects.map((p) => (p.id === active.id ? { ...p, code: draft, updated: Date.now() } : p)) }));
    setOutput((o) => o + "\n> Saved.");
  };
  const run = async () => {
    setBusy(true);
    if (lang === "python") {
      setOutput("> Running Python...\n(first run loads the runtime, a few seconds)");
      const out = await runPython(draft);
      setOutput("> python main.py\n" + out);
    } else {
      const prints = [...draft.matchAll(/(?:cout\s*<<\s*|printf\(\s*)"([^"]*)"/g)].map((m) => m[1]);
      setOutput("> g++ main.cpp (simulated)\nCompiled OK. C++ runs on your robot brain.\n" + (prints.length ? prints.join("\n") : "Robot executed routine."));
    }
    setBusy(false);
  };
  const newProject = () => {
    const name = prompt("Project name?"); if (!name) return;
    const p = { id: uid(), name, lang: s.lang, folder: folder === "All" ? "Practice" : folder, code: starter(s.lang), progress: 0, updated: Date.now() };
    set((st) => ({ ...st, projects: [p, ...st.projects] }));
    setActiveId(p.id); setDraft(p.code);
  };
  const submit = () => {
    const c = CHALLENGES.find((x) => x.id === challenge);
    if (!c) { save(); setOutput((o) => o + "\n> Submitted project for review."); return; }
    if (c.check.test(draft)) {
      set((st) => ({ ...st, completedChallenges: Array.from(new Set([...st.completedChallenges, c.id])) }));
      setOutput(`> Challenge "${c.level}" PASSED ✔  +${c.points} pts`);
    } else setOutput(`> Not quite. Hint: your code should address "${c.text}"`);
  };

  const list = s.projects.filter((p) => folder === "All" || p.folder === folder);

  return (
    <div>
      <PageHeader kicker="Workspace" title="CODE">
        <div className="panel flex items-center gap-3 px-3 py-2">
          <span className="hud-label">Current Language: <span className="text-primary">{s.lang === "python" ? "PYTHON" : "C++"}</span></span>
          {(["python", "cpp"] as Lang[]).map((l) => (
            <button key={l} onClick={() => set((st) => ({ ...st, lang: l }))} className={`btn ${s.lang === l ? "btn-primary" : ""}`}>{l === "python" ? "Python" : "C++"}</button>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="panel flex flex-col gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-primary">{challenge ? `challenge_${challenge}` : active?.name ?? "untitled"}{lang === "python" ? ".py" : ".cpp"}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={run} disabled={busy}><Play className="h-3.5 w-3.5" />{busy ? "Running" : "Run Code"}</button>
              <button className="btn" onClick={save}><Save className="h-3.5 w-3.5" />Save</button>
              <button className="btn" onClick={() => setDraft(active?.code ?? starter(lang))}><RotateCcw className="h-3.5 w-3.5" />Reset</button>
              <button className="btn" onClick={() => { navigator.clipboard.writeText(draft); setOutput((o) => o + "\n> Copied."); }}><Copy className="h-3.5 w-3.5" />Copy</button>
              <button className="btn border-accent text-accent" onClick={submit}><Send className="h-3.5 w-3.5" />Submit</button>
            </div>
          </div>
          <div className="h-[420px]"><CodeEditor value={draft} onChange={setDraft} lang={lang} /></div>
          <pre className="max-h-48 min-h-28 overflow-auto rounded-md border bg-background p-3 font-mono text-xs text-success">{output}</pre>
        </div>

        <div className="panel p-3">
          <div className="mb-3 flex items-center justify-between"><span className="hud-label">My Code Projects</span><button className="btn" onClick={newProject}><Plus className="h-3.5 w-3.5" />New</button></div>
          <div className="mb-3 flex flex-wrap gap-1">
            {FOLDERS.map((f) => <button key={f} onClick={() => setFolder(f)} className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase ${folder === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>)}
          </div>
          <div className="space-y-2">
            {list.map((p) => (
              <div key={p.id} className={`rounded-md border p-3 ${p.id === activeId ? "border-primary" : ""}`}>
                <div className="font-semibold">{p.name}</div>
                <div className="mb-2 font-mono text-[11px] text-muted-foreground">{p.lang === "python" ? "Python" : "C++"} · {p.folder} · Updated {timeAgo(p.updated)}</div>
                <Bar value={p.progress} />
                <div className="mt-2 flex gap-1">
                  <button className="btn !px-2" onClick={() => open(p.id)} title="Open"><FolderOpen className="h-3.5 w-3.5" /></button>
                  <button className="btn !px-2" title="Duplicate" onClick={() => set((st) => ({ ...st, projects: [{ ...p, id: uid(), name: p.name + " copy", updated: Date.now() }, ...st.projects] }))}><CopyPlus className="h-3.5 w-3.5" /></button>
                  <button className="btn !px-2 hover:!border-destructive hover:!text-destructive" title="Delete" onClick={() => set((st) => ({ ...st, projects: st.projects.filter((x) => x.id !== p.id) }))}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-muted-foreground">No projects in this folder.</div>}
          </div>
        </div>
      </div>

      <h2 className="hud-label mb-3 mt-8">Coding Challenges</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {CHALLENGES.map((c) => {
          const done = s.completedChallenges.includes(c.id);
          return (
            <div key={c.id} className={`panel flex flex-col p-4 ${challenge === c.id ? "border-accent" : ""}`}>
              <div className="flex items-center justify-between"><span className="hud-label text-accent">{c.level}</span>{done ? <Check className="h-4 w-4 text-success" /> : <Trophy className="h-4 w-4 text-muted-foreground" />}</div>
              <p className="my-3 flex-1">{c.text}</p>
              <div className="mb-3 grid grid-cols-2 gap-1 font-mono text-[11px] text-muted-foreground">
                <span>LANG: {s.lang === "python" ? "PY" : "C++"}</span><span>PTS: {c.points}</span>
                <span>BEST: {done ? c.best ?? 100 : "—"}</span><span className={done ? "text-success" : ""}>{done ? "COMPLETE" : "OPEN"}</span>
              </div>
              <button className="btn justify-center" onClick={() => { setChallenge(c.id); setDraft(s.lang === "python" ? `# ${c.text}\n` : `// ${c.text}\n`); setOutput(`> Challenge loaded. Write code, then SUBMIT.`); }}>Start</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
