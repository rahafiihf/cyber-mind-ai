import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzePhone, type PhoneReport } from "@/lib/phone-analyzer.functions";
import { saveAnalysis } from "@/lib/analyses.functions";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Loader2, Phone, ShieldAlert, ShieldCheck, AlertTriangle, ChevronRight, Skull, Brain, Zap, UserCircle, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/phone-scanner")({
  component: PhoneScannerPage,
  head: () => ({
    meta: [
      { title: "Scam Phone Detector — CyberMind AI" },
      { name: "description", content: "Detect scam calls, fraudulent numbers, and impersonation of banks, government, and social security." },
    ],
  }),
});

interface HistoryEntry { id: string; ts: number; phone: string; report: PhoneReport; }

function PhoneScannerPage() {
  const { lang, tr } = useLang();
  const { user, isGuest } = useAuth();
  const [phone, setPhone] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PhoneReport | null>(null);
  const fn = useServerFn(analyzePhone);
  const save = useServerFn(saveAnalysis);

  async function onScan() {
    if (phone.trim().length < 3) { toast.error(lang === "ar" ? "أدخل رقماً صحيحاً" : "Enter a valid number"); return; }
    setLoading(true); setReport(null);
    try {
      const r = await fn({ data: { phone: phone.trim(), context: context.trim() || undefined } });
      setReport(r);
      if (user) {
        try { await save({ data: { kind: "phone", input: phone.trim(), report: r as unknown as Record<string, unknown>, risk_score: r.scamScore } }); } catch { /* ignore */ }
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cm_phone_history");
        const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift({ id: crypto.randomUUID(), ts: Date.now(), phone: phone.trim(), report: r });
        localStorage.setItem("cm_phone_history", JSON.stringify(list.slice(0, 30)));
      }
      toast.success(tr("save_history"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tr("error"));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-3">{tr("phone_title")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{tr("phone_sub")}</p>
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
        <label className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-2 block">{tr("phone_number")}</label>
        <div className="relative">
          <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={tr("phone_placeholder")}
            disabled={loading}
            className="w-full ps-10 pe-3 py-3 rounded-xl bg-input/40 border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan font-mono text-sm" />
        </div>

        <label className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mt-5 mb-2 block">{tr("phone_context")}</label>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder={tr("phone_context_ph")}
          rows={4} disabled={loading}
          className="w-full bg-input/40 rounded-xl p-3 text-sm leading-relaxed border border-border focus:outline-none focus:border-cyber-cyan focus:glow-cyan resize-y font-mono min-h-[110px]" />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-muted-foreground">{context.length.toLocaleString()} chars</span>
          <button onClick={onScan} disabled={loading || phone.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-cyber text-primary-foreground font-semibold glow-cyan disabled:opacity-50 hover:scale-[1.02] transition">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
            {loading ? tr("analyzing") : tr("phone_scan")}
          </button>
        </div>
      </div>

      {report && <PhoneReportView report={report} />}
    </div>
  );
}

function PhoneReportView({ report }: { report: PhoneReport }) {
  const { lang, tr } = useLang();
  const ar = lang === "ar";

  const verdictMap: Record<PhoneReport["verdict"], { color: string; icon: React.ElementType }> = {
    safe: { color: "var(--success)", icon: ShieldCheck },
    suspicious: { color: "var(--warning)", icon: AlertTriangle },
    scam: { color: "var(--danger)", icon: ShieldAlert },
    dangerous: { color: "var(--danger)", icon: Skull },
  };
  const v = verdictMap[report.verdict] ?? verdictMap.suspicious;
  const VIcon = v.icon;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in">
      {/* Verdict + score */}
      <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 blur-3xl rounded-full pointer-events-none" style={{ background: `${v.color}30` }} />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${v.color}20`, color: v.color, boxShadow: `0 0 24px ${v.color}50` }}>
            <VIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{tr("url_verdict")}</p>
            <p className="display text-3xl font-bold" style={{ color: v.color }}>{report.verdictAr && ar ? report.verdictAr : report.verdict}</p>
            <p className="text-xs font-mono text-muted-foreground truncate mt-1" dir="ltr">{report.parsedNumber}</p>
          </div>
          <div className="text-end shrink-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{tr("phone_scam_score")}</p>
            <p className="display text-4xl font-bold" style={{ color: v.color, textShadow: `0 0 16px ${v.color}` }}>{report.scamScore}<span className="text-base text-muted-foreground">/100</span></p>
          </div>
        </div>

        {report.impersonates && (
          <div className="mt-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <p className="text-xs font-mono uppercase tracking-widest text-destructive mb-1">{tr("phone_impersonates")}</p>
            <p className="font-semibold">{ar ? report.impersonatesAr : report.impersonates}</p>
          </div>
        )}

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-1">{tr("phone_fraud_type")}</p>
            <p className="font-semibold">{ar ? report.fraudTypeAr : report.fraudType}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-1">{tr("url_why")}</p>
            <p className="text-sm leading-relaxed">{ar ? report.whyDangerousAr : report.whyDangerous}</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-background/40 border border-border/60">
          <p className="text-sm leading-relaxed text-muted-foreground">{ar ? report.summaryAr : report.summary}</p>
        </div>
      </div>

      {/* Elderly warning */}
      {report.elderlyTarget && (
        <div className="rounded-2xl p-5 border border-destructive/50 bg-destructive/10 relative overflow-hidden animate-pulse-glow">
          <div className="absolute -top-10 -end-10 w-40 h-40 bg-destructive/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="display text-lg font-bold text-destructive">{tr("phone_elderly")}</p>
              <p className="text-sm text-muted-foreground mt-1">{tr("phone_elderly_sub")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Manipulation tactics */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-cyber-cyan mb-3">
            <Brain className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">{tr("phone_manipulation")}</span>
          </div>
          <ul className="space-y-2">
            {(ar ? report.manipulationTacticsAr : report.manipulationTactics).map((it, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5 rtl:rotate-180" />
                <span className="text-muted-foreground leading-relaxed">{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-destructive mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">{tr("phone_red_flags")}</span>
          </div>
          <ul className="space-y-2">
            {(ar ? report.redFlagsAr : report.redFlags).map((it, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-destructive shrink-0 mt-0.5 rtl:rotate-180" />
                <span className="text-muted-foreground leading-relaxed">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-xl p-5 border border-cyber-cyan/30">
        <div className="flex items-center gap-2 text-cyber-cyan mb-3">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-widest">{tr("phone_actions")}</span>
        </div>
        <ul className="space-y-2">
          {(ar ? report.recommendedActionsAr : report.recommendedActions).map((it, idx) => (
            <li key={idx} className="flex gap-2 text-sm">
              <ChevronRight className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5 rtl:rotate-180" />
              <span className="leading-relaxed">{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
