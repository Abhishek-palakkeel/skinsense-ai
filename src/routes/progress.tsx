import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app/app-shell";
import { services } from "@/services/container";
import type { AnyReport, SkinHealthReport } from "@/services/types";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Skin Progress Tracking — Your Report Timeline" },
      { name: "description", content: "Track your skin over time with a timeline of saved analyses, hydration and barrier trends, and before / after comparison." },
      { property: "og:title", content: "Skin Progress Tracking" },
      { property: "og:description", content: "See how your skin health scores change across saved analyses." },
    ],
  }),
  component: ProgressPage,
});

const isSkin = (r: AnyReport): r is SkinHealthReport => "skinType" in r;

function ProgressPage() {
  const [reports, setReports] = useState<AnyReport[]>([]);
  useEffect(() => setReports(services.reports.list()), []);

  const skin = reports.filter(isSkin);
  const first = skin[skin.length - 1];
  const latest = skin[0];

  return (
    <AppShell>
      <PageHeader eyebrow="Tracking" title="Your progress" description="Every analysis you run is saved here so you can compare over time." />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        {reports.length === 0 && (
          <p className="surface-panel p-8 text-sm text-muted-foreground">
            No analyses saved yet. Run a skin or lesion analysis and it will appear here.
          </p>
        )}

        {first && latest && first.id !== latest.id && (
          <section className="surface-panel p-6">
            <h2 className="text-lg font-semibold">Before / after</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[first, latest].map((r, i) => (
                <div key={r.id}>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {i === 0 ? "First analysis" : "Latest analysis"}
                  </p>
                  <img src={r.imageDataUrl} alt={`Skin analysis from ${new Date(r.createdAt).toLocaleDateString()}`} className="aspect-square w-full rounded-xl object-cover" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Hydration {r.hydrationScore} · Barrier {r.barrierScore} · Evenness {r.evennessScore}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {reports.length > 0 && (
          <section className="surface-panel p-6">
            <h2 className="text-lg font-semibold">Timeline</h2>
            <ol className="mt-4 space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-4">
                  <img src={r.imageDataUrl} alt="Saved analysis thumbnail" className="size-14 rounded-lg object-cover" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {isSkin(r) ? `Skin health · ${r.skinType}` : `Disease analysis · ${r.topPrediction.label}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      services.reports.remove(r.id);
                      setReports(services.reports.list());
                    }}
                    className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </AppShell>
  );
}
