import { useLang } from "@/lib/i18n";

export function Footer() {
  const { tr } = useLang();
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        <p className="font-mono">{tr("footer")}</p>
      </div>
    </footer>
  );
}
