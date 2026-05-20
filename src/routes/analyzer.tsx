import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeThreat, type ThreatReport } from "@/lib/threat-analyzer.functions";
import { saveAnalysis } from "@/lib/analyses.functions";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { RiskMeter } from "@/components/RiskMeter";
import { Loader2, Zap, AlertTriangle, Activity, Target, Brain, ShieldCheck, ChevronRight, Crosshair, UserCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";

export const Route = createFileRoute("/analyzer")({
  component: AnalyzerPage,
  head: () => ({ meta: [{ title: "Threat Analyzer — CyberMind AI" }, { name: "description", content: "Describe a suspicious activity and receive an instant AI cybersecurity report." }] }),
});

interface HistoryEntry { id: string; ts: number; description: string; report: ThreatReport; }

function AnalyzerPage() {
  const { lang, tr, beginner, setBeginner } = useLang();
  const { user, isGuest } = useAuth();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatReport | null>(null);
  const fn = useServerFn(analyzeThreat);
  const save = useServerFn(saveAnalysis);

  async function onAnalyze() {
    if (description.trim().length < 10) { toast.error(lang === "ar" ? "الوصف قصير جداً" : "Description too short"); return; }
    setLoading(true); setReport(null);
    try {
      const r = await fn({ data: { description: description.trim(), beginner } });
      setReport(r);
      if (user) {
        try { await save({ data: { kind: "threat", input: description.trim(), report: r as unknown as Record<string, unknown>, risk_score: r.riskScore } }); } catch { /* ignore */ }
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cm_history");
        const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift({ id: crypto.randomUUID(), ts: Date.now(), description: description.trim(), report: r });
        localStorage.setItem("cm_history", JSON.stringify(list.slice(0, 30)));
      }
      toast.success(tr("save_history"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tr("error"));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-3">{tr("analyzer_title")}</h1>
        <p className="text-muted-foreground">{tr("analyzer_sub")}</p>
      </div>

      {!user && (
        <div className="mb-6 glass rounded-xl p-4 flex items-center gap-3 border border-cyber-cyan/30">
          <UserCircle className="w-5 h-5 text-cyber-cyan shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            {isGuest ? tr("guest_banner") : tr("sign_in_to_save")}
          </p>
          {!isGuest && (
            <Link to="/auth" className="text-sm font-semibold text-cyber-cyan hover:text-cyber-blue whitespace-nowrap">
              {tr("auth_login")} →
            </Link>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {loading && <div className="absolute inset-0 scanline pointer-events-none" />}
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={tr("placeholder")}
          rows={6} maxLength={4000} disabled={loading}
          className="w-full bg-input/40 rounded-xl p-4 text-sm leading-relaxed border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan resize-none font-mono" />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-3">
            <VoiceInput onTranscript={setDescription} disabled={loading} />
            <button
              type="button"
              onClick={() => setBeginner(!beginner)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition ${
                beginner ? "border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan" : "border-border hover:border-cyber-cyan/60"
              }`}
              title={tr("beginner_hint")}
            >
              <GraduationCap className="w-4 h-4" />
              {tr("beginner_mode")}
            </button>
            <span className="text-xs font-mono text-muted-foreground">{description.length}/4000</span>
          </div>
          <button onClick={onAnalyze} disabled={loading || description.trim().length < 10}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-cyber text-primary-foreground font-semibold glow-cyan disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? tr("analyzing") : tr("analyze_btn")}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-10 glass rounded-2xl p-10 text-center">
          <div className="inline-flex items-center gap-3 text-cyber-cyan font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: "0.4s" }} />
            <span className="ms-2 text-sm uppercase tracking-widest">{tr("analyzing")}</span>
          </div>
        </div>
      )}

      {report && <ReportView report={report} />}
    </div>
  );
}

function ReportView({ report }: { report: ThreatReport }) {
  const { lang, tr } = useLang();
  const ar = lang === "ar";
  const items = [
    { icon: AlertTriangle, label: tr("threat_type"), value: ar ? report.threatTypeAr : report.threatType },
    { icon: Target, label: tr("entry_point"), value: ar ? report.entryPointAr : report.entryPoint },
    { icon: Activity, label: tr("attacker_behavior"), value: ar ? report.attackerBehaviorAr : report.attackerBehavior },
    { icon: Brain, label: tr("next_move"), value: ar ? report.nextMoveAr : report.nextMove },
  ];
  const lists = [
    { icon: Zap, label: tr("immediate"), items: ar ? report.immediateActionsAr : report.immediateActions },
    { icon: ShieldCheck, label: tr("longterm"), items: ar ? report.longTermProtectionAr : report.longTermProtection },
    { icon: Brain, label: tr("device"), items: ar ? report.deviceHardeningAr : report.deviceHardening },
  ];
  const whyList = ar ? report.whyTargetedAr : report.whyTargeted;

  return (
    <div className="mt-10 space-y-6 animate-in fade-in">
      <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-cyber-blue/20 blur-3xl rounded-full pointer-events-none" />
        <RiskMeter score={report.riskScore} label={tr("risk_score")} />
        <div className="flex-1 text-center sm:text-start">
          <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-2">{tr("report")}</p>
          <p className="text-lg leading-relaxed">{ar ? report.summaryAr : report.summary}</p>
        </div>
      </div>

      {whyList?.length > 0 && (
        <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-cyber-cyan/30">
          <div className="absolute -top-12 -start-12 w-64 h-64 bg-cyber-cyan/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-cyber-cyan" />
              </div>
              <div>
                <h3 className="display text-2xl font-bold text-gradient">{tr("why_targeted")}</h3>
                <p className="text-xs text-muted-foreground">{tr("why_targeted_sub")}</p>
              </div>
            </div>
            <ul className="space-y-3 mt-5">
              {whyList.map((it, idx) => (
                <li key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-cyber-cyan/40 transition">
                  <div className="w-6 h-6 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">{idx + 1}</div>
                  <span className="text-sm leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-cyber-cyan mb-2">
              <i.icon className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">{i.label}</span>
            </div>
            <p className="text-base font-semibold">{i.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {lists.map((l) => (
          <div key={l.label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-cyber-cyan mb-3">
              <l.icon className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">{l.label}</span>
            </div>
            <ul className="space-y-2">
              {l.items?.map((it, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5 rtl:rotate-180" />
                  <span className="text-muted-foreground leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
