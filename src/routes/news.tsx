import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { Newspaper, ExternalLink, AlertTriangle, ShieldAlert, Radio, Building2, Phone, Globe } from "lucide-react";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  head: () => ({ meta: [{ title: "Live Alerts — CyberMind AI" }, { name: "description", content: "Real-time cyber threat alerts: phishing, government impersonation, scam campaigns." }] }),
});

type Alert = {
  id: string;
  en: { title: string; excerpt: string; tag: string; target: string };
  ar: { title: string; excerpt: string; tag: string; target: string };
  severity: number;
  icon: React.ElementType;
  minutesAgo: number;
};

const ALERTS: Alert[] = [
  {
    id: "1",
    en: { title: "Phishing site impersonating the Ministry of Commerce detected", excerpt: "A fake portal mimicking mc.gov.sa is harvesting CR numbers and IDs. Domain registered 2 days ago on a .top TLD.", tag: "Government Impersonation", target: "Ministry of Commerce" },
    ar: { title: "تحذير: موقع تصيّد ينتحل وزارة التجارة", excerpt: "بوابة مزيفة تقلّد mc.gov.sa تجمع أرقام السجل التجاري والهويات. النطاق سُجّل قبل يومين على نطاق .top.", tag: "انتحال جهة حكومية", target: "وزارة التجارة" },
    severity: 96, icon: Building2, minutesAgo: 4,
  },
  {
    id: "2",
    en: { title: "Active scam call wave: fake Social Security agents targeting elderly", excerpt: "Callers claim an 'unpaid pension fee' and demand immediate ATM transfer. Numbers spoofed to look local.", tag: "Scam Calls", target: "Elderly residents" },
    ar: { title: "موجة احتيال هاتفي: محتالون يدّعون أنهم من الضمان الاجتماعي ويستهدفون كبار السن", excerpt: "المتصلون يدّعون 'رسوم تقاعد متأخرة' ويطالبون بتحويل فوري من الصراف. أرقام مزيّفة تبدو محلية.", tag: "مكالمات احتيال", target: "كبار السن" },
    severity: 92, icon: Phone, minutesAgo: 12,
  },
  {
    id: "3",
    en: { title: "Fake Al Rajhi Bank SMS spreading credential-stealing pages", excerpt: "SMS claims 'account suspended' with a link to alrajhi-secure[.]xyz. Page mimics official login pixel-perfect.", tag: "Bank Phishing", target: "Banking customers" },
    ar: { title: "رسائل SMS مزيفة باسم بنك الراجحي تنشر صفحات سرقة كلمات المرور", excerpt: "الرسالة تدّعي 'تعليق الحساب' وتُحيل إلى alrajhi-secure[.]xyz. الصفحة تطابق شكل الموقع الرسمي.", tag: "تصيّد بنوك", target: "عملاء البنوك" },
    severity: 88, icon: ShieldAlert, minutesAgo: 27,
  },
  {
    id: "4",
    en: { title: "New ransomware strain exploiting unpatched RDP endpoints", excerpt: "Lateral movement observed within 12 minutes of initial access. Patch CVE-2026-XXXX immediately.", tag: "Ransomware", target: "Corporate networks" },
    ar: { title: "سلالة فدية جديدة تستغل ثغرات RDP غير المرقعة", excerpt: "رصد انتقال جانبي خلال 12 دقيقة من الوصول الأول. رقّع CVE-2026-XXXX فوراً.", tag: "فدية", target: "الشبكات المؤسسية" },
    severity: 94, icon: AlertTriangle, minutesAgo: 41,
  },
  {
    id: "5",
    en: { title: "Spoofed Absher portal harvesting national IDs", excerpt: "Domain absher-gov[.]net (not the real absher.sa) collects ID + biometric. Reported to CITC.", tag: "Government Impersonation", target: "Absher users" },
    ar: { title: "بوابة مزيفة باسم أبشر تجمع أرقام الهويات", excerpt: "النطاق absher-gov[.]net (وليس absher.sa الحقيقي) يجمع الهوية والبصمات. أُبلغ هيئة الاتصالات.", tag: "انتحال جهة حكومية", target: "مستخدمو أبشر" },
    severity: 90, icon: Building2, minutesAgo: 58,
  },
  {
    id: "6",
    en: { title: "Android spyware disguised as VPN app — 2M installs", excerpt: "Exfiltrates SMS, contacts, clipboard. Removed from Play Store but still on side-load sites.", tag: "Spyware", target: "Android users" },
    ar: { title: "برنامج تجسس أندرويد بهيئة تطبيق VPN — مليونا تنزيل", excerpt: "يسرّب الرسائل وجهات الاتصال والحافظة. أُزيل من Google Play لكنه ما زال على مواقع التحميل الجانبي.", tag: "تجسس", target: "مستخدمو أندرويد" },
    severity: 78, icon: Globe, minutesAgo: 95,
  },
  {
    id: "7",
    en: { title: "Critical zero-day in popular web framework disclosed", excerpt: "Remote code execution via crafted JSON payloads. Patch immediately. Active exploitation in the wild.", tag: "Zero-Day", target: "Web developers" },
    ar: { title: "الإفصاح عن ثغرة يوم-صفر حرجة في إطار ويب شهير", excerpt: "تنفيذ تعليمات عن بُعد عبر حمولات JSON معدّة. رقّع فوراً. الاستغلال نشط.", tag: "يوم صفر", target: "مطورو الويب" },
    severity: 91, icon: ShieldAlert, minutesAgo: 118,
  },
];

function NewsPage() {
  const { lang, tr } = useLang();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  function timeLabel(min: number) {
    const adj = min + Math.floor(tick * 0.5);
    if (adj < 60) return lang === "ar" ? `قبل ${adj} د` : `${adj}m ago`;
    const h = Math.floor(adj / 60);
    return lang === "ar" ? `قبل ${h} س` : `${h}h ago`;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/40 mb-5 animate-pulse-glow">
          <Radio className="w-3.5 h-3.5 text-destructive animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-destructive">{tr("news_live")}</span>
        </div>
        <Newspaper className="w-10 h-10 text-cyber-cyan mx-auto mb-3" strokeWidth={1.5} />
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient">{tr("news_title")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{tr("news_sub")}</p>
      </div>

      <div className="space-y-4">
        {ALERTS.map((it) => {
          const data = lang === "ar" ? it.ar : it.en;
          const color = it.severity >= 85 ? "var(--danger)" : it.severity >= 60 ? "var(--warning)" : "var(--success)";
          const Icon = it.icon;
          const isHigh = it.severity >= 85;
          return (
            <article
              key={it.id}
              className={`glass rounded-2xl p-5 sm:p-6 hover:border-cyber-cyan/40 transition cursor-pointer group relative overflow-hidden ${isHigh ? "border-destructive/40" : ""}`}
              style={isHigh ? { boxShadow: `0 0 0 1px ${color}30, 0 0 28px -8px ${color}40` } : undefined}
            >
              {isHigh && <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: `${color}25` }} />}
              <div className="relative flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}20`, color, boxShadow: isHigh ? `0 0 20px ${color}40` : undefined }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider"
                      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                    >
                      {data.tag} · {it.severity}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {timeLabel(it.minutesAgo)}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      → {data.target}
                    </span>
                  </div>
                  <h2 className="display text-lg sm:text-xl font-bold mb-1 group-hover:text-cyber-cyan transition leading-snug">
                    {data.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.excerpt}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground rtl:rotate-180 shrink-0 mt-1" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
