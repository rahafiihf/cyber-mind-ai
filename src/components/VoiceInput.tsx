import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: { length: number; [k: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SRCtor = new () => SpeechRecognitionInstance;

export function VoiceInput({
  onTranscript,
  onFinalize,
  disabled,
}: {
  onTranscript: (text: string) => void;
  onFinalize?: () => void;
  disabled?: boolean;
}) {
  const { lang } = useLang();
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseRef = useRef<string>("");

  useEffect(() => () => { recRef.current?.stop(); }, []);

  function toggle(currentValue: string) {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error(lang === "ar" ? "متصفحك لا يدعم الإدخال الصوتي. جرّب Chrome." : "Voice input not supported in this browser. Try Chrome.");
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang === "ar" ? "ar-SA" : "en-US";
    baseRef.current = currentValue ? currentValue + " " : "";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalT = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalT += r[0].transcript;
        else interim += r[0].transcript;
      }
      baseRef.current += finalT;
      onTranscript((baseRef.current + interim).trim());
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => {
      setListening(false);
      onFinalize?.();
    };
    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={() => toggle(baseRef.current)}
      disabled={disabled}
      title={lang === "ar" ? "إدخال صوتي" : "Voice input"}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg border transition ${
        listening
          ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
          : "border-border hover:border-cyber-cyan hover:text-cyber-cyan"
      }`}
    >
      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      {listening && <span className="absolute inset-0 rounded-lg ring-2 ring-destructive/50 animate-ping pointer-events-none" />}
    </button>
  );
}
