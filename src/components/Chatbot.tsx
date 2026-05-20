import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { chatWithBot } from "@/lib/chatbot.functions";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const { lang, tr, beginner } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(chatWithBot);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: lang === "ar"
          ? "أهلاً! أنا مساعد سايبر مايند الذكي. اسألني عن أي تهديد، رابط مشبوه، رسالة احتيال، أو طريقة حماية. كيف أقدر أساعدك؟"
          : "Hi! I'm CyberMind AI Assistant. Ask me about any threat, suspicious link, scam message, or how to protect yourself. How can I help?",
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fn({ data: { messages: next.slice(-12), beginner, lang } });
      setMessages([...next, { role: "assistant", content: r.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tr("error"));
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 end-6 z-40 w-14 h-14 rounded-full bg-gradient-cyber text-primary-foreground shadow-2xl glow-cyan flex items-center justify-center hover:scale-110 transition"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 end-6 z-40 w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-8rem)] glass rounded-2xl border border-cyber-cyan/30 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3 bg-gradient-to-r from-cyber-cyan/10 to-transparent">
            <div className="relative">
              <Bot className="w-6 h-6 text-cyber-cyan" />
              <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="display text-sm font-bold">{tr("bot_title")}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {beginner ? (lang === "ar" ? "وضع المبتدئ • نشط" : "Beginner mode • Active") : (lang === "ar" ? "خبير أمن سيبراني" : "Cybersecurity Expert")}
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse" />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-cyber-blue/20 text-cyber-blue" : "bg-cyber-cyan/20 text-cyber-cyan"}`}>
                  {m.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 border border-border/50"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                <div className="bg-secondary/60 border border-border/50 rounded-2xl px-3 py-2 inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={lang === "ar" ? "اسأل عن أي تهديد..." : "Ask about any threat..."}
              disabled={loading}
              maxLength={2000}
              className="flex-1 bg-input/40 rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:border-cyber-cyan"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="px-3 rounded-lg bg-gradient-cyber text-primary-foreground disabled:opacity-50 hover:scale-105 transition">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
