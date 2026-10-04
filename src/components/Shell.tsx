import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bot, Calendar, CheckSquare, Code2, Gauge, LayoutDashboard, NotebookPen, Users, Cpu } from "lucide-react";

const NAV = [
  { to: "/", label: "Command", icon: LayoutDashboard },
  { to: "/code", label: "Code", icon: Code2 },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/progress", label: "Progress", icon: Gauge },
  { to: "/robots", label: "Robots", icon: Bot },
  { to: "/team", label: "Team", icon: Users },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r bg-card/60 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold tracking-widest">CATty</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary !text-primary border-l-2 border-primary" }}>
              <n.icon className="h-4 w-4" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hud-label">SYS ONLINE ● v1.0</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex gap-1 overflow-x-auto border-b bg-card/60 p-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="btn shrink-0" activeProps={{ className: "!text-primary !border-primary" }}>
              <n.icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="hud-label text-primary">{kicker}</div>
        <h1 className="font-display text-3xl font-bold tracking-wide md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Bar({ value, className = "bg-primary" }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`bar-anim h-full rounded-full ${className}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
