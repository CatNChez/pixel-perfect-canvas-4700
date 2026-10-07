import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

import { starter, type Lang } from "./langs";
export type { Lang } from "./langs";
export { starter } from "./langs";
export type Category = "learning" | "coding" | "robotics" | "competition" | "homework" | "team" | "build";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task { id: string; title: string; due: string; priority: Priority; category: Category; done: boolean }
export interface Note { id: string; title: string; body: string; tags: string[]; folder: string; pinned: boolean; updated: number }
export interface Event { id: string; title: string; date: string; time: string; description: string; category: Category; reminder: string }
export interface Version { code: string; at: number }
export interface Project { id: string; name: string; lang: Lang; folder: string; code: string; progress: number; updated: number; history?: Version[] }
export interface Challenge { id: string; level: string; text: string; points: number; keyword: string }
export interface Goal { id: string; title: string; current: number; target: number }
export interface Robot { id: string; name: string; team: string; competition: string; drivetrain: string; motors: string; sensors: string; mechanisms: string; lang: Lang; notes: string }

export const CATEGORIES: Record<Category, { label: string; emoji: string }> = {
  learning: { label: "Learning", emoji: "🧠" },
  coding: { label: "Coding", emoji: "💻" },
  robotics: { label: "Robotics", emoji: "🤖" },
  competition: { label: "Competition", emoji: "🏆" },
  homework: { label: "Homework", emoji: "📚" },
  team: { label: "Team", emoji: "👥" },
  build: { label: "Build", emoji: "⚙️" },
};
export const catColor: Record<Category, string> = {
  learning: "bg-cat-learning", coding: "bg-cat-coding", robotics: "bg-cat-robotics",
  competition: "bg-cat-competition", homework: "bg-cat-homework", team: "bg-cat-team", build: "bg-cat-build",
};

const uid = () => Math.random().toString(36).slice(2, 10);
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const ago = (h: number) => Date.now() - h * 3600_000;

const PY_STARTER = starter("python");
const CPP_STARTER = starter("vexcpp");

interface State {
  username: string; lang: Lang; user: string | null; challenges: Challenge[];
  tasks: Task[]; notes: Note[]; events: Event[]; projects: Project[]; goals: Goal[]; robots: Robot[];
  completedChallenges: string[];
  onboarded: boolean;
  profile: { teamName: string; teamNumber: string; coach: string; role: string; competition: string; school: string };
  members: { name: string; role: string }[];
  teamGoals: { title: string; pct: number }[];
  schedule: { day: string; time: string }[];
  ratings: Record<string, number>;
  trackPct: Record<string, number>;
}
export type { State };

const initial: State = {
  username: "Alan", lang: "python", user: null, onboarded: false,
  profile: { teamName: "", teamNumber: "", coach: "", role: "Programmer", competition: "VEX V5", school: "" },
  members: [],
  teamGoals: [{ title: "Qualify for Provincials", pct: 30 }, { title: "Auton win point every match", pct: 20 }],
  schedule: [{ day: "Mon", time: "4–6 PM" }, { day: "Sat", time: "10 AM–2 PM" }],
  ratings: { robotics: 50, course: 50, coding: 50, competition: 50 },
  trackPct: { Robotics: 50, Programming: 50, CAD: 30, Autonomous: 30, Competition: 40 },
  challenges: [
    { id: "b1", level: "BEGINNER", text: "Make the drivetrain move forward.", points: 50, keyword: "forward|speed|drive" },
    { id: "i1", level: "INTERMEDIATE", text: "Make the robot turn exactly 90 degrees.", points: 120, keyword: "90" },
    { id: "a1", level: "ADVANCED", text: "Use a distance sensor to stop the robot at a specific distance.", points: 250, keyword: "distance" },
    { id: "e1", level: "EXPERT", text: "Create a fully autonomous scoring routine.", points: 500, keyword: "(auton|score)[\\s\\S]*(turn|drive)" },
  ],
  tasks: [
    { id: uid(), title: "Finish drivetrain lesson", due: day(0), priority: "HIGH", category: "learning", done: false },
    { id: uid(), title: "Complete Python challenge", due: day(1), priority: "MEDIUM", category: "coding", done: false },
    { id: uid(), title: "Test autonomous", due: day(2), priority: "URGENT", category: "robotics", done: false },
    { id: uid(), title: "Update CAD", due: day(3), priority: "LOW", category: "build", done: false },
    { id: uid(), title: "Practice driving", due: day(1), priority: "MEDIUM", category: "robotics", done: true },
    { id: uid(), title: "Meet robotics team", due: day(0), priority: "MEDIUM", category: "team", done: false },
    { id: uid(), title: "Submit assignment", due: day(5), priority: "HIGH", category: "homework", done: false },
  ],
  notes: [
    { id: uid(), title: "PID Notes", body: "P = proportional to error\nI = accumulates error over time\nD = reacts to rate of change\n\nStart with kP only, then add kD to dampen overshoot.", tags: ["coding", "autonomous", "math"], folder: "Programming", pinned: true, updated: ago(3) },
    { id: uid(), title: "V5 Motors", body: "Red cartridge 100 RPM (torque)\nGreen 200 RPM\nBlue 600 RPM (speed)", tags: ["v5"], folder: "Hardware", pinned: false, updated: ago(30) },
    { id: uid(), title: "Inertial Sensor", body: "Calibrate for 2s before auton. Use heading() for turns.", tags: ["sensors", "v5"], folder: "Hardware", pinned: false, updated: ago(50) },
    { id: uid(), title: "Python Functions", body: "def name(args):\n    return value", tags: ["coding"], folder: "Programming", pinned: false, updated: ago(80) },
    { id: uid(), title: "Competition Strategy", body: "Prioritize autonomous win point. Defend the left goal in endgame.", tags: ["competition"], folder: "Strategy", pinned: true, updated: ago(10) },
    { id: uid(), title: "CAD Ideas", body: "Try a 4-bar lift with rubber band assist.", tags: ["cad"], folder: "Build", pinned: false, updated: ago(120) },
  ],
  events: [
    { id: uid(), title: "Math homework", date: day(0), time: "09:00", description: "", category: "homework", reminder: "15 min" },
    { id: uid(), title: "Robotics practice", date: day(0), time: "16:00", description: "Drive practice + auton tuning", category: "robotics", reminder: "30 min" },
    { id: uid(), title: "Python lesson", date: day(0), time: "17:00", description: "", category: "coding", reminder: "none" },
    { id: uid(), title: "Team meeting", date: day(0), time: "19:00", description: "", category: "team", reminder: "15 min" },
    { id: uid(), title: "Autonomous assignment due", date: day(1), time: "23:59", description: "", category: "coding", reminder: "1 day" },
    { id: uid(), title: "CAD session", date: day(3), time: "15:00", description: "", category: "build", reminder: "none" },
    { id: uid(), title: "Regional Qualifier", date: day(9), time: "08:00", description: "Bring spare batteries", category: "competition", reminder: "1 day" },
  ],
  projects: [
    { id: uid(), name: "Drivetrain Test", lang: "python", folder: "Practice", code: PY_STARTER, progress: 80, updated: ago(2) },
    { id: uid(), name: "Autonomous Routine", lang: "vexcpp", folder: "Autonomous", code: CPP_STARTER, progress: 55, updated: ago(26) },
    { id: uid(), name: "Distance Sensor Challenge", lang: "python", folder: "Experiments", code: "distance = 300\nwhile distance > 100:\n    distance -= 50\n    print('Distance:', distance, 'mm')\nprint('STOP')\n", progress: 30, updated: ago(96) },
  ],
  goals: [
    { id: uid(), title: "Learn Python robotics programming", current: 64, target: 100 },
    { id: uid(), title: "Build my first autonomous routine", current: 40, target: 100 },
    { id: uid(), title: "Complete 20 coding challenges", current: 15, target: 20 },
    { id: uid(), title: "Become competition-ready", current: 72, target: 100 },
  ],
  robots: [
    { id: uid(), name: "Whisker", team: "1234C", competition: "VEX V5 — High Stakes", drivetrain: "6-motor tank, 360 RPM", motors: "8× V5 Smart Motor", sensors: "Inertial, Distance, Optical", mechanisms: "Intake, Mobile goal clamp", lang: "python", notes: "Clamp pneumatics leak after ~40 actuations." },
  ],
  completedChallenges: ["b1"],
};

const Ctx = createContext<{ s: State; set: (fn: (s: State) => State) => void; uid: () => string; loaded: boolean } | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    const load = async (id: string | null, email: string | null) => {
      ready.current = false;
      setUserId(id);
      if (!id || !email) { setS(initial); setLoaded(true); return; }
      const { data } = await supabase.from("user_data").select("data").eq("user_id", id).maybeSingle();
      const saved = (data?.data ?? null) as Partial<State> | null;
      const display = email.endsWith("@catty.local") ? email.split("@")[0]! : email.split("@")[0]!;
      setS(saved ? { ...initial, ...saved, user: email } : { ...initial, username: display, user: email });
      setLoaded(true);
      setTimeout(() => { ready.current = true; }, 0);
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null, data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load(session?.user.id ?? null, session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loaded || !userId || !ready.current) return;
    const t = setTimeout(() => {
      const { user: _u, ...data } = s;
      void supabase.from("user_data").upsert({ user_id: userId, data: data as never, updated_at: new Date().toISOString() });
    }, 800);
    return () => clearTimeout(t);
  }, [s, loaded, userId]);

  return <Ctx.Provider value={{ s, set: setS, uid, loaded }}>{children}</Ctx.Provider>;
}

/** Save code into a project, keeping the previous version in its history (max 25). */
export function withSaved(p: Project, code: string): Project {
  if (p.code === code) return p;
  return { ...p, code, updated: Date.now(), history: [{ code: p.code, at: p.updated }, ...(p.history ?? [])].slice(0, 25) };
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export function timeAgo(t: number) {
  const h = Math.round((Date.now() - t) / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const fmtTime = (t: string) => { const [h = 0, m = 0] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
