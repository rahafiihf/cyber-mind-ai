import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="display text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">Signal lost in the network.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-cyber px-5 py-2 text-sm font-semibold text-primary-foreground glow-cyan">
          Return to base
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="display text-xl font-semibold">System Anomaly Detected</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-cyber px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CyberMind AI — Autonomous Cyber Threat Analyzer" },
      { name: "description", content: "AI-powered cybersecurity agent that analyzes suspicious activity and generates forensic-grade threat reports in seconds." },
      { property: "og:title", content: "CyberMind AI — Autonomous Cyber Threat Analyzer" },
      { property: "og:description", content: "AI-powered cybersecurity agent that analyzes suspicious activity and generates forensic-grade threat reports in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CyberMind AI — Autonomous Cyber Threat Analyzer" },
      { name: "twitter:description", content: "AI-powered cybersecurity agent that analyzes suspicious activity and generates forensic-grade threat reports in seconds." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8717bac7-32c3-453f-bb4d-ec4612dc79c0/id-preview-ee6985d7--b200d3b4-9ac6-4888-9987-23c96b2acb90.lovable.app-1779123491583.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8717bac7-32c3-453f-bb4d-ec4612dc79c0/id-preview-ee6985d7--b200d3b4-9ac6-4888-9987-23c96b2acb90.lovable.app-1779123491583.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Toaster theme="dark" position="top-center" />
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
