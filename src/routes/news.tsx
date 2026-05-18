import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Newspaper, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  head: () => ({ meta: [{ title: "Cyber News — CyberMind AI" }] }),
});

const items = [
  {
    en: { title: "Massive Phishing Wave Targets Banking Customers in Gulf Region", excerpt: "Threat actors are spoofing major banks via SMS with credential-harvesting pages.", tag: "Phishing" },
    ar: { title: "موجة تصيّد ضخمة تستهدف عملاء البنوك في الخليج", excerpt: "جهات تهديد تنتحل بنوكاً كبرى عبر الرسائل النصية وصفحات تجميع بيانات الاعتماد.", tag: "تصيّد" },
    severity: 82,
  },
  {
    en: { title: "New Ransomware Strain Exploits Unpatched RDP Endpoints", excerpt: "Researchers observed lateral movement within 12 minutes of initial access.", tag: "Ransomware" },
    ar: { title: "سلالة فدية جديدة تستغل ثغرات RDP غير المرقعة", excerpt: "رصد الباحثون انتقالاً جانبياً خلال 12 دقيقة من الوصول الأول.", tag: "فدية" },
    severity: 94,
  },
  {
    en: { title: "Android Spyware Disguised as VPN App Found on Major Stores", excerpt: "Over 2M installs detected. Exfiltrates SMS, contacts and clipboard.", tag: "Spyware" },
    ar: { title: "برنامج تجسس أندرويد بهيئة تطبيق VPN منتشر في المتاجر الكبرى", excerpt: "أكثر من مليوني تنزيل. يسرّب الرسائل وجهات الاتصال والحافظة.", tag: "تجسس" },
    severity: 76,
  },
  {
    en: { title: "Critical Zero-Day in Popular Web Framework Disclosed", excerpt: "Remote code execution possible via crafted JSON payloads. Patch immediately.", tag: "Zero-Day" },
    ar: { title: "الإفصاح عن ثغرة يوم-صفر حرجة في إطار ويب شهير", excerpt: "تنفيذ تعليمات عن بُعد عبر حمولات JSON معدّة. رقّع فوراً.", tag: "يوم صفر" },
    severity: 91,
  },
];

function NewsPage() {
  const { lang, tr } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <Newspaper className="w-10 h-10 text-cyber-cyan mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient">{tr("news_title")}</h1>
      </div>
      <div className="space-y-4">
        {items.map((it, i) => {
          const data = lang === "ar" ? it.ar : it.en;
          const color = it.severity >= 80 ? "var(--danger)" : it.severity >= 50 ? "var(--warning)" : "var(--success)";
          return (
            <article key={i} className="glass rounded-2xl p-6 hover:border-cyber-cyan/40 transition cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                  {data.tag} · {it.severity}
                </div>
                <div className="flex-1">
                  <h2 className="display text-xl font-bold mb-2 group-hover:text-cyber-cyan transition">{data.title}</h2>
                  <p className="text-sm text-muted-foreground">{data.excerpt}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
