import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { CATEGORIES, catColor, fmtTime, todayStr, useStore, type Category, type Event } from "@/lib/store";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — CATty" },
      { name: "description", content: "Schedule practice, coding sessions, competitions and deadlines." },
      { property: "og:title", content: "Calendar — CATty" },
      { property: "og:description", content: "Schedule practice, coding sessions, competitions and deadlines." },
    ],
  }),
  component: CalendarPage,
});

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
type View = "month" | "week" | "day";

function CalendarPage() {
  const { s, set, uid } = useStore();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [form, setForm] = useState<Event | null>(null);
  const today = todayStr();

  const shift = (n: number) => { const d = new Date(cursor); if (view === "month") d.setMonth(d.getMonth() + n); else d.setDate(d.getDate() + n * (view === "week" ? 7 : 1)); setCursor(d); };
  let days: Date[] = [];
  if (view === "month") {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  } else if (view === "week") {
    const start = new Date(cursor); start.setDate(cursor.getDate() - cursor.getDay());
    days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  } else days = [cursor];

  const evFor = (d: Date) => s.events.filter((e) => e.date === iso(d)).sort((a, b) => a.time.localeCompare(b.time));
  const newEv = (date: string) => setForm({ id: "", title: "", date, time: "16:00", description: "", category: "robotics", reminder: "15 min" });
  const saveEv = () => {
    if (!form || !form.title) return;
    set((st) => ({ ...st, events: form.id ? st.events.map((e) => (e.id === form.id ? form : e)) : [...st.events, { ...form, id: uid() }] }));
    setForm(null);
  };

  const title = view === "month" ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : view === "week" ? `Week of ${days[0]?.toLocaleDateString()}` : cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader kicker="Schedule" title="CALENDAR">
        <div className="flex flex-wrap gap-2">
          {(["month", "week", "day"] as View[]).map((v) => <button key={v} className={`btn ${view === v ? "btn-primary" : ""}`} onClick={() => setView(v)}>{v}</button>)}
          <button className="btn border-accent text-accent" onClick={() => newEv(iso(cursor))}><Plus className="h-3.5 w-3.5" />Event</button>
        </div>
      </PageHeader>

      <div className="mb-3 flex items-center gap-3">
        <button className="btn !px-2" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></button>
        <button className="btn !px-2" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></button>
        <button className="btn" onClick={() => setCursor(new Date())}>Today</button>
        <span className="font-display text-xl font-semibold">{title}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        {(Object.keys(CATEGORIES) as Category[]).map((c) => <span key={c} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${catColor[c]}`} />{CATEGORIES[c].emoji} {CATEGORIES[c].label}</span>)}
      </div>

      <div className={`grid gap-px overflow-hidden rounded-lg border bg-border ${view === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
        {view !== "day" && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="bg-card p-2 text-center hud-label">{d}</div>)}
        {days.map((d) => {
          const key = iso(d); const out = view === "month" && d.getMonth() !== cursor.getMonth();
          return (
            <div key={key} onDoubleClick={() => newEv(key)} className={`bg-card p-2 ${view === "month" ? "min-h-24" : "min-h-72"} ${out ? "opacity-40" : ""}`}>
              <div className={`mb-1 font-mono text-xs ${key === today ? "inline-block rounded bg-primary px-1.5 text-primary-foreground" : "text-muted-foreground"}`}>{d.getDate()}</div>
              <div className="space-y-1">
                {evFor(d).map((e) => (
                  <button key={e.id} onClick={() => setForm(e)} className="flex w-full items-center gap-1.5 truncate rounded bg-muted px-1.5 py-0.5 text-left text-xs hover:bg-secondary">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${catColor[e.category]}`} />
                    <span className="font-mono text-muted-foreground">{fmtTime(e.time).replace(":00", "")}</span><span className="truncate">{e.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 hud-label">Double-click a day to add an event</p>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setForm(null)}>
          <div className="panel glow w-full max-w-md space-y-3 bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><span className="hud-label text-primary">{form.id ? "Edit Event" : "New Event"}</span><button onClick={() => setForm(null)}><X className="h-4 w-4" /></button></div>
            <input className="field w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            <div className="flex gap-2"><input type="date" className="field flex-1" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /><input type="time" className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            <textarea className="field w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <select className="field flex-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                {(Object.keys(CATEGORIES) as Category[]).map((c) => <option key={c} value={c}>{CATEGORIES[c].emoji} {CATEGORIES[c].label}</option>)}
              </select>
              <select className="field" value={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.value })}>
                {["none", "15 min", "30 min", "1 hour", "1 day"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex justify-between">
              {form.id ? <button className="btn hover:!border-destructive hover:!text-destructive" onClick={() => { set((st) => ({ ...st, events: st.events.filter((e) => e.id !== form.id) })); setForm(null); }}><Trash2 className="h-3.5 w-3.5" /></button> : <span />}
              <button className="btn btn-primary" onClick={saveEv}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
