import { useEffect, useState } from "react";

interface Props { score: number; label: string; }

export function RiskMeter({ score, label }: Props) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let r = 0;
    const id = setInterval(() => {
      r += Math.max(1, Math.floor((score - r) / 6));
      if (r >= score) { r = score; clearInterval(id); }
      setVal(r);
    }, 30);
    return () => clearInterval(id);
  }, [score]);

  const color = score >= 80 ? "var(--danger)" : score >= 50 ? "var(--warning)" : "var(--success)";
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (val / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" stroke="oklch(0.25 0.05 250)" strokeWidth="10" fill="none" />
          <circle
            cx="80" cy="80" r="70" fill="none" strokeWidth="10"
            stroke={color} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s", filter: `drop-shadow(0 0 12px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold display" style={{ color, textShadow: `0 0 20px ${color}` }}>{val}</span>
          <span className="text-xs text-muted-foreground font-mono mt-1">/ 100</span>
        </div>
      </div>
      <p className="text-sm uppercase tracking-widest font-mono text-muted-foreground">{label}</p>
    </div>
  );
}
