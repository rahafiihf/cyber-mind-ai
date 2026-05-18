import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Shield, Zap, Target, Brain, ArrowRight, Activity, Lock, Radar } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { tr } = useLang();
  const features = [
    { icon: Radar, t: tr("feature_1_t"), d: tr("feature_1_d") },
    { icon: Target, t: tr("feature_2_t"), d: tr("feature_2_d") },
    { icon: Activity, t: tr("feature_3_t"), d: tr("feature_3_d") },
    { icon: Brain, t: tr("feature_4_t"), d: tr("feature_4_d") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyber-cyan">{tr("hero_tag")}</span>
          </div>
          <h1 className="display text-5xl sm:text-7xl font-black leading-[1.05] mb-6">
            <span className="text-gradient">{tr("hero_title")}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">{tr("hero_sub")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-cyber text-primary-foreground font-semibold glow-cyan hover:scale-[1.03] transition"
            >
              <Zap className="w-5 h-5" />
              {tr("cta_analyze")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link to="/dashboard" className="px-6 py-3 rounded-lg border border-border hover:border-cyber-cyan/60 transition font-semibold">
              {tr("cta_dashboard")}
            </Link>
          </div>

          {/* Floating sensor card */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { k: "Phishing", v: "+38%" },
              { k: "Ransomware", v: "+12%" },
              { k: "Zero-days", v: "247" },
              { k: "AI Models", v: "ONLINE" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-xl p-4 text-start animate-float" style={{ animationDelay: `${Math.random()}s` }}>
                <p className="text-xs font-mono text-muted-foreground uppercase">{s.k}</p>
                <p className="text-xl font-bold text-cyber-cyan mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.t} className="group glass rounded-2xl p-6 hover:border-cyber-cyan/50 transition relative overflow-hidden">
              <div className="absolute -top-12 -end-12 w-24 h-24 rounded-full bg-cyber-cyan/10 blur-2xl group-hover:bg-cyber-cyan/30 transition" />
              <f.icon className="w-8 h-8 text-cyber-cyan mb-4" strokeWidth={1.5} />
              <h3 className="display text-lg font-bold mb-2">{f.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden scanline">
          <Lock className="w-12 h-12 text-cyber-cyan mx-auto mb-5" strokeWidth={1.5} />
          <h2 className="display text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-gradient">Your AI Security Analyst</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Powered by next-gen neural models. Trained on millions of threat signatures.
          </p>
          <Link to="/analyzer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-cyber text-primary-foreground font-semibold glow-blue">
            <Shield className="w-5 h-5" /> {tr("cta_analyze")}
          </Link>
        </div>
      </section>
    </div>
  );
}
