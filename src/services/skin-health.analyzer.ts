import type {
  DetectedConcern,
  IImageQualityService,
  ImageQualityReport,
  ISkinHealthAnalyzer,
  RoutineStep,
  Severity,
  SkinHealthReport,
  SkinType,
} from "./types";
import { hashString, pick, rng } from "./utils";

/**
 * MOCK implementation of the skin health vision model.
 *
 * Contract: `analyze({ imageDataUrl, quality })` -> SkinHealthReport.
 * The result is deterministic per image (hash-seeded), so re-analysing the
 * same photo yields the same report, and image quality genuinely influences
 * confidence values.
 *
 * To integrate a real model: implement ISkinHealthAnalyzer against your
 * inference endpoint (see docs/MODEL_INTEGRATION.md) and register it in
 * src/services/container.ts. Nothing in the UI changes.
 */
export class MockSkinHealthAnalyzer implements ISkinHealthAnalyzer {
  constructor(private readonly latencyMs = 1800) {}

  async analyze({
  imageDataUrl,
  quality,
  skinType,
  concerns: selectedConcerns,
  age,
  gender,
}: {
  imageDataUrl: string;
  quality: ImageQualityReport;

  skinType: SkinType;
  concerns: string[];

  age: number;
  gender: string;
}): Promise<SkinHealthReport> {
    await new Promise((r) => setTimeout(r, this.latencyMs));

    const seed = hashString(imageDataUrl);
    const rand = rng(seed);
    const qualityFactor = 0.75 + quality.overallScore * 0.25;

    const concerns = buildConcerns(
  skinType,
  selectedConcerns,
  rand,
  qualityFactor,
);
    const activeIngredientIds = activesFor(skinType, concerns);

    return {
      id: crypto.randomUUID(),
      kind: "skin-health",
      createdAt: new Date().toISOString(),
      imageDataUrl,
      skinType,
      skinTypeConfidence: round(0.72 + rand() * 0.24 * qualityFactor),
      hydrationScore: score(rand, skinType === "dry" ? 45 : 68),
      barrierScore: score(rand, skinType === "sensitive" ? 52 : 74),
      evennessScore: score(rand, 66),
      overallScore: score(rand, 71),
      concerns,
      morningRoutine: morningRoutine(skinType, activeIngredientIds),
      nightRoutine: nightRoutine(skinType, activeIngredientIds),
      activeIngredientIds,
      avoidCombinations: [
        {
          a: "Retinol",
          b: "Glycolic acid",
          reason: "Stacked exfoliation on the same night compromises the barrier. Alternate nights.",
        },
        {
          a: "Vitamin C",
          b: "Benzoyl peroxide",
          reason: "Benzoyl peroxide oxidises ascorbic acid, cancelling both actives.",
        },
      ],
      lifestyle: lifestyleFor(skinType, concerns),
      nutrition: [
        "Aim for 2-2.5 litres of water spread through the day rather than in bursts.",
        "Include omega-3 sources (sardines, flaxseed, walnuts) 3-4 times a week for barrier lipids.",
        "Add one vitamin-C rich fruit daily — amla, guava or citrus — to support collagen.",
        "Reduce high-glycaemic snacks and excess dairy if breakouts flare cyclically.",
      ],
      sunProtection:
        "Broad-spectrum SPF 50 every morning, two finger-lengths for face and neck, reapplied every 3 hours of daylight exposure. This is the single highest-impact step in this plan.",
      hydrationAdvice:
        skinType === "oily"
          ? "Use a lightweight gel moisturiser with hyaluronic acid and niacinamide — oily skin still dehydrates, and stripping it increases oil production."
          : "Apply moisturiser to slightly damp skin within 60 seconds of cleansing to trap water, and seal with a ceramide cream at night.",
      herbIds: herbsFor(concerns),
    };
  }
}

function buildConcerns(
  skinType: SkinType,
  selectedConcerns: string[],
  rand: () => number,
  qualityFactor: number,
): DetectedConcern[] {
  const catalogue: Record<string, Omit<DetectedConcern, "severity" | "confidence">> = {
    acne: {
      id: "acne",
      label: "Inflammatory breakouts",
      affectedZones: ["Chin", "Jawline"],
      causes: [
        "Excess sebum combined with follicular hyperkeratinisation",
        "Hormonal fluctuation across the cycle",
        "Comedogenic products or occlusive sunscreen",
      ],
    },
    congestion: {
      id: "congestion",
      label: "Pore congestion & blackheads",
      affectedZones: ["Nose", "Forehead"],
      causes: ["Sebum oxidising in the pore lining", "Infrequent chemical exfoliation"],
    },
    pigmentation: {
      id: "pigmentation",
      label: "Uneven tone & dark marks",
      affectedZones: ["Cheeks", "Upper lip"],
      causes: [
        "Post-inflammatory response to past breakouts",
        "Cumulative UV exposure without daily SPF",
      ],
    },
    dehydration: {
      id: "dehydration",
      label: "Dehydration lines",
      affectedZones: ["Under-eye", "Cheeks"],
      causes: ["Impaired barrier lipids", "Over-cleansing with high-pH foaming washes"],
    },
    redness: {
      id: "redness",
      label: "Diffuse redness & sensitivity",
      affectedZones: ["Central cheeks", "Nose"],
      causes: ["Barrier disruption from active overload", "Heat, spice and sun triggers"],
    },
    dullness: {
      id: "dullness",
      label: "Dullness & rough texture",
      affectedZones: ["Full face"],
      causes: ["Slowed cell turnover", "Dead cell build-up on the surface"],
    },
  };

  const base: Record<SkinType, string[]> = {
    oily: ["acne", "congestion", "pigmentation"],
    dry: ["dehydration", "dullness", "redness"],
    combination: ["congestion", "dehydration", "pigmentation"],
    normal: ["dullness", "pigmentation"],
    sensitive: ["redness", "dehydration", "dullness"],
  };
  const mappedConcerns = selectedConcerns
  .map((c) => {
    switch (c) {
      case "acne":
        return "acne";

      case "pigmentation":
        return "pigmentation";

      case "dark-spots":
        return "pigmentation";

      case "wrinkles":
        return "dullness";

      case "dryness":
        return "dehydration";

      case "redness":
        return "redness";

      case "blackheads":
        return "congestion";

      case "large-pores":
        return "congestion";

      case "uneven-tone":
        return "pigmentation";

      default:
        return null;
    }
  })
  .filter(Boolean) as string[];

  const ids =
  mappedConcerns.length > 0 ? mappedConcerns : base[skinType];

return ids.map((id, index) => {
  const raw = 0.55 + rand() * 0.4;

  const severity: Severity =
    index === 0 ? "moderate" : raw > 0.8 ? "moderate" : "mild";

  return {
    ...catalogue[id],
    severity,
    confidence: round(Math.min(0.97, raw * qualityFactor + 0.1)),
  };
});

}

function activesFor(skinType: SkinType, concerns: DetectedConcern[]) {
  const ids = new Set<string>(["spf", "niacinamide"]);
  for (const c of concerns) {
    if (c.id === "acne") ids.add("salicylic-acid");
    if (c.id === "congestion") ids.add("salicylic-acid");
    if (c.id === "pigmentation") {
      ids.add("vitamin-c");
      ids.add("azelaic-acid");
    }
    if (c.id === "dehydration") ids.add("hyaluronic-acid");
    if (c.id === "redness") ids.add("ceramides");
    if (c.id === "dullness") ids.add("retinol");
  }
  if (skinType === "sensitive") ids.delete("retinol");
  if (skinType === "dry") ids.add("ceramides");
  return [...ids];
}

function morningRoutine(skinType: SkinType, actives: string[]): RoutineStep[] {
  const steps: RoutineStep[] = [
    {
      order: 1,
      step: "Cleanse",
      product: skinType === "dry" || skinType === "sensitive" ? "Cream cleanser" : "Gentle gel cleanser",
      ingredientIds: [],
      note: "Lukewarm water, 30 seconds, no scrubbing.",
    },
    {
      order: 2,
      step: "Treat",
      product: actives.includes("vitamin-c") ? "Vitamin C antioxidant serum" : "Niacinamide serum",
      ingredientIds: actives.includes("vitamin-c") ? ["vitamin-c"] : ["niacinamide"],
      note: "Apply to dry skin and wait 60 seconds before the next step.",
    },
    {
      order: 3,
      step: "Hydrate",
      product: skinType === "oily" ? "Oil-free gel moisturiser" : "Ceramide moisturiser",
      ingredientIds: ["hyaluronic-acid", "ceramides"],
      note: "Apply on slightly damp skin.",
    },
    {
      order: 4,
      step: "Protect",
      product: "Broad-spectrum SPF 50",
      ingredientIds: ["spf"],
      note: "Non-negotiable. Two finger-lengths, every single morning.",
    },
  ];
  return steps;
}

function nightRoutine(skinType: SkinType, actives: string[]): RoutineStep[] {
  const treat = actives.includes("retinol")
    ? { product: "Retinol 0.3% (2-3 nights per week)", ids: ["retinol"] }
    : actives.includes("salicylic-acid")
      ? { product: "Salicylic acid 2% (alternate nights)", ids: ["salicylic-acid"] }
      : { product: "Azelaic acid 10%", ids: ["azelaic-acid"] };

  return [
    {
      order: 1,
      step: "Double cleanse",
      product: "Cleansing balm, then your gentle cleanser",
      ingredientIds: [],
      note: "Only on days you wore sunscreen or makeup — which should be every day.",
    },
    {
      order: 2,
      step: "Treat",
      product: treat.product,
      ingredientIds: treat.ids,
      note: "Start twice weekly and build up. Skip if skin feels raw.",
    },
    {
      order: 3,
      step: "Repair",
      product: "Niacinamide + ceramide serum",
      ingredientIds: ["niacinamide", "ceramides"],
      note: "Buffers active irritation and rebuilds the barrier overnight.",
    },
    {
      order: 4,
      step: "Seal",
      product: skinType === "oily" ? "Light gel-cream" : "Rich barrier cream",
      ingredientIds: ["ceramides"],
      note: "Final step — nothing goes on top.",
    },
  ];
}

function lifestyleFor(skinType: SkinType, concerns: DetectedConcern[]) {
  const tips = [
    "Change your pillowcase twice a week — it is the cheapest acne intervention there is.",
    "Protect 7-8 hours of sleep; barrier repair peaks overnight.",
    "Clean your phone screen daily if breakouts cluster on one cheek.",
    "Introduce one new active at a time and give it 6 weeks before judging it.",
  ];
  if (concerns.some((c) => c.id === "redness")) {
    tips.push("Track heat, spice and alcohol triggers for two weeks to find your redness pattern.");
  }
  if (skinType === "oily") {
    tips.push("Blot rather than re-wash during the day — over-cleansing rebounds into more oil.");
  }
  return tips;
}

function herbsFor(concerns: DetectedConcern[]) {
  const ids = new Set<string>();
  for (const c of concerns) {
    if (c.id === "acne") {
      ids.add("neem");
      ids.add("turmeric");
    }
    if (c.id === "redness") ids.add("sandalwood");
    if (c.id === "dehydration") ids.add("rose-water");
    if (c.id === "pigmentation") ids.add("sandalwood");
    if (c.id === "dullness") ids.add("aloe-vera");
  }
  if (!ids.size) ids.add("aloe-vera");
  return [...ids].slice(0, 3);
}

const round = (n: number) => Math.round(n * 100) / 100;
const score = (rand: () => number, centre: number) =>
  Math.max(20, Math.min(97, Math.round(centre + (rand() - 0.5) * 22)));

export { MockSkinHealthAnalyzer as SkinHealthAnalyzer };
export type { IImageQualityService };
