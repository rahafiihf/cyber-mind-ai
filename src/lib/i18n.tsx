import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

export const t: Dict = {
  brand: { en: "CyberMind AI", ar: "سايبر مايند AI" },
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_analyzer: { en: "Threat Analyzer", ar: "محلل التهديدات" },
  nav_dashboard: { en: "Dashboard", ar: "لوحة المخاطر" },
  nav_news: { en: "Cyber News", ar: "أخبار الأمن" },
  nav_about: { en: "About", ar: "من نحن" },
  hero_tag: { en: "AI-Powered Cybersecurity Intelligence", ar: "ذكاء أمن سيبراني مدعوم بالذكاء الاصطناعي" },
  hero_title: { en: "Detect. Analyze. Defend.", ar: "اكتشف. حلّل. دافع." },
  hero_sub: {
    en: "Describe a suspicious activity and our AI agent will return a full forensic-grade cybersecurity report in seconds.",
    ar: "صف أي نشاط مشبوه وسيقوم وكيل الذكاء الاصطناعي بإصدار تقرير أمن سيبراني متكامل خلال ثوانٍ.",
  },
  cta_analyze: { en: "Analyze a Threat", ar: "حلّل تهديداً الآن" },
  cta_dashboard: { en: "Open Dashboard", ar: "افتح لوحة التحكم" },
  feature_1_t: { en: "Threat Type Detection", ar: "تحديد نوع التهديد" },
  feature_1_d: { en: "Phishing, malware, ransomware, brute-force and more — classified instantly.", ar: "تصيّد، برمجيات خبيثة، فدية، هجمات قوة غاشمة — تصنيف فوري." },
  feature_2_t: { en: "Attack Vector Analysis", ar: "تحليل ناقل الهجوم" },
  feature_2_d: { en: "Trace the entry point: link, file, network, email, USB.", ar: "تتبّع نقطة الدخول: رابط، ملف، شبكة، بريد، USB." },
  feature_3_t: { en: "Risk Score 0–100", ar: "درجة الخطر 0–100" },
  feature_3_d: { en: "Real-time visual danger meter with glowing indicators.", ar: "مقياس خطر مرئي بمؤشرات متوهجة." },
  feature_4_t: { en: "Predictive Intelligence", ar: "ذكاء تنبؤي" },
  feature_4_d: { en: "Predicts the attacker's likely next move.", ar: "يتوقع الخطوة التالية للمهاجم." },

  analyzer_title: { en: "AI Threat Analyzer", ar: "محلل التهديدات بالذكاء الاصطناعي" },
  analyzer_sub: { en: "Describe what happened. Be as specific as possible.", ar: "صف ما حدث. كن دقيقاً قدر الإمكان." },
  placeholder: {
    en: "Example: I received an SMS claiming my bank account is locked, with a link to verify. I clicked it and entered my credentials...",
    ar: "مثال: وصلتني رسالة SMS تدعي أن حسابي البنكي معلّق، مع رابط للتحقق. ضغطت على الرابط وأدخلت بياناتي...",
  },
  analyze_btn: { en: "Run AI Analysis", ar: "تشغيل التحليل" },
  analyzing: { en: "AI is analyzing…", ar: "الذكاء الاصطناعي يحلّل…" },
  report: { en: "Security Report", ar: "التقرير الأمني" },
  threat_type: { en: "Threat Type", ar: "نوع التهديد" },
  entry_point: { en: "Entry Point", ar: "نقطة الدخول" },
  attacker_behavior: { en: "Attacker Behavior", ar: "سلوك المهاجم" },
  next_move: { en: "Predicted Next Move", ar: "الخطوة التالية المتوقعة" },
  risk_score: { en: "Risk Score", ar: "درجة الخطر" },
  immediate: { en: "Immediate Actions", ar: "إجراءات فورية" },
  longterm: { en: "Long-term Protection", ar: "حماية طويلة الأمد" },
  device: { en: "Device Hardening", ar: "تعزيز الجهاز" },
  save_history: { en: "Saved to history", ar: "تم الحفظ في السجل" },
  empty_history: { en: "No analyses yet. Run your first scan.", ar: "لا توجد تحاليل بعد. ابدأ أول فحص." },
  history: { en: "Threat History", ar: "سجل التهديدات" },
  dash_title: { en: "Risk Dashboard", ar: "لوحة المخاطر" },
  dash_sub: { en: "Aggregated intelligence from your scans.", ar: "ذكاء مجمّع من فحوصاتك." },
  total_scans: { en: "Total Scans", ar: "إجمالي الفحوصات" },
  avg_risk: { en: "Average Risk", ar: "متوسط الخطر" },
  critical: { en: "Critical Threats", ar: "تهديدات حرجة" },
  news_title: { en: "Live Cyber Threat News", ar: "أخبار التهديدات السيبرانية" },
  about_title: { en: "About CyberMind AI", ar: "عن سايبر مايند AI" },
  about_p: {
    en: "CyberMind AI is an autonomous security agent that translates cryptic threats into actionable defense plans — built for analysts, founders, and everyday users.",
    ar: "سايبر مايند AI وكيل أمني مستقل يحوّل التهديدات الغامضة إلى خطط دفاع عملية — مصمّم للمحللين والمؤسسين والمستخدمين العاديين.",
  },
  footer: { en: "Built with neural defense systems · © 2026 CyberMind AI", ar: "مبني بأنظمة دفاع عصبية · © 2026 سايبر مايند AI" },
  error: { en: "Analysis failed. Please try again.", ar: "فشل التحليل. حاول مرة أخرى." },
  lang_toggle: { en: "العربية", ar: "English" },
  clear_history: { en: "Clear History", ar: "مسح السجل" },
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; tr: (k: keyof typeof t) => string; }
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("cm_lang") as Lang) || "en";
    setLangState(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("cm_lang", l);
  };
  const tr = (k: keyof typeof t) => t[k][lang];
  return <LangCtx.Provider value={{ lang, setLang, tr }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const c = useContext(LangCtx);
  if (!c) throw new Error("useLang must be used within LanguageProvider");
  return c;
}
