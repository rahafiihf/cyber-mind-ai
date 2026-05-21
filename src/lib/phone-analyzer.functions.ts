import { createServerFn } from "@tanstack/react-start";

export type PhoneReport = {
  scamScore: number;
  verdict: "safe" | "suspicious" | "scam" | "dangerous";
  verdictAr: string;
  fraudType: string;
  fraudTypeAr: string;
  impersonates: string | null;
  impersonatesAr: string | null;
  manipulationTactics: string[];
  manipulationTacticsAr: string[];
  redFlags: string[];
  redFlagsAr: string[];
  whyDangerous: string;
  whyDangerousAr: string;
  recommendedActions: string[];
  recommendedActionsAr: string[];
  elderlyTarget: boolean;
  summary: string;
  summaryAr: string;
  parsedNumber: string;
};

const SYSTEM = `You are CyberMind AI, an elite anti-fraud analyst specializing in scam phone calls and fraudulent numbers.
Given a phone number (and optionally a description of the call), analyze for: bank impersonation, government/ministry impersonation, social security scams, fake authority, ATM withdrawal scams, romance scams, lottery scams, tech support scams, and elderly-targeted fraud.
Return ONLY valid JSON. Provide BOTH English and Arabic for every text field.
verdict: "safe" | "suspicious" | "scam" | "dangerous".
scamScore: integer 0-100. safe<25, suspicious 30-55, scam 65-85, dangerous 85-100.
impersonates: if scammer pretends to be a known entity (e.g. "Saudi Social Security", "Al Rajhi Bank", "Ministry of Interior"), name it. Else null.
manipulationTactics: choose from: Fear & Urgency, Financial Temptation, Fake Authority, Emotional Manipulation, Curiosity Bait, Social Engineering, Pressure Tactics, Isolation. Pick the ones that apply with a SHORT explanation of how it's used. 2-5 items.
redFlags: 3-6 specific red flags spotted (e.g. "Caller asked to transfer to a personal account", "Used spoofed caller ID", "Demanded immediate ATM withdrawal").
recommendedActions: 3-5 concrete actions. Keep each under 18 words.
elderlyTarget: true if the pattern (fake authority + urgency + ATM/bank pressure + lonely-victim targeting) commonly targets elderly people.
Even without context, infer risk from number patterns: unknown international codes, premium-rate prefixes, suspicious short codes, spoofed-looking patterns.`;

const SCHEMA = `{
  "scamScore": 0-100,
  "verdict": "safe|suspicious|scam|dangerous", "verdictAr": "...",
  "fraudType": "...", "fraudTypeAr": "...",
  "impersonates": "string or null", "impersonatesAr": "string or null",
  "manipulationTactics": ["..."], "manipulationTacticsAr": ["..."],
  "redFlags": ["..."], "redFlagsAr": ["..."],
  "whyDangerous": "...", "whyDangerousAr": "...",
  "recommendedActions": ["..."], "recommendedActionsAr": ["..."],
  "elderlyTarget": true|false,
  "summary": "2-sentence executive summary", "summaryAr": "..."
}`;

function normalizeNumber(n: string): string {
  return n.replace(/[^\d+]/g, "").slice(0, 30);
}

export const analyzePhone = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; context?: string }) => {
    if (!d?.phone || typeof d.phone !== "string") throw new Error("phone required");
    const phone = d.phone.trim();
    if (phone.length < 3 || phone.length > 30) throw new Error("invalid phone length");
    const context = (d.context ?? "").trim();
    if (context.length > 50000) throw new Error("context too long");
    return { phone, context };
  })
  .handler(async ({ data }): Promise<PhoneReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const normalized = normalizeNumber(data.phone);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM + "\nSchema:\n" + SCHEMA },
          { role: "user", content: `Analyze this phone number for scam/fraud risk:\nNumber: ${data.phone}\nNormalized: ${normalized}\n${data.context ? `\nWhat the caller said / context:\n${data.context}` : "\n(No call context provided — analyze number patterns only.)"}\n\nReturn ONLY the JSON object.` },
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
    let parsed: PhoneReport;
    try { parsed = JSON.parse(content); }
    catch { throw new Error("AI returned invalid JSON"); }

    parsed.scamScore = Math.max(0, Math.min(100, Math.round(Number(parsed.scamScore) || 0)));
    parsed.parsedNumber = normalized || data.phone;
    parsed.manipulationTactics = Array.isArray(parsed.manipulationTactics) ? parsed.manipulationTactics : [];
    parsed.manipulationTacticsAr = Array.isArray(parsed.manipulationTacticsAr) ? parsed.manipulationTacticsAr : [];
    parsed.redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags : [];
    parsed.redFlagsAr = Array.isArray(parsed.redFlagsAr) ? parsed.redFlagsAr : [];
    parsed.recommendedActions = Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [];
    parsed.recommendedActionsAr = Array.isArray(parsed.recommendedActionsAr) ? parsed.recommendedActionsAr : [];
    parsed.elderlyTarget = Boolean(parsed.elderlyTarget);
    return parsed;
  });
