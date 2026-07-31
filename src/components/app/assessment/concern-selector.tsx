import { cn } from "@/lib/utils";
import type { SkinConcern } from "./types";

const CONCERNS: {
  value: SkinConcern;
  label: string;
}[] = [
  { value: "acne", label: "Acne" },
  { value: "pigmentation", label: "Pigmentation" },
  { value: "dark-spots", label: "Dark Spots" },
  { value: "wrinkles", label: "Wrinkles" },
  { value: "dryness", label: "Dryness" },
  { value: "redness", label: "Redness" },
  { value: "blackheads", label: "Blackheads" },
  { value: "large-pores", label: "Large Pores" },
  { value: "uneven-tone", label: "Uneven Tone" },
];

interface ConcernSelectorProps {
  value: SkinConcern[];
  onChange: (value: SkinConcern[]) => void;
}

export function ConcernSelector({
  value,
  onChange,
}: ConcernSelectorProps) {
  function toggle(concern: SkinConcern) {
    if (value.includes(concern)) {
      onChange(value.filter((c) => c !== concern));
    } else {
      onChange([...value, concern]);
    }
  }

  return (
    <div className="surface-panel p-6">
      <h2 className="text-lg font-semibold">
        What are your main skin concerns?
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Select all that apply.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {CONCERNS.map((concern) => {
          const selected = value.includes(concern.value);

          return (
            <button
              key={concern.value}
              type="button"
              onClick={() => toggle(concern.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:border-primary"
              )}
            >
              {concern.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}