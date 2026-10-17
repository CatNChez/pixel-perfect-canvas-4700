import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "@/components/ProfileForm";
import { Logo, Wordmark } from "@/components/Brand";
import type { ReactNode } from "react";
import { LogOut, UserCog, Bot, Calendar, CheckSquare, Code2, Gauge, Home, NotebookPen, Users, BookOpen, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/code", label: "Code", icon: Code2 },
  { to: "/docs", label: "Docs", icon: BookOpen },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/progress", label: "Progress", icon: Gauge },
  { to: "/robots", label: "Robots", icon: Bot },
  { to: "/team", label: "Team", icon: Users },
  { to: "/profile", label: "Profile", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const ALWAYS = ["/dashboard", "/code", "/docs", "/settings"];

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { s, loaded } = useStore();
  const { p, setP } = usePrefs();
  const navigate = useNavigate();
  if (path === "/" || path === "/login") return <>{children}</>;
  if (!loaded) return <div className="flex min-h-screen items-center justify-center"><Logo className="h-12 w-12 animate-pulse" /></div>;
  if (!s.user && path === "/docs") return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between"><Link to="/"><Wordmark /></Link><Link to="/login" className="btn btn-primary">Log in</Link></div>
      {children}
    </div>
  );
  if (!s.user) return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="panel rise max-w-sm space-y-4 p-8 text-center">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="font-display text-2xl font-semibold">Please log in</h1>
        <p className="text-sm text-muted-foreground">Log in to open your coding workspace.</p>
        <Link to="/login" className="btn btn-primary justify-center">Log in</Link>
      </div>
    </div>
  );
  if (!s.onboarded) return <main className="mx-auto w-full max-w-5xl p-4 md:p-8"><ProfileForm onboarding /></main>;
  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); };
  const nav = NAV.filter((n) => ALWAYS.includes(n.to) || !p.hiddenNav.includes(n.to));
  const pad = p.density === "compact" ? "p-3 md:p-5" : "p-4 md:p-8";

  if (p.layout === "curved") return (
    <div className="min-h-screen">
      <header className="sticky top-3 z-30 mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-6xl items-center gap-3 rounded-full border bg-card/70 px-3 py-2 backdrop-blur-xl">
        <Link to="/dashboard" className="shrink-0 pl-1"><Wordmark /></Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-primary" }}>
              <n.icon className="h-4 w-4" /><span className="hidden lg:inline">{n.label}</span>
            </Link>
          ))}
        </nav>
        <button className="btn shrink-0" onClick={logout} aria-label="Log out"><LogOut className="h-4 w-4" /></button>
      </header>
      <main key={path} className={`rise mx-auto w-full max-w-6xl ${pad}`}>{children}</main>
    </div>
  );

  const col = p.sidebarCollapsed;
  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card/70 p-3 backdrop-blur-xl transition-all md:flex ${col ? "w-16" : "w-56"}`}>
        <div className="mb-6 flex items-center justify-between px-1">
          {col ? <Logo /> : <Wordmark />}
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} title={n.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-primary" }}>
              <n.icon className="h-4 w-4 shrink-0" />{!col && n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <button className="btn w-full justify-center" onClick={() => setP({ sidebarCollapsed: !col })} aria-label="Toggle sidebar">
            {col ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" />Collapse</>}
          </button>
          {!col && <div className="truncate px-1 text-xs text-muted-foreground">{s.user}</div>}
          <button className="btn w-full justify-center" onClick={logout}><LogOut className="h-4 w-4" />{!col && "Log out"}</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex gap-1 overflow-x-auto border-b bg-card/70 p-2 backdrop-blur md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="btn shrink-0" activeProps={{ className: "!text-primary !border-primary" }}>
              <n.icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          ))}
        </nav>
        <main key={path} className={`rise mx-auto w-full max-w-7xl flex-1 ${pad}`}>{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="hud-label text-primary">{kicker}</div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
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
