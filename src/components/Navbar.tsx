import { Link } from "@tanstack/react-router";
import { Shield, Globe, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { lang, setLang, tr } = useLang();
  const { user, isGuest, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: tr("nav_home") },
    { to: "/analyzer", label: tr("nav_analyzer") },
    { to: "/url-scanner", label: tr("nav_url") },
    { to: "/dashboard", label: tr("nav_dashboard") },
    { to: "/news", label: tr("nav_news") },
    { to: "/about", label: tr("nav_about") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative">
            <Shield className="w-7 h-7 text-cyber-cyan" strokeWidth={1.5} />
            <div className="absolute inset-0 blur-md bg-cyber-cyan/40 group-hover:bg-cyber-cyan/70 transition" />
          </div>
          <span className="display text-lg font-bold text-gradient hidden sm:inline">{tr("brand")}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-md hover:bg-secondary/50"
              activeProps={{ className: "px-3 py-2 text-sm rounded-md text-cyber-cyan bg-secondary/60" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/60 hover:border-cyber-cyan/60 hover:glow-cyan text-sm transition">
            <Globe className="w-4 h-4" />
            <span className="font-mono hidden sm:inline">{tr("lang_toggle")}</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{user.email}</span>
              <button onClick={signOut} className="p-2 rounded-md border border-border/60 hover:border-destructive/60 transition" title={tr("auth_logout")}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isGuest ? (
            <Link to="/auth" className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-cyber text-primary-foreground text-sm font-semibold glow-cyan">
              {tr("auth_login")}
            </Link>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-cyber text-primary-foreground text-sm font-semibold glow-cyan">
              <UserIcon className="w-4 h-4" /> {tr("auth_login")}
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-md border border-border/60">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50"
                activeProps={{ className: "px-3 py-2 text-sm rounded-md text-cyber-cyan bg-secondary/60" }}>
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-cyber-cyan font-semibold">
                {tr("auth_login")}
              </Link>
            )}
            {user && (
              <button onClick={() => { signOut(); setOpen(false); }} className="text-start px-3 py-2 text-sm text-destructive">
                {tr("auth_logout")}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
