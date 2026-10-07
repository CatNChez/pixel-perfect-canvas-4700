import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CATty Robotics" },
      { name: "description", content: "Log in or create your CATty robotics account to code, practice and track your progress." },
      { property: "og:title", content: "Log in — CATty Robotics" },
      { property: "og:description", content: "Log in or create your CATty robotics account." },
    ],
  }),
  component: LoginPage,
});

/** "1234" (no @) becomes the internal test-account address. */
const toEmail = (id: string) => (id.includes("@") ? id.trim().toLowerCase() : `${id.trim().toLowerCase()}@catty.local`);

function LoginPage() {
  const { s, loaded } = useStore();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (loaded && s.user) navigate({ to: "/dashboard" }); }, [loaded, s.user, navigate]);

  const submit = async () => {
    setErr(""); if (!id || !pw) return setErr("Enter your email and password.");
    setBusy(true);
    const email = toEmail(id);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (!error) { setBusy(false); return navigate({ to: "/dashboard" }); }
    // Not signed in: maybe a brand-new account — try to create it with this password.
    const up = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (up.error) {
      const m = up.error.message.toLowerCase();
      if (m.includes("already") || m.includes("registered")) return setErr("Wrong password for this account.");
      if (m.includes("password")) return setErr("New accounts need a password of at least 6 characters.");
      return setErr(up.error.message);
    }
    if (!up.data.session) return setErr("Account created — check your email to confirm, then log in.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form className="panel glow w-full max-w-sm space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Link to="/" className="flex items-center gap-2"><Cpu className="h-6 w-6 text-primary" /><span className="font-display text-xl font-bold tracking-widest">CATty</span></Link>
        <h1 className="font-display text-2xl font-bold">Log in or sign up</h1>
        <input className="field w-full" placeholder="Email (Gmail)" autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} />
        <input className="field w-full" type="password" placeholder="Password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center"><LogIn className="h-4 w-4" />{busy ? "Please wait…" : "Continue"}</button>
        <p className="text-center text-xs text-muted-foreground">New here? Enter your email and pick a password — your account is created and that password is locked to it.</p>
      </form>
    </div>
  );
}
