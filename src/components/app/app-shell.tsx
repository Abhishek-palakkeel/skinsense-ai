import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, FlaskConical, LineChart, MessageSquare, ScanFace, Sparkles, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/skin-analysis", label: "Skin Health", icon: ScanFace },
  { to: "/disease-analysis", label: "Disease Analysis", icon: Stethoscope },
  { to: "/ingredients", label: "Ingredients", icon: FlaskConical },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/progress", label: "Progress", icon: LineChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              SkinSense AI
            </span>
          </Link>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
          <p className="max-w-3xl leading-relaxed">
            <strong className="text-foreground">Responsible AI notice.</strong> This platform
            provides cosmetic and educational guidance only. It does not diagnose disease,
            prescribe medication, or replace an in-person dermatology consultation. Analysis
            currently runs on documented mock inference services with real image quality checks.
          </p>
          <p className="mt-4">© {new Date().getFullYear()} AI Skin Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description: string;
  steps?: string[];
}) {
  return (
    <div className="border-b border-border/70 hero-glow">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        {steps && (
          <ol className="mt-6 flex flex-wrap gap-2">
            {steps.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground"
              >
                <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
