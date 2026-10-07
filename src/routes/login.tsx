import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Cpu, LogIn } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CATty Robotics" },
      { name: "description", content: "Log in to your CATty robotics dashboard to code, practice and track your progress." },
      { property: "og:title", content: "Log in — CATty Robotics" },
      { property: "og:description", content: "Log in to your CATty robotics dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { set } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const enter = (name: string) => { set((st) => ({ ...st, user: name })); navigate({ to: "/dashboard" }); };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="panel glow w-full max-w-sm space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); enter("Guest"); }}>
        <Link to="/" className="flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" /><span className="font-display text-xl font-bold tracking-widest">CATty</span></Link>
        <h1 className="font-display text-2xl font-bold">Log in</h1>
        <input className="field w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field w-full" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit" className="btn btn-primary w-full justify-center"><LogIn className="h-4 w-4" />Log in</button>
        <button type="button" className="btn w-full justify-center" onClick={() => enter("Guest")}>Continue as guest</button>
        <p className="text-center text-xs text-muted-foreground">Demo mode: every login opens the guest account for now.</p>
      </form>
    </div>
  );
}
