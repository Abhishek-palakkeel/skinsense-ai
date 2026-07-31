import type { IImageQualityService, ImageQualityReport, QualityCheck } from "./types";

/**
 * Real, in-browser image quality assessment.
 * Uses canvas pixel analysis: Laplacian variance for blur, mean luminance for
 * exposure, pixel count for resolution and skin-tone coverage for subject
 * presence. No external model required.
 */
export class CanvasImageQualityService implements IImageQualityService {
  async assess(file: File): Promise<ImageQualityReport> {
    const bitmap = await createImageBitmap(file);
    const maxSide = 480;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    const gray = new Float32Array(w * h);
    let luminanceSum = 0;
    let skinPixels = 0;

    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[i] = y;
      luminanceSum += y;
      if (isSkinTone(r, g, b)) skinPixels++;
    }

    const meanLuminance = luminanceSum / (w * h);
    const skinRatio = skinPixels / (w * h);
    const sharpness = laplacianVariance(gray, w, h);

    const megapixels = (bitmap.width * bitmap.height) / 1_000_000;
    bitmap.close?.();

    const checks: QualityCheck[] = [
      {
        id: "resolution",
        label: "Resolution",
        score: clamp01(megapixels / 1.2),
        passed: bitmap.width >= 480 && bitmap.height >= 480,
        detail: `${bitmap.width} × ${bitmap.height} px (${megapixels.toFixed(1)} MP)`,
      },
      {
        id: "blur",
        label: "Sharpness",
        score: clamp01(sharpness / 300),
        passed: sharpness >= 60,
        detail:
          sharpness >= 60
            ? "Edges are crisp enough for analysis"
            : "Image looks soft or motion-blurred",
      },
      {
        id: "brightness",
        label: "Lighting",
        score: clamp01(1 - Math.abs(meanLuminance - 135) / 135),
        passed: meanLuminance > 70 && meanLuminance < 205,
        detail:
          meanLuminance <= 70
            ? "Too dark — move towards a window"
            : meanLuminance >= 205
              ? "Overexposed — reduce direct light"
              : "Even, natural lighting detected",
      },
      {
        id: "subject",
        label: "Skin visibility",
        score: clamp01(skinRatio / 0.35),
        passed: skinRatio >= 0.12,
        detail: `${Math.round(skinRatio * 100)}% of the frame contains skin tones`,
      },
    ];

    const overallScore =
      checks.reduce((sum, c) => sum + c.score, 0) / checks.length;
    const guidance = checks.filter((c) => !c.passed).map((c) => guidanceFor(c.id));

    return {
      passed: checks.every((c) => c.passed),
      overallScore,
      checks,
      guidance: guidance.length
        ? guidance
        : ["This image meets every quality check. You can run the analysis."],
    };
  }
}

function guidanceFor(id: QualityCheck["id"]): string {
  switch (id) {
    case "resolution":
      return "Use an image of at least 480 × 480 pixels — retake with your main camera rather than a screenshot.";
    case "blur":
      return "Hold the camera steady, tap to focus on the skin, and retake the photo.";
    case "brightness":
      return "Face a window in daytime. Avoid direct flash and heavy shadows.";
    case "subject":
      return "Fill more of the frame with the skin area you want analysed, and remove makeup or filters.";
  }
}

function laplacianVariance(gray: Float32Array, w: number, h: number) {
  const values: number[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const v =
        -4 * gray[i] + gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w];
      values.push(v);
    }
  }
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
}

function isSkinTone(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (
    r > 60 &&
    g > 30 &&
    b > 15 &&
    r > b &&
    max - min > 10 &&
    Math.abs(r - g) > 8
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
