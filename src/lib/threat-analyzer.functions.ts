import { createServerFn } from "@tanstack/react-start";

export type ThreatReport = {
  threatType: string;
  threatTypeAr: string;
  entryPoint: string;
  entryPointAr: string;
  attackerBehavior: string;
  attackerBehaviorAr: string;
  nextMove: string;
  nextMoveAr: string;
  riskScore: number;
  immediateActions: string[];
  immediateActionsAr: string[];
  longTermProtection: string[];
  longTermProtectionAr: string[];
  deviceHardening: string[];
  deviceHardeningAr: string[];
  summary: string;
  summaryAr: string;
  whyTargeted: string[];
  whyTargetedAr: string[];
};

const SYSTEM = `You are CyberMind AI, an elite cybersecurity analyst agent.
Given a user-described suspicious activity, return a complete forensic threat report.
Always respond ONLY with valid JSON matching the requested schema. Provide BOTH English and Arabic for every field.
riskScore: integer 0-100. Be calibrated: phishing-click without creds=30-50, credential theft=70-85, ransomware/active intrusion=85-100, vague reports=15-30.
Arrays should have 3-5 concise actionable items each. Keep each item under 18 words.
whyTargeted: 3-5 SPECIFIC, intelligent reasons WHY this user was likely targeted. Be psychological and personalized: leaked email in past breach, weak/reused passwords, prior risky clicks, mass campaign vs targeted, device/network vulnerabilities, social-engineering profile. Sound smart, not generic.`;

const SCHEMA_HINT = `{
  "threatType": "string", "threatTypeAr": "نوع التهديد بالعربية",
  "entryPoint": "string", "entryPointAr": "نقطة الدخول",
  "attackerBehavior": "string", "attackerBehaviorAr": "سلوك المهاجم",
  "nextMove": "string", "nextMoveAr": "الخطوة التالية",
  "riskScore": 0-100,
  "immediateActions": ["..."], "immediateActionsAr": ["..."],
  "longTermProtection": ["..."], "longTermProtectionAr": ["..."],
  "deviceHardening": ["..."], "deviceHardeningAr": ["..."],
  "whyTargeted": ["..."], "whyTargetedAr": ["..."],
  "summary": "2-sentence executive summary", "summaryAr": "ملخص تنفيذي"
}`;

export const analyzeThreat = createServerFn({ method: "POST" })
  .inputValidator((d: { description: string }) => {
    if (!d?.description || typeof d.description !== "string") throw new Error("description required");
    if (d.description.length < 10) throw new Error("description too short");
    if (d.description.length > 4000) throw new Error("description too long");
    return { description: d.description };
  })
  .handler(async ({ data }): Promise<ThreatReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM + "\nSchema:\n" + SCHEMA_HINT },
          { role: "user", content: `Suspicious activity report:\n${data.description}\n\nReturn ONLY the JSON object, no markdown.` },
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
    let parsed: ThreatReport;
    try { parsed = JSON.parse(content); }
    catch { throw new Error("AI returned invalid JSON"); }

    parsed.riskScore = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore) || 0)));
    parsed.whyTargeted = Array.isArray(parsed.whyTargeted) ? parsed.whyTargeted : [];
    parsed.whyTargetedAr = Array.isArray(parsed.whyTargetedAr) ? parsed.whyTargetedAr : [];
    return parsed;
  });
