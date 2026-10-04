import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "python" | "cpp";
export type Category = "learning" | "coding" | "robotics" | "competition" | "homework" | "team" | "build";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task { id: string; title: string; due: string; priority: Priority; category: Category; done: boolean }
export interface Note { id: string; title: string; body: string; tags: string[]; folder: string; pinned: boolean; updated: number }
export interface Event { id: string; title: string; date: string; time: string; description: string; category: Category; reminder: string }
export interface Project { id: string; name: string; lang: Lang; folder: string; code: string; progress: number; updated: number }
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

const PY_STARTER = `# Drivetrain test
motor_speed = 75

def drive(speed, seconds):
    for t in range(seconds):
        print(f"t={t}s  left={speed}%  right={speed}%")

print("Robot ready!")
drive(motor_speed, 3)
`;
const CPP_STARTER = `// Autonomous routine
#include "vex.h"
using namespace vex;

int main() {
  int motorSpeed = 75;
  LeftDrive.spin(forward, motorSpeed, percent);
  RightDrive.spin(forward, motorSpeed, percent);
  wait(2, seconds);
  Drivetrain.turnFor(right, 90, degrees);
  return 0;
}
`;
export const starter = (l: Lang) => (l === "python" ? PY_STARTER : CPP_STARTER);

interface State {
  username: string; lang: Lang;
  tasks: Task[]; notes: Note[]; events: Event[]; projects: Project[]; goals: Goal[]; robots: Robot[];
  completedChallenges: string[];
}

const initial: State = {
  username: "Alan", lang: "python",
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
    { id: uid(), name: "Autonomous Routine", lang: "cpp", folder: "Autonomous", code: CPP_STARTER, progress: 55, updated: ago(26) },
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

const Ctx = createContext<{ s: State; set: (fn: (s: State) => State) => void; uid: () => string } | null>(null);
const KEY = "catty-dashboard-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setS({ ...initial, ...JSON.parse(raw) }); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, loaded]);
  return <Ctx.Provider value={{ s, set: setS, uid }}>{children}</Ctx.Provider>;
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
export const fmtTime = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
