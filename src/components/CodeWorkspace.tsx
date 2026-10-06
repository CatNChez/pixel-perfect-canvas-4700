import { useEffect, useRef, useState } from "react";
import { Copy, CopyPlus, Download, FolderOpen, History, Play, Plus, RotateCcw, Save, Send, Trash2, Upload, Usb, Unplug, Cpu } from "lucide-react";
import { Bar } from "@/components/Shell";
import { CodeEditor } from "@/components/CodeEditor";
import { LANGS, LANG_IDS, starter, type Lang } from "@/lib/langs";
import { runCode, downloadText } from "@/lib/runner";
import { BrainLink, serialSupported } from "@/lib/brain";
import { timeAgo, useStore, withSaved, type Challenge } from "@/lib/store";

const FOLDERS = ["All", "Competition", "Practice", "Autonomous", "Experiments", "School"];

const guessLang = (name: string, text: string): Lang => {
  if (/\.py$/i.test(name)) return /from vex import|import vex/.test(text) ? "vexpy" : "python";
  if (/lemlib|pros\/|"main\.h"|pros::/.test(text)) return "pros";
  if (/"vex\.h"|using namespace vex/.test(text)) return "vexcpp";
  return "cpp";
};

export function CodeWorkspace({ challenge, onClearChallenge, showProjects = true }: { challenge: Challenge | null; onClearChallenge: () => void; showProjects?: boolean }) {
  const { s, set, uid } = useStore();
  const [activeId, setActiveId] = useState<string>("");
  const active = s.projects.find((p) => p.id === activeId);
  const lang: Lang = active?.lang ?? s.lang;
  const [draft, setDraft] = useState(starter(s.lang));
  const [output, setOutput] = useState("> Console ready.");
  const [busy, setBusy] = useState(false);
  const [folder, setFolder] = useState("All");
  const [showHist, setShowHist] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const brain = useRef(new BrainLink());
  const [connected, setConnected] = useState(false);
  const [term, setTerm] = useState("");
  const log = (m: string) => setOutput((o) => o + "\n> " + m);

  useEffect(() => {
    if (!challenge) return;
    setActiveId("");
    const c = LANGS[s.lang].family === "py" ? "#" : "//";
    setDraft(`${c} Challenge: ${challenge.text}\n` + starter(s.lang));
    setOutput("> Challenge loaded. Write code, then SUBMIT.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id]);

  const setLang = (l: Lang) => {
    const isStarter = LANG_IDS.some((x) => starter(x) === draft) || !draft.trim();
    if (active) {
      if (!confirm(`Change "${active.name}" to ${LANGS[l].label}?`)) return;
      set((st) => ({ ...st, lang: l, projects: st.projects.map((p) => (p.id === active.id ? { ...p, lang: l } : p)) }));
    } else set((st) => ({ ...st, lang: l }));
    if (isStarter || confirm(`Load the ${LANGS[l].label} starter code? (Python and C++ code are different — your current code won't run in ${LANGS[l].label}.)`)) setDraft(starter(l));
  };

  const open = (id: string) => { const p = s.projects.find((x) => x.id === id); if (p) { setActiveId(id); setDraft(p.code); setOutput("> Opened " + p.name); onClearChallenge(); } };
  const save = () => {
    if (!active) return saveAs();
    set((st) => ({ ...st, projects: st.projects.map((p) => (p.id === active.id ? withSaved(p, draft) : p)) }));
    log(`Saved "${active.name}" (previous version kept in History).`);
  };
  const saveAs = (name = prompt("Project name?") ?? "") => {
    if (!name) return;
    const p = { id: uid(), name, lang, folder: folder === "All" ? "Practice" : folder, code: draft, progress: 0, updated: Date.now(), history: [] };
    set((st) => ({ ...st, projects: [p, ...st.projects] }));
    setActiveId(p.id); log(`Saved as "${name}".`);
  };
  const run = async () => {
    setBusy(true);
    setOutput(LANGS[lang].family === "py" ? "> Running... (first run loads Python, a few seconds)" : "> Compiling...");
    setOutput(await runCode(draft, lang));
    setBusy(false);
  };
  const submit = () => {
    if (!challenge) return;
    let ok = false; try { ok = new RegExp(challenge.keyword, "i").test(draft); } catch { ok = draft.toLowerCase().includes(challenge.keyword.toLowerCase()); }
    if (ok) {
      set((st) => ({ ...st, completedChallenges: Array.from(new Set([...st.completedChallenges, challenge.id])) }));
      setOutput(`> Challenge "${challenge.level}" PASSED ✔  +${challenge.points} pts`);
    } else setOutput(`> Not quite. Hint: your code should address "${challenge.text}"`);
  };
  const importFile = async (f: File) => {
    const text = await f.text(); const l = guessLang(f.name, text);
    const p = { id: uid(), name: f.name.replace(/\.[^.]+$/, ""), lang: l, folder: folder === "All" ? "Practice" : folder, code: text, progress: 0, updated: Date.now(), history: [] };
    set((st) => ({ ...st, lang: l, projects: [p, ...st.projects] }));
    setActiveId(p.id); setDraft(text); log(`Imported ${f.name} as ${LANGS[l].label}.`);
  };
  const exportFile = () => {
    const base = (active?.name ?? (challenge ? `challenge_${challenge.id}` : "main")).replace(/\s+/g, "_");
    downloadText(lang === "pros" ? "main.cpp" : base + LANGS[lang].ext, draft);
    log("Exported " + (lang === "pros" ? "main.cpp (put it in your PROS project's src/ folder)" : base + LANGS[lang].ext));
  };
  const connect = async () => {
    try {
      await brain.current.connect((d) => setTerm((t) => (t + d).slice(-4000)));
      setConnected(true); log("V5 Brain connected over USB.");
    } catch (e) { log("Brain not connected: " + (e as Error).message); }
  };
  const disconnect = async () => { await brain.current.disconnect(); setConnected(false); log("Brain disconnected."); };
  const sendToBrain = async () => {
    exportFile();
    if (connected) {
      try { await brain.current.send(draft + "\n"); log("Code sent to the brain terminal."); } catch (e) { log((e as Error).message); }
    }
    log(lang === "pros" ? "To flash: in your PROS project run `pros mu` (build + upload)." : lang === "vexpy" || lang === "vexcpp" ? "To flash: open the file in VEXcode V5 and press Download." : "Note: this is normal code — use VEX V5 Python, VEX V5 C++ or PROS to run on a brain.");
  };

  const list = s.projects.filter((p) => folder === "All" || p.folder === folder);

  return (
    <div className={`grid gap-4 ${showProjects ? "lg:grid-cols-[1fr_300px]" : ""}`}>
      <div className="panel flex min-w-0 flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="field" value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language">
            {LANG_IDS.map((l) => <option key={l} value={l}>{LANGS[l].label}</option>)}
          </select>
          <span className="font-mono text-sm text-primary">{challenge ? `challenge_${challenge.id}` : active?.name ?? "untitled"}{LANGS[lang].ext}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={run} disabled={busy}><Play className="h-3.5 w-3.5" />{busy ? "Running" : "Run"}</button>
            <button className="btn" onClick={save}><Save className="h-3.5 w-3.5" />Save</button>
            <button className="btn" onClick={() => saveAs()}><Plus className="h-3.5 w-3.5" />Save as</button>
            <button className="btn" onClick={() => setShowHist((v) => !v)} disabled={!active}><History className="h-3.5 w-3.5" />History</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" />Import</button>
            <button className="btn" onClick={exportFile}><Download className="h-3.5 w-3.5" />Export</button>
            <button className="btn" onClick={() => { setDraft(active?.code ?? starter(lang)); setOutput("> Reset."); }}><RotateCcw className="h-3.5 w-3.5" />Reset</button>
            <button className="btn" onClick={() => { void navigator.clipboard.writeText(draft); log("Copied."); }}><Copy className="h-3.5 w-3.5" /></button>
            {challenge && <button className="btn border-accent text-accent" onClick={submit}><Send className="h-3.5 w-3.5" />Submit</button>}
          </div>
          <input ref={fileRef} type="file" accept=".py,.cpp,.cc,.h,.hpp,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importFile(f); e.target.value = ""; }} />
        </div>
        <p className="text-xs text-muted-foreground">{LANGS[lang].hint}</p>
        {showHist && active && (
          <div className="rounded-md border bg-background p-2">
            <div className="hud-label mb-2">Previous versions of {active.name}</div>
            {(active.history ?? []).length === 0 && <div className="text-sm text-muted-foreground">No earlier versions yet — they appear each time you Save.</div>}
            <div className="max-h-40 space-y-1 overflow-auto">
              {(active.history ?? []).map((v, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-xs">
                  <span className="font-mono text-muted-foreground">{new Date(v.at).toLocaleString()}</span>
                  <span className="truncate font-mono">{v.code.split("\n").find((l) => l.trim()) ?? ""}</span>
                  <button className="btn ml-auto !py-0.5" onClick={() => { setDraft(v.code); log("Restored version from " + new Date(v.at).toLocaleString() + " (Save to keep it)."); }}>Restore</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="h-[440px]"><CodeEditor value={draft} onChange={setDraft} lang={lang} /></div>
        <pre className="max-h-64 min-h-28 overflow-auto rounded-md border bg-background p-3 font-mono text-xs text-success">{output}</pre>

        <div className="rounded-md border p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /><span className="hud-label">Robot Brain (V5)</span>
            <span className={`font-mono text-[11px] ${connected ? "text-success" : "text-muted-foreground"}`}>{connected ? "● CONNECTED" : "○ NOT CONNECTED"}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {connected
                ? <button className="btn" onClick={disconnect}><Unplug className="h-3.5 w-3.5" />Disconnect</button>
                : <button className="btn" onClick={connect} disabled={!serialSupported()} title={serialSupported() ? "" : "Use Chrome or Edge on a computer"}><Usb className="h-3.5 w-3.5" />Connect brain</button>}
              <button className="btn" onClick={sendToBrain}><Download className="h-3.5 w-3.5" />Export to brain</button>
              <button className="btn" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" />Import from robot file</button>
            </div>
          </div>
          {!serialSupported() && <p className="text-xs text-muted-foreground">USB brain connection needs Chrome or Edge on a computer.</p>}
          {connected && <pre className="max-h-32 overflow-auto rounded bg-background p-2 font-mono text-xs">{term || "Waiting for brain output…"}</pre>}
        </div>
      </div>

      {showProjects && (
        <div className="panel p-3">
          <div className="mb-3 flex items-center justify-between"><span className="hud-label">My Code Projects</span><button className="btn" onClick={() => { const n = prompt("Project name?"); if (n) { setDraft(starter(s.lang)); saveAs(n); setDraft(starter(s.lang)); } }}><Plus className="h-3.5 w-3.5" />New</button></div>
          <div className="mb-3 flex flex-wrap gap-1">
            {FOLDERS.map((f) => <button key={f} onClick={() => setFolder(f)} className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase ${folder === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>)}
          </div>
          <div className="max-h-[700px] space-y-2 overflow-auto">
            {list.map((p) => (
              <div key={p.id} className={`rounded-md border p-3 ${p.id === activeId ? "border-primary" : ""}`}>
                <div className="font-semibold">{p.name}</div>
                <div className="mb-2 font-mono text-[11px] text-muted-foreground">{LANGS[p.lang]?.label ?? p.lang} · {p.folder} · {timeAgo(p.updated)} · {(p.history ?? []).length} versions</div>
                <Bar value={p.progress} />
                <div className="mt-2 flex gap-1">
                  <button className="btn !px-2" onClick={() => open(p.id)} title="Open"><FolderOpen className="h-3.5 w-3.5" /></button>
                  <button className="btn !px-2" title="Duplicate" onClick={() => set((st) => ({ ...st, projects: [{ ...p, id: uid(), name: p.name + " copy", updated: Date.now(), history: [] }, ...st.projects] }))}><CopyPlus className="h-3.5 w-3.5" /></button>
                  <button className="btn !px-2" title="Export" onClick={() => downloadText(p.name.replace(/\s+/g, "_") + (LANGS[p.lang]?.ext ?? ".txt"), p.code)}><Download className="h-3.5 w-3.5" /></button>
                  <button className="btn !px-2 hover:!border-destructive hover:!text-destructive" title="Delete" onClick={() => { if (confirm(`Delete "${p.name}"?`)) set((st) => ({ ...st, projects: st.projects.filter((x) => x.id !== p.id) })); }}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-muted-foreground">No projects in this folder.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
