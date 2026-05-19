import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { Shield, Mail, Lock, Loader2, UserCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign In — CyberMind AI" }] }),
});

function AuthPage() {
  const { tr } = useLang();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, enterGuest } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/analyzer" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Email and password (min 6 chars) required");
      return;
    }
    setLoading(true);
    const fn = mode === "signin" ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else if (mode === "signup") toast.success("Account created. You're in.");
  };

  const google = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { toast.error(error); setLoading(false); }
  };

  const guest = () => { enterGuest(); navigate({ to: "/analyzer" }); };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-20 start-1/4 w-96 h-96 bg-cyber-cyan/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md glass rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Shield className="w-14 h-14 text-cyber-cyan" strokeWidth={1.4} />
            <div className="absolute inset-0 blur-xl bg-cyber-cyan/40" />
          </div>
          <h1 className="display text-3xl font-bold text-gradient">{tr("auth_welcome")}</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">{tr("auth_welcome_sub")}</p>
        </div>

        <button
          onClick={google}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition disabled:opacity-50 mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          {tr("auth_google")}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{tr("auth_or")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="email" placeholder={tr("auth_email")} value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full ps-10 pe-3 py-3 rounded-xl bg-input/40 border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan transition" />
          </div>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" placeholder={tr("auth_password")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full ps-10 pe-3 py-3 rounded-xl bg-input/40 border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-cyber text-primary-foreground font-semibold glow-cyan hover:scale-[1.01] transition disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "signin" ? tr("auth_login") : tr("auth_signup")}
          </button>
        </form>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-sm text-cyber-cyan hover:text-cyber-blue mt-4 transition">
          {mode === "signin" ? tr("auth_no_account") : tr("auth_have_account")}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={guest}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-cyber-cyan/60 text-sm transition">
          <UserCircle className="w-4 h-4" /> {tr("auth_guest")}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          <Link to="/" className="hover:text-cyber-cyan">← Back home</Link>
        </p>
      </div>
    </div>
  );
}
