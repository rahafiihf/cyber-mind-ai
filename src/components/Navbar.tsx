import { Link } from "@tanstack/react-router";
import { Shield, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function Navbar() {
  const { lang, setLang, tr } = useLang();
  const links = [
    { to: "/", label: tr("nav_home") },
    { to: "/analyzer", label: tr("nav_analyzer") },
    { to: "/dashboard", label: tr("nav_dashboard") },
    { to: "/news", label: tr("nav_news") },
    { to: "/about", label: tr("nav_about") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield className="w-7 h-7 text-cyber-cyan" strokeWidth={1.5} />
            <div className="absolute inset-0 blur-md bg-cyber-cyan/40 group-hover:bg-cyber-cyan/70 transition" />
          </div>
          <span className="display text-lg font-bold text-gradient">{tr("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-md hover:bg-secondary/50"
              activeProps={{ className: "px-3 py-2 text-sm rounded-md text-cyber-cyan bg-secondary/60" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/60 hover:border-cyber-cyan/60 hover:glow-cyan text-sm transition"
        >
          <Globe className="w-4 h-4" />
          <span className="font-mono">{tr("lang_toggle")}</span>
        </button>
      </div>
    </header>
  );
}
