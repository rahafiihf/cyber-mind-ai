import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeUrl, type UrlReport } from "@/lib/url-analyzer.functions";
import { saveAnalysis } from "@/lib/analyses.functions";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Loader2, Link2, ShieldAlert, ShieldCheck, AlertTriangle, Globe, Lock, Eye, ChevronRight, Skull } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/url-scanner")({
  component: UrlScannerPage,
  head: () => ({ meta: [{ title: "URL Scanner — CyberMind AI" }, { name: "description", content: "Detect phishing, fake government sites, and brand impersonation in any suspicious link." }] }),
});

interface HistoryEntry { id: string; ts: number; url: string; report: UrlReport; }

function UrlScannerPage() {
  const { lang, tr } = useLang();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<UrlReport | null>(null);
  const fn = useServerFn(analyzeUrl);
  const save = useServerFn(saveAnalysis);

  async function onScan() {
    if (url.trim().length < 4) { toast.error(lang === "ar" ? "أدخل رابطاً صحيحاً" : "Enter a valid URL"); return; }
    setLoading(true); setReport(null);
    try {
      const r = await fn({ data: { url: url.trim() } });
      setReport(r);
      if (user) {
        try { await save({ data: { kind: "url", input: url.trim(), report: r as unknown as Record<string, unknown>, risk_score: r.riskScore } }); } catch { /* ignore */ }
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cm_url_history");
        const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift({ id: crypto.randomUUID(), ts: Date.now(), url: url.trim(), report: r });
        localStorage.setItem("cm_url_history", JSON.stringify(list.slice(0, 30)));
      }
      toast.success(tr("save_history"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tr("error"));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-3">{tr("url_title")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{tr("url_sub")}</p>
      </div>

      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        {loading && <div className="absolute inset-0 scanline pointer-events-none" />}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Link2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={tr("url_placeholder")}
              disabled={loading} maxLength={2000}
              className="w-full ps-10 pe-3 py-3 rounded-xl bg-input/40 border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan font-mono text-sm" />
          </div>
          <button onClick={onScan} disabled={loading || url.trim().length < 4}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-cyber text-primary-foreground font-semibold glow-cyan disabled:opacity-50 hover:scale-[1.02] transition">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
            {loading ? tr("analyzing") : tr("url_scan")}
          </button>
        </div>
      </div>

      {report && <UrlReportView report={report} />}
    </div>
  );
}

function UrlReportView({ report }: { report: UrlReport }) {
  const { lang, tr } = useLang();
  const ar = lang === "ar";

  const verdictMap: Record<UrlReport["verdict"], { color: string; icon: React.ElementType; label: string }> = {
    safe: { color: "var(--success)", icon: ShieldCheck, label: tr("verdict_safe") },
    suspicious: { color: "var(--warning)", icon: AlertTriangle, label: tr("verdict_suspicious") },
    phishing: { color: "var(--danger)", icon: ShieldAlert, label: tr("verdict_phishing") },
    malicious: { color: "var(--danger)", icon: Skull, label: tr("verdict_malicious") },
  };
  const v = verdictMap[report.verdict] ?? verdictMap.suspicious;
  const VIcon = v.icon;

  const fields: Array<{ icon: React.ElementType; label: string; value: string }> = [
    { icon: Globe, label: tr("url_domain"), value: ar ? report.domainAnalysisAr : report.domainAnalysis },
    { icon: Lock, label: tr("url_ssl"), value: ar ? report.sslStatusAr : report.sslStatus },
  ];
  const lists: Array<{ icon: React.ElementType; label: string; items: string[] }> = [
    { icon: AlertTriangle, label: tr("url_patterns"), items: ar ? report.urlPatternsAr : report.urlPatterns },
    { icon: ShieldAlert, label: tr("url_indicators"), items: ar ? report.phishingIndicatorsAr : report.phishingIndicators },
    { icon: Eye, label: tr("url_visual"), items: ar ? report.visualCluesAr : report.visualClues },
    { icon: ShieldCheck, label: tr("url_recs"), items: ar ? report.recommendationsAr : report.recommendations },
  ];

  return (
    <div className="mt-8 space-y-6 animate-in fade-in">
      <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 blur-3xl rounded-full pointer-events-none" style={{ background: `${v.color}30` }} />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${v.color}20`, color: v.color, boxShadow: `0 0 24px ${v.color}50` }}>
            <VIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{tr("url_verdict")}</p>
            <p className="display text-3xl font-bold" style={{ color: v.color }}>{ar ? report.verdictAr : v.label}</p>
            <p className="text-xs font-mono text-muted-foreground truncate mt-1">{report.parsedDomain}</p>
          </div>
          <div className="text-end shrink-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{tr("risk_score")}</p>
            <p className="display text-4xl font-bold" style={{ color: v.color, textShadow: `0 0 16px ${v.color}` }}>{report.riskScore}<span className="text-base text-muted-foreground">/100</span></p>
          </div>
        </div>
        {report.impersonates && (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <p className="text-xs font-mono uppercase tracking-widest text-destructive mb-1">{tr("url_impersonates")}</p>
            <p className="font-semibold">{ar ? report.impersonatesAr : report.impersonates}</p>
          </div>
        )}
        <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border">
          <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-2">{tr("url_why")}</p>
          <p className="text-sm leading-relaxed">{ar ? report.whyDangerousAr : report.whyDangerous}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-cyber-cyan mb-2">
              <f.icon className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">{f.label}</span>
            </div>
            <p className="text-sm leading-relaxed">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
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
