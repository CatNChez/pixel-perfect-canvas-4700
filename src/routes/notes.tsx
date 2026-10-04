import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pin, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { timeAgo, useStore, type Note } from "@/lib/store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "My Notes — CATty" },
      { name: "description", content: "Create, tag, pin and search your robotics notes." },
      { property: "og:title", content: "My Notes — CATty" },
      { property: "og:description", content: "Create, tag, pin and search your robotics notes." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { s, set, uid } = useStore();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(s.notes[0]?.id ?? null);
  const tags = useMemo(() => Array.from(new Set(s.notes.flatMap((n) => n.tags))), [s.notes]);
  const list = s.notes
    .filter((n) => (!tag || n.tags.includes(tag)) && (n.title + n.body + n.tags.join(" ") + n.folder).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated - a.updated);
  const note = s.notes.find((n) => n.id === sel);
  const upd = (patch: Partial<Note>) => set((st) => ({ ...st, notes: st.notes.map((n) => (n.id === sel ? { ...n, ...patch, updated: Date.now() } : n)) }));

  return (
    <div>
      <PageHeader kicker="Knowledge Base" title="NOTES">
        <button className="btn btn-primary" onClick={() => { const n: Note = { id: uid(), title: "Untitled note", body: "", tags: [], folder: "General", pinned: false, updated: Date.now() }; set((st) => ({ ...st, notes: [n, ...st.notes] })); setSel(n.id); }}><Plus className="h-3.5 w-3.5" />New Note</button>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="panel p-3">
          <div className="relative mb-3"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><input className="field w-full pl-8" placeholder="Search my notes..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((t) => <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`rounded px-2 py-0.5 font-mono text-[11px] ${tag === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>#{t}</button>)}
          </div>
          <div className="space-y-1">
            {list.map((n) => (
              <button key={n.id} onClick={() => setSel(n.id)} className={`block w-full rounded-md px-3 py-2 text-left transition ${n.id === sel ? "bg-secondary border-l-2 border-primary" : "hover:bg-muted"}`}>
                <div className="flex items-center gap-2 font-semibold">{n.pinned && <Pin className="h-3 w-3 text-accent" />}{n.title}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{n.folder} · {timeAgo(n.updated)}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          {note ? (
            <div className="flex h-full flex-col gap-3">
              <div className="flex gap-2">
                <input className="field flex-1 font-display text-xl font-semibold" value={note.title} onChange={(e) => upd({ title: e.target.value })} />
                <button className={`btn ${note.pinned ? "!border-accent !text-accent" : ""}`} onClick={() => upd({ pinned: !note.pinned })}><Pin className="h-3.5 w-3.5" />{note.pinned ? "Pinned" : "Pin"}</button>
                <button className="btn hover:!border-destructive hover:!text-destructive" onClick={() => { set((st) => ({ ...st, notes: st.notes.filter((n) => n.id !== note.id) })); setSel(null); }}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex gap-2">
                <input className="field w-40" value={note.folder} onChange={(e) => upd({ folder: e.target.value })} placeholder="Folder" />
                <input className="field flex-1 font-mono" value={note.tags.map((t) => "#" + t).join(" ")} onChange={(e) => upd({ tags: e.target.value.split(/\s+/).map((t) => t.replace(/^#/, "")).filter(Boolean) })} placeholder="#tags" />
              </div>
              <textarea className="field min-h-[400px] flex-1 font-mono leading-6" value={note.body} onChange={(e) => upd({ body: e.target.value })} />
            </div>
          ) : <div className="text-muted-foreground">Select or create a note.</div>}
        </div>
      </div>
    </div>
  );
}
