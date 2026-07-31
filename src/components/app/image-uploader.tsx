import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { services } from "@/services/container";
import { fileToDataUrl } from "@/services/image-quality.service";
import type { ImageQualityReport } from "@/services/types";

export interface UploadState {
  dataUrl: string;
  quality: ImageQualityReport;
}

export function ImageUploader({
  accentClass = "bg-primary text-primary-foreground",
  instructions,
  value,
  onChange,
}: {
  accentClass?: string;
  instructions: string[];
  value: UploadState | null;
  onChange: (value: UploadState | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Upload a JPG, PNG or HEIC photo.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image is larger than 12 MB. Please use a smaller photo.");
      return;
    }
    setError(null);
    setChecking(true);
    try {
      const [dataUrl, quality] = await Promise.all([
        fileToDataUrl(file),
        services.imageQuality.assess(file),
      ]);
      onChange({ dataUrl, quality });
    } catch {
      setError("We couldn't read that image. Try a different file.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-2 text-sm text-muted-foreground">
        {instructions.map((line, i) => (
          <li key={line} className="flex gap-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
              {i + 1}
            </span>
            {line}
          </li>
        ))}
      </ol>

      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface px-6 py-14 text-center transition-colors",
            dragging && "border-primary bg-primary/5",
          )}
        >
          {checking ? (
            <>
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Running image quality checks…</p>
            </>
          ) : (
            <>
              <span className={cn("grid size-12 place-items-center rounded-full", accentClass)}>
                <ImagePlus className="size-5" />
              </span>
              <p className="mt-4 text-sm font-medium">Drag a photo here, or choose a file</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG or PNG · at least 480 × 480 px · up to 12 MB
              </p>
              <Button className="mt-5" onClick={() => inputRef.current?.click()}>
                Choose image
              </Button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 md:grid-cols-2"
        >
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
            <img
              src={value.dataUrl}
              alt="Uploaded skin photograph awaiting analysis"
              className="aspect-square w-full object-cover"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-3 top-3"
              onClick={() => onChange(null)}
            >
              <RotateCcw className="size-3.5" /> Replace
            </Button>
          </div>
          <QualityPanel quality={value.quality} />
        </motion.div>
      )}

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}

export function QualityPanel({ quality }: { quality: ImageQualityReport }) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Image quality check</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            quality.passed
              ? "bg-success/15 text-success"
              : "bg-warning/15 text-warning",
          )}
        >
          {quality.passed ? "Ready to analyse" : "Needs attention"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {quality.checks.map((check) => (
          <div key={check.id}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                {check.passed ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <AlertTriangle className="size-3.5 text-warning" />
                )}
                {check.label}
              </span>
              <span className="text-muted-foreground">{Math.round(check.score * 100)}%</span>
            </div>
            <Progress value={check.score * 100} className="mt-1.5 h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{check.detail}</p>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        {quality.guidance.map((g) => (
          <li key={g}>• {g}</li>
        ))}
      </ul>
    </div>
  );
}
