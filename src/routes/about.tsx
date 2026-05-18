import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Shield, Cpu, Lock, Brain } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About — CyberMind AI" }] }),
});

function AboutPage() {
  const { tr } = useLang();
  const pillars = [Shield, Brain, Lock, Cpu];
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="display text-4xl sm:text-5xl font-bold text-gradient mb-4">{tr("about_title")}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{tr("about_p")}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {pillars.map((Icon, i) => (
          <div key={i} className="glass rounded-2xl p-6 flex items-center justify-center aspect-square">
            <Icon className="w-10 h-10 text-cyber-cyan" strokeWidth={1.2} />
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cyber-cyan mb-2">Contact</p>
        <a href="mailto:hello@cybermind.ai" className="text-2xl display font-bold hover:text-cyber-cyan transition">
          hello@cybermind.ai
        </a>
      </div>
    </div>
  );
}
