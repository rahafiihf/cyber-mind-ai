import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { listAnalyses, clearAnalyses, type AnalysisRow } from "@/lib/analyses.functions";
import type { ThreatReport } from "@/lib/threat-analyzer.functions";
import type { UrlReport } from "@/lib/url-analyzer.functions";
import { Activity, AlertTriangle, ShieldAlert, Trash2, Link2, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Risk Dashboard — CyberMind AI" }] }),
});

interface Entry { id: string; ts: number; kind: "threat" | "url"; label: string; sub: string; score: number; }

function DashboardPage() {
  const { lang, tr } = useLang();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Entry[]>([]);
  const fetchRemote = useServerFn(listAnalyses);
  const clearRemote = useServerFn(clearAnalyses);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchRemote({}).then((rows: AnalysisRow[]) => {
        setList(rows.map((r) => entryFromRow(r, lang)));
      }).catch(() => setList([]));
    } else if (typeof window !== "undefined") {
      const threatRaw = localStorage.getItem("cm_history");
      const urlRaw = localStorage.getItem("cm_url_history");
      const merged: Entry[] = [];
      if (threatRaw) {
        const arr = JSON.parse(threatRaw) as Array<{ id: string; ts: number; description: string; report: ThreatReport }>;
        arr.forEach((e) => merged.push({ id: e.id, ts: e.ts, kind: "threat", label: lang === "ar" ? e.report.threatTypeAr : e.report.threatType, sub: e.description, score: e.report.riskScore }));
      }
      if (urlRaw) {
        const arr = JSON.parse(urlRaw) as Array<{ id: string; ts: number; url: string; report: UrlReport }>;
        arr.forEach((e) => merged.push({ id: e.id, ts: e.ts, kind: "url", label: lang === "ar" ? e.report.verdictAr : e.report.verdict, sub: e.url, score: e.report.riskScore }));
      }
      merged.sort((a, b) => b.ts - a.ts);
      setList(merged);
    }
  }, [user, authLoading, lang, fetchRemote]);

  const clear = async () => {
    if (user) { await clearRemote({}); }
    else { localStorage.removeItem("cm_history"); localStorage.removeItem("cm_url_history"); }
    setList([]);
  };

  const avg = list.length ? Math.round(list.reduce((a, b) => a + b.score, 0) / list.length) : 0;
  const critical = list.filter((e) => e.score >= 80).length;
  const typeMap = new Map<string, number>();
  list.forEach((e) => typeMap.set(e.label, (typeMap.get(e.label) || 0) + 1));
  const pieData = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  const barData = list.slice(0, 8).reverse().map((e, i) => ({ name: `#${i + 1}`, risk: e.score }));
  const colors = ["#00e5ff", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#10b981"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-2">{tr("dash_title")}</h1>
          <p className="text-muted-foreground">{tr("dash_sub")}</p>
        </div>
        {list.length > 0 && (
          <button onClick={clear} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-destructive/60 text-sm transition">
            <Trash2 className="w-4 h-4" /> {tr("clear_history")}
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Activity} label={tr("total_scans")} value={list.length} color="var(--cyber-cyan)" />
        <StatCard icon={AlertTriangle} label={tr("avg_risk")} value={avg} color="var(--warning)" suffix="/100" />
        <StatCard icon={ShieldAlert} label={tr("critical")} value={critical} color="var(--danger)" />
      </div>

      {list.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">{tr("empty_history")}</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-4">Risk Trend</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                  <Bar dataKey="risk" fill="url(#g1)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5ff" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-4">Threat Distribution</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan mb-4">{tr("history")}</p>
            <div className="space-y-2">
              {list.map((e) => {
                const score = e.score;
                const color = score >= 80 ? "var(--danger)" : score >= 50 ? "var(--warning)" : "var(--success)";
                const Icon = e.kind === "url" ? Link2 : Zap;
                return (
                  <div key={e.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/40 transition border border-transparent hover:border-border">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold display shrink-0" style={{ background: `${color}20`, color, boxShadow: `0 0 12px ${color}40` }}>
                      {score}
                    </div>
                    <Icon className="w-4 h-4 text-cyber-cyan shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{e.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.sub}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{new Date(e.ts).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function entryFromRow(r: AnalysisRow, lang: string): Entry {
  const ts = new Date(r.created_at).getTime();
  if (r.kind === "url") {
    const rep = r.report as unknown as UrlReport;
    return { id: r.id, ts, kind: "url", label: lang === "ar" ? rep.verdictAr : rep.verdict, sub: r.input, score: r.risk_score };
  }
  const rep = r.report as unknown as ThreatReport;
  return { id: r.id, ts, kind: "threat", label: lang === "ar" ? rep.threatTypeAr : rep.threatType, sub: r.input, score: r.risk_score };
}

function StatCard({ icon: Icon, label, value, color, suffix }: { icon: React.ElementType; label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-8 -end-8 w-24 h-24 rounded-full blur-2xl" style={{ background: `${color}30` }} />
      <Icon className="w-6 h-6 mb-3" style={{ color }} />
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="display text-4xl font-bold" style={{ color, textShadow: `0 0 16px ${color}` }}>
        {value}{suffix && <span className="text-base text-muted-foreground ms-1">{suffix}</span>}
      </p>
    </div>
  );
}
