import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20000),
});

const SYSTEM_EN = `You are CyberMind AI Assistant, an elite cybersecurity expert chatbot embedded in a security app.
You ONLY answer cybersecurity questions: phishing, scams, scam calls, malware, ransomware, account safety, social engineering, OSINT, device hardening, network security, privacy, password hygiene, 2FA, OAuth, suspicious links, leaked data, incident response.
If asked something unrelated, politely redirect: "I'm specialized in cybersecurity — ask me about threats, scams, or how to protect yourself."
Be concise, practical, and tactical. Use short paragraphs and bullet points. Avoid disclaimers. Speak with calm confidence.
If user writes Arabic, reply in Arabic. If English, reply in English. Match their language.`;

export const chatWithBot = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      messages: z.array(MessageSchema).min(1).max(20),
      lang: z.enum(["en", "ar"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_EN }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = json.choices?.[0]?.message?.content ?? "";
    return { reply: reply.trim() || "..." };
  });
