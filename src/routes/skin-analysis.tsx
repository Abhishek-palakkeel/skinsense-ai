import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app/app-shell";
import { HerbCard } from "@/components/app/herb-card";
import { ImageUploader, type UploadState } from "@/components/app/image-uploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { services } from "@/services/container";
import type { SkinHealthReport } from "@/services/types";
import type {
  SkinType,
  SkinConcern,
  Gender,
} from "@/components/app/assessment/types";
import { AssessmentProgress } from "@/components/app/assessment/assessment-progress";
import { SkinTypeSelector } from "@/components/app/assessment/skin-type-selector";
import { ConcernSelector } from "@/components/app/assessment/concern-selector";
import { BasicProfile } from "@/components/app/assessment/basic-profile";

export const Route = createFileRoute("/skin-analysis")({
  head: () => ({
    meta: [
      { title: "AI Skin Health Analysis & Care Plan" },
      { name: "description", content: "Upload a face photo to detect skin type and concerns, then generate a personalised morning and night skincare routine." },
      { property: "og:title", content: "AI Skin Health Analysis & Care Plan" },
      { property: "og:description", content: "Skin type, concerns, severity, routines and ingredient guidance from one photo." },
    ],
  }),
  component: SkinAnalysisPage,
});

function SkinAnalysisPage() {
const [upload, setUpload] = useState<UploadState | null>(null);
const [report, setReport] = useState<SkinHealthReport | null>(null);
const [running, setRunning] = useState(false);

const [currentStep, setCurrentStep] = useState(1);

const [skinType, setSkinType] = useState<SkinType>();

const [concerns, setConcerns] = useState<SkinConcern[]>([]);

const [age, setAge] = useState<number>();

const [gender, setGender] = useState<Gender>();

  async function analyse() {
    if (!upload) return;
    setRunning(true);
    try {
      const result = await services.skinHealthAnalyzer.analyze({
  imageDataUrl: upload.dataUrl,
  quality: upload.quality,

  skinType: skinType!,
  concerns,
  age: age!,
  gender: gender!,
});
      services.reports.save(result);
      setReport(result);
    } finally {
      setRunning(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Module 01"
        title="Skin Health & Beauty Assistant"
        description="Follow the steps below. Everything runs in your browser and your report is saved to your progress timeline."
        steps={["Upload photo", "Quality check", "AI analysis", "Read report", "Care plan"]}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <AssessmentProgress currentStep={currentStep} />
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">1 · Upload a clear face photo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Natural daylight, no makeup, no filters, hair off the face.
          </p>
          <div className="mt-5">
            <ImageUploader
              instructions={[
                "Face a window in daytime — avoid flash and harsh shadows.",
                "Remove makeup, glasses and filters so the AI sees your real skin.",
                "Fill the frame with your face and hold the camera steady.",
              ]}
              value={upload}
              onChange={(v) => {
                setUpload(v);
                setReport(null);
              }}
            />
          </div>
          {upload && (
  <div className="mt-6">
    <SkinTypeSelector
      value={skinType}
      onChange={(value) => {
        setSkinType(value);
        setCurrentStep(2);
      }}
    />
  </div>
)}
{upload && skinType && (
  <div className="mt-6">
    <ConcernSelector
      value={concerns}
      onChange={(value) => {
        setConcerns(value);
        setCurrentStep(3);
      }}
    />
  </div>
)}
{upload && skinType && concerns.length > 0 && (
  <div className="mt-6">
    <BasicProfile
      age={age}
      gender={gender}
      onAgeChange={setAge}
      onGenderChange={(value) => {
        setGender(value);
        setCurrentStep(4);
      }}
    />
  </div>
)}

          {upload && (
            <Button
  className="mt-6"
  disabled={
    running ||
    !upload ||
    !skinType ||
    concerns.length === 0 ||
    !age ||
    !gender
  }
  onClick={() => void analyse()}
>
              {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {running ? "Analysing your skin…" : "Run AI skin analysis"}
            </Button>
          )}
          
          {upload && !upload.quality.passed && (
            <p className="mt-3 text-xs text-warning">
              Some checks failed — you can still analyse, but confidence will be lower.
            </p>
          )}
        </section>

        {report && <SkinReportView report={report} />}
      </div>
    </AppShell>
  );
}

export function SkinReportView({ report }: { report: SkinHealthReport }) {
  const herbs = services.herbs.getByIds(report.herbIds);
  const actives = report.activeIngredientIds
    .map((id) => services.ingredients.getById(id))
    .filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">2 · Your skin health report</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Skin type" value={report.skinType} sub={`${Math.round(report.skinTypeConfidence * 100)}% confidence`} />
          <Metric label="Hydration" value={`${report.hydrationScore}`} sub="out of 100" bar={report.hydrationScore} />
          <Metric label="Barrier" value={`${report.barrierScore}`} sub="out of 100" bar={report.barrierScore} />
          <Metric label="Evenness" value={`${report.evennessScore}`} sub="out of 100" bar={report.evennessScore} />
        </div>

        <h3 className="mt-8 text-sm font-semibold">Detected concerns</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {report.concerns.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{c.label}</h4>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] capitalize">{c.severity}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(c.confidence * 100)}% confidence · {c.affectedZones.join(", ")}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {c.causes.map((cause) => (
                  <li key={cause}>• {cause}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold">3 · Your personalised care plan</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Routine title="Morning routine" steps={report.morningRoutine} />
          <Routine title="Night routine" steps={report.nightRoutine} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <h3 className="text-sm font-semibold">Active ingredients for you</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {actives.map((a) => (
                <li key={a!.id}>
                  <strong className="text-foreground">{a!.name}</strong> — {a!.usage}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-4">
            <h3 className="text-sm font-semibold">Never mix these</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              {report.avoidCombinations.map((c) => (
                <li key={c.a + c.b}>
                  <strong className="text-foreground">{c.a} + {c.b}</strong> — {c.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Bullets title="Lifestyle guidance" items={report.lifestyle} />
          <Bullets title="Nutrition suggestions" items={report.nutrition} />
          <Bullets title="Sun protection" items={[report.sunProtection]} />
          <Bullets title="Hydration advice" items={[report.hydrationAdvice]} />
        </div>
      </section>

      {herbs.length > 0 && (
        <section className="surface-panel p-6">
          <h2 className="text-lg font-semibold">4 · Traditional herbal support</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Supportive only, alongside the plan above. Always patch test first.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {herbs.map((h) => (
              <HerbCard key={h.id} herb={h} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function Metric({ label, value, sub, bar }: { label: string; value: string; sub: string; bar?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold capitalize">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      {bar !== undefined && <Progress value={bar} className="mt-3 h-1.5" />}
    </div>
  );
}

function Routine({ title, steps }: { title: string; steps: SkinHealthReport["morningRoutine"] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ol className="mt-3 space-y-3">
        {steps.map((s) => (
          <li key={s.order} className="flex gap-3 rounded-xl border border-border bg-surface-raised p-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {s.order}
            </span>
            <div>
              <p className="text-sm font-medium">{s.step} · {s.product}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
