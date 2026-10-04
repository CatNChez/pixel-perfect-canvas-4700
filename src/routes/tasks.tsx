import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { CATEGORIES, catColor, todayStr, useStore, type Category, type Priority } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — CATty" },
      { name: "description", content: "Your robotics to-do list with priorities and due dates." },
      { property: "og:title", content: "My Tasks — CATty" },
      { property: "og:description", content: "Your robotics to-do list with priorities and due dates." },
    ],
  }),
  component: TasksPage,
});

const PRI: Record<Priority, string> = { LOW: "text-muted-foreground border-muted-foreground/40", MEDIUM: "text-cat-coding border-cat-coding/50", HIGH: "text-warning border-warning/50", URGENT: "text-destructive border-destructive/60" };

function TasksPage() {
  const { s, set, uid } = useStore();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(todayStr());
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [category, setCategory] = useState<Category>("robotics");
  const [popped, setPopped] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");

  const add = () => { if (!title.trim()) return; set((st) => ({ ...st, tasks: [{ id: uid(), title, due, priority, category, done: false }, ...st.tasks] })); setTitle(""); };
  const toggle = (id: string) => { setPopped(id); set((st) => ({ ...st, tasks: st.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })); setTimeout(() => setPopped(null), 500); };
  const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const list = s.tasks.filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done)).sort((a, b) => Number(a.done) - Number(b.done) || order[a.priority] - order[b.priority] || a.due.localeCompare(b.due));

  return (
    <div>
      <PageHeader kicker="To-do" title="TASKS">
        <div className="flex gap-2">{(["open", "done", "all"] as const).map((f) => <button key={f} className={`btn ${filter === f ? "btn-primary" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      </PageHeader>
      <div className="panel mb-4 flex flex-wrap gap-2 p-3">
        <input className="field min-w-48 flex-1" placeholder="New task..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} />
        <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>{(Object.keys(PRI) as Priority[]).map((p) => <option key={p}>{p}</option>)}</select>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>{(Object.keys(CATEGORIES) as Category[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].emoji} {CATEGORIES[c].label}</option>)}</select>
        <button className="btn btn-primary" onClick={add}><Plus className="h-3.5 w-3.5" />Add Task</button>
      </div>
      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className={`panel flex items-center gap-3 px-4 py-3 transition ${popped === t.id ? "check-pop" : ""} ${t.done ? "opacity-50" : ""}`}>
            <button onClick={() => toggle(t.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${t.done ? "border-success bg-success" : "border-primary"}`}>
              {t.done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
            </button>
            <span className={`flex-1 ${t.done ? "line-through" : ""}`}>{t.title}</span>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><span className={`h-2 w-2 rounded-full ${catColor[t.category]}`} />{CATEGORIES[t.category].label}</span>
            <span className="font-mono text-xs text-muted-foreground">{new Date(t.due + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <span className={`rounded border px-1.5 font-mono text-[10px] ${PRI[t.priority]}`}>{t.priority}</span>
            <button onClick={() => set((st) => ({ ...st, tasks: st.tasks.filter((x) => x.id !== t.id) }))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted-foreground">All clear. 🎉</div>}
      </div>
    </div>
  );
}
