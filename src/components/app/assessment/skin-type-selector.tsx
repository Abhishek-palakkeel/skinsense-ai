import { cn } from "@/lib/utils";
import type { SkinType } from "./types";

const SKIN_TYPES: {
  value: SkinType;
  title: string;
 description: string[];
  emoji: string;
}[] = [
  {
    value: "oily",
    title: "Oily",
    emoji: "🟢",
    description: [
      "Shiny after a few hours",
      "Large pores",
      "Frequent breakouts",
    ],
  },
  {
    value: "dry",
    title: "Dry",
    emoji: "🔵",
    description: [
      "Tight feeling",
      "Flaky patches",
      "Rough texture",
    ],
  },
  {
    value: "combination",
    title: "Combination",
    emoji: "🟡",
    description: [
      "Oily T-zone",
      "Dry cheeks",
      "Mixed skin",
    ],
  },
  {
    value: "normal",
    title: "Normal",
    emoji: "⚪",
    description: [
      "Balanced skin",
      "Small pores",
      "Few concerns",
    ],
  },
  {
    value: "sensitive",
    title: "Sensitive",
    emoji: "🟣",
    description: [
      "Easily irritated",
      "Redness",
      "Burns after products",
    ],
  },
];

interface SkinTypeSelectorProps {
  value?: SkinType;
  onChange: (value: SkinType) => void;
}

export function SkinTypeSelector({
  value,
  onChange,
}: SkinTypeSelectorProps) {
  return (
    <div className="surface-panel p-6">
      <h2 className="text-lg font-semibold">
        Which skin type best matches your skin?
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Select the option that most closely matches your skin.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SKIN_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "rounded-xl border p-5 text-left transition-all hover:border-primary hover:shadow-md",
              value === type.value
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-surface"
            )}
          >
            <div className="text-3xl">{type.emoji}</div>

            <h3 className="mt-3 text-lg font-semibold">
              {type.title}
            </h3>

            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {type.description.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}