import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeThreat, type ThreatReport } from "@/lib/threat-analyzer.functions";
import { useLang } from "@/lib/i18n";
import { RiskMeter } from "@/components/RiskMeter";
import { Loader2, Zap, AlertTriangle, Activity, Target, Brain, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/analyzer")({
  component: AnalyzerPage,
  head: () => ({ meta: [{ title: "Threat Analyzer — CyberMind AI" }, { name: "description", content: "Describe a suspicious activity and receive an instant AI cybersecurity report." }] }),
});

interface HistoryEntry { id: string; ts: number; description: string; report: ThreatReport; }

function AnalyzerPage() {
  const { lang, tr } = useLang();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatReport | null>(null);
  const fn = useServerFn(analyzeThreat);

  async function onAnalyze() {
    if (description.trim().length < 10) {
      toast.error(lang === "ar" ? "الوصف قصير جداً" : "Description too short");
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const r = await fn({ data: { description: description.trim() } });
      setReport(r);
      // persist to history
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cm_history");
        const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift({ id: crypto.randomUUID(), ts: Date.now(), description: description.trim(), report: r });
        localStorage.setItem("cm_history", JSON.stringify(list.slice(0, 30)));
      }
      toast.success(tr("save_history"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || tr("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-3">{tr("analyzer_title")}</h1>
        <p className="text-muted-foreground">{tr("analyzer_sub")}</p>
      </div>

      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {loading && <div className="absolute inset-0 scanline pointer-events-none" />}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={tr("placeholder")}
          rows={6}
          maxLength={4000}
          disabled={loading}
          className="w-full bg-input/40 rounded-xl p-4 text-sm leading-relaxed border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan resize-none font-mono"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-mono text-muted-foreground">{description.length}/4000</span>
          <button
            onClick={onAnalyze}
            disabled={loading || description.trim().length < 10}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-cyber text-primary-foreground font-semibold glow-cyan disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition"
          >
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
  const items: Array<{ icon: React.ElementType; label: string; value: string }> = [
    { icon: AlertTriangle, label: tr("threat_type"), value: ar ? report.threatTypeAr : report.threatType },
    { icon: Target, label: tr("entry_point"), value: ar ? report.entryPointAr : report.entryPoint },
    { icon: Activity, label: tr("attacker_behavior"), value: ar ? report.attackerBehaviorAr : report.attackerBehavior },
    { icon: Brain, label: tr("next_move"), value: ar ? report.nextMoveAr : report.nextMove },
  ];

  const lists: Array<{ icon: React.ElementType; label: string; items: string[] }> = [
    { icon: Zap, label: tr("immediate"), items: ar ? report.immediateActionsAr : report.immediateActions },
    { icon: ShieldCheck, label: tr("longterm"), items: ar ? report.longTermProtectionAr : report.longTermProtection },
    { icon: Brain, label: tr("device"), items: ar ? report.deviceHardeningAr : report.deviceHardening },
  ];

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
