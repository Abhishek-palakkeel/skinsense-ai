import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app/app-shell";
import { HerbCard } from "@/components/app/herb-card";
import { ImageUploader, type UploadState } from "@/components/app/image-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { services } from "@/services/container";
import { SIMILAR_CASES } from "@/services/disease.analyzer";
import type { DiseaseReport } from "@/services/types";

export const Route = createFileRoute("/disease-analysis")({
  head: () => ({
    meta: [
      { title: "AI Skin Disease Analysis — Educational Report" },
      { name: "description", content: "Upload a lesion photo for educational computer-vision analysis with probabilities, explainability, care guidance and similar documented cases." },
      { property: "og:title", content: "AI Skin Disease Analysis" },
      { property: "og:description", content: "Educational dermatology image analysis with explainable AI. Never a diagnosis or prescription." },
    ],
  }),
  component: DiseasePage,
});

function DiseasePage() {
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [report, setReport] = useState<DiseaseReport | null>(null);
  const [running, setRunning] = useState(false);

  async function analyse() {
    if (!upload) return;
    setRunning(true);
    try {
      const result = await services.diseaseAnalyzer.analyze({
        imageDataUrl: upload.dataUrl,
        quality: upload.quality,
      });
      services.reports.save(result);
      setReport(result);
    } finally {
      setRunning(false);
    }
  }

  const cases = report ? SIMILAR_CASES.filter((c) => report.similarCaseIds.includes(c.id)) : [];
  const herbs = report ? services.herbs.getByIds(report.herbIds) : [];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Module 02"
        title="Skin Disease Analysis"
        description="An educational computer-vision workflow. It explains what the model sees and when to consult a dermatologist. It never diagnoses or prescribes."
        steps={["Upload lesion", "Quality check", "Analysis", "Report", "Similar cases"]}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">1 · Upload a close-up of the lesion</h2>
          <div className="mt-5">
            <ImageUploader
              accentClass="bg-clinical text-clinical-foreground"
              instructions={[
                "Take the photo 10-15 cm from the skin, in even daylight.",
                "Include the whole lesion plus a little surrounding normal skin.",
                "Do not apply creams or makeup before photographing.",
              ]}
              value={upload}
              onChange={(v) => {
                setUpload(v);
                setReport(null);
              }}
            />
          </div>
          {upload && (
            <Button className="mt-6" disabled={running} onClick={() => void analyse()}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <Stethoscope className="size-4" />}
              {running ? "Running analysis…" : "Run educational analysis"}
            </Button>
          )}
        </section>

        {report && (
          <>
            <section className="surface-panel p-6">
              <h2 className="text-lg font-semibold">2 · Analysis report</h2>
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Most likely pattern</p>
                  <p className="mt-1 text-2xl font-semibold">{report.topPrediction.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(report.topPrediction.probability * 100)}% model confidence · urgency: {report.urgency}
                  </p>
                  <div className="mt-5 space-y-3">
                    {report.predictions.map((p) => (
                      <div key={p.id}>
                        <div className="flex justify-between text-xs">
                          <span>{p.label}</span>
                          <span className="text-muted-foreground">{Math.round(p.probability * 100)}%</span>
                        </div>
                        <Progress value={p.probability * 100} className="mt-1 h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Explainability — {report.explanation.method}
                  </p>
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
                    <img src={report.imageDataUrl} alt="Analysed lesion with attention overlay" className="aspect-square w-full object-cover" />
                    {report.explanation.regions.map((r, i) => (
                      <span
                        key={i}
                        className="pointer-events-none absolute rounded-full bg-clinical/40 blur-xl"
                        style={{
                          left: `${(r.x - r.radius) * 100}%`,
                          top: `${(r.y - r.radius) * 100}%`,
                          width: `${r.radius * 200}%`,
                          height: `${r.radius * 200}%`,
                          opacity: r.weight * 0.8,
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{report.explanation.summary}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <List title="Typical symptoms" items={report.symptoms} />
                <List title="Causes" items={report.causes} />
                <List title="Risk factors" items={report.riskFactors} />
                <List title="Possible complications" items={report.complications} />
                <List title="General care advice" items={report.careAdvice} />
                <List title="Warning signs" items={report.warningSigns} tone="warning" />
              </div>

              <div className="mt-6 rounded-xl border border-clinical/30 bg-clinical/8 p-4">
                <h3 className="text-sm font-semibold">When to consult a dermatologist</h3>
                <p className="mt-1 text-sm text-muted-foreground">{report.consultAdvice}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  This platform does not prescribe medication of any kind.
                </p>
              </div>
            </section>

            {cases.length > 0 && (
              <section className="surface-panel p-6">
                <h2 className="text-lg font-semibold">3 · Similar documented cases</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {cases.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-surface-raised p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{c.title}</h3>
                        <span className="text-xs text-muted-foreground">{Math.round(c.similarity * 100)}% similar</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{c.presentation}</p>
                      <p className="mt-1 text-xs text-muted-foreground"><strong className="text-foreground">Outcome:</strong> {c.outcome}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {herbs.length > 0 && (
              <section className="surface-panel p-6">
                <h2 className="text-lg font-semibold">4 · Traditional herbal support</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {herbs.map((h) => (
                    <HerbCard key={h.id} herb={h} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: "warning" }) {
  return (
    <div className={`rounded-xl border p-4 ${tone === "warning" ? "border-warning/30 bg-warning/8" : "border-border bg-surface-raised"}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
