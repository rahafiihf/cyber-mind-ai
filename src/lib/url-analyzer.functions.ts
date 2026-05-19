import { createServerFn } from "@tanstack/react-start";

export type UrlReport = {
  verdict: "safe" | "suspicious" | "phishing" | "malicious";
  verdictAr: string;
  riskScore: number;
  impersonates: string | null;
  impersonatesAr: string | null;
  domainAnalysis: string;
  domainAnalysisAr: string;
  sslStatus: string;
  sslStatusAr: string;
  urlPatterns: string[];
  urlPatternsAr: string[];
  phishingIndicators: string[];
  phishingIndicatorsAr: string[];
  visualClues: string[];
  visualCluesAr: string[];
  whyDangerous: string;
  whyDangerousAr: string;
  recommendations: string[];
  recommendationsAr: string[];
  comparedDomain: string | null;
  parsedDomain: string;
};

const SYSTEM = `You are CyberMind AI, an elite phishing-detection analyst.
Given a suspicious URL, analyze it for phishing, scam, fake government/bank impersonation, typosquatting, and social-engineering risk.
Return ONLY valid JSON. Provide BOTH English and Arabic for every text field.
verdict: "safe" | "suspicious" | "phishing" | "malicious".
riskScore: integer 0-100. safe<20, suspicious 30-55, phishing 70-90, malicious 90-100.
impersonates: if URL pretends to be a known brand/government (e.g. "Saudi Ministry of Commerce"), name it. Else null.
Arrays: 3-5 short items each (<18 words).
Focus on: domain reputation, typosquatting, suspicious TLDs (.tk, .xyz, .top), subdomain abuse, IDN homograph, URL length, encoded chars, look-alike to official sites, HTTPS/SSL, age clues from URL structure.`;

const SCHEMA = `{
  "verdict": "safe|suspicious|phishing|malicious",
  "verdictAr": "...",
  "riskScore": 0-100,
  "impersonates": "string or null",
  "impersonatesAr": "string or null",
  "domainAnalysis": "...", "domainAnalysisAr": "...",
  "sslStatus": "...", "sslStatusAr": "...",
  "urlPatterns": [], "urlPatternsAr": [],
  "phishingIndicators": [], "phishingIndicatorsAr": [],
  "visualClues": [], "visualCluesAr": [],
  "whyDangerous": "...", "whyDangerousAr": "...",
  "recommendations": [], "recommendationsAr": [],
  "comparedDomain": "official domain to compare to, or null"
}`;

function parseDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `http://${url}`);
    return u.hostname;
  } catch { return url; }
}

export const analyzeUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { url: string }) => {
    if (!d?.url || typeof d.url !== "string") throw new Error("url required");
    const trimmed = d.url.trim();
    if (trimmed.length < 4 || trimmed.length > 2000) throw new Error("invalid url length");
    return { url: trimmed };
  })
  .handler(async ({ data }): Promise<UrlReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const domain = parseDomain(data.url);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM + "\nSchema:\n" + SCHEMA },
          { role: "user", content: `Analyze this URL for phishing/scam risk:\nURL: ${data.url}\nDomain: ${domain}\n\nReturn ONLY the JSON object.` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: UrlReport;
    try { parsed = JSON.parse(content); }
    catch { throw new Error("AI returned invalid JSON"); }

    parsed.riskScore = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)));
    parsed.parsedDomain = domain;
    return parsed;
  });
