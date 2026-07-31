import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, LineChart, MessageSquare, ScanFace, ShieldCheck, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Skin Intelligence Platform — Skin Health & Disease Analysis" },
      {
        name: "description",
        content:
          "Upload a photo, get an AI skin health report, a personalised care plan, ingredient intelligence and educational dermatology analysis in one guided workflow.",
      },
      { property: "og:title", content: "AI Skin Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Two AI systems, one premium dashboard: cosmetic skin health analysis and educational skin disease analysis.",
      },
    ],
  }),
  component: Dashboard,
});

const MODULES = [
  {
    to: "/skin-analysis" as const,
    icon: ScanFace,
    tag: "Module 01",
    title: "Skin Health & Beauty",
    body: "Detect your skin type and concerns, then generate a morning and night routine built from evidence-based actives.",
    steps: ["Upload face photo", "Quality check", "Skin report", "Care plan"],
  },
  {
    to: "/disease-analysis" as const,
    icon: Stethoscope,
    tag: "Module 02",
    title: "Skin Disease Analysis",
    body: "Educational computer-vision analysis of a lesion photo with probabilities, explainability and similar documented cases.",
    steps: ["Upload lesion photo", "Quality check", "Probability report", "Guidance"],
  },
];

const TOOLS = [
  { to: "/ingredients" as const, icon: FlaskConical, title: "Ingredient intelligence", body: "Search any active for benefits, side effects and what never to mix it with." },
  { to: "/assistant" as const, icon: MessageSquare, title: "AI assistant", body: "Ask skincare questions and get answers grounded in the knowledge base." },
  { to: "/progress" as const, icon: LineChart, title: "Progress tracking", body: "Compare reports over time with a timeline, charts and before / after." },
];

function Dashboard() {
  return (
    <AppShell>
      <section className="relative overflow-hidden border-b border-border/70 hero-glow">
        <div className="pointer-events-none absolute inset-0 grid-fade" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Cosmetic & educational AI · not a diagnosis
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Understand your skin
              <span className="text-gradient"> in one photo.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Two AI systems in one workspace: a skin health and beauty assistant that builds your
              routine, and an educational disease analysis engine that explains what it sees.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/skin-analysis"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start skin analysis <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/disease-analysis"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Analyse a lesion
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.45 }}
            >
              <Link to={m.to} className="surface-panel group flex h-full flex-col p-7 transition-colors hover:bg-surface-raised">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <m.icon className="size-5" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{m.tag}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{m.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                <ol className="mt-5 flex flex-wrap gap-2">
                  {m.steps.map((s, idx) => (
                    <li key={s} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                      {idx + 1}. {s}
                    </li>
                  ))}
                </ol>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open workflow <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="surface-panel p-6 transition-colors hover:bg-surface-raised">
              <t.icon className="size-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
