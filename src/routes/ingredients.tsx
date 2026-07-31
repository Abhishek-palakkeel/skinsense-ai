import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app/app-shell";
import { Input } from "@/components/ui/input";
import { services } from "@/services/container";
import { searchIngredientAI } from "@/services/ingredient-ai";
import type { Ingredient } from "@/services/types";

export const Route = createFileRoute("/ingredients")({
  head: () => ({
    meta: [
      { title: "Skincare Ingredient Intelligence — Search Actives" },
      { name: "description", content: "Search skincare actives for benefits, side effects, suitable skin types, evidence level, pregnancy safety and combinations to avoid." },
      { property: "og:title", content: "Skincare Ingredient Intelligence" },
      { property: "og:description", content: "Know what an ingredient does, who it suits and what never to mix it with." },
    ],
  }),
  component: IngredientsPage,
});

function IngredientsPage() {
  const [query, setQuery] = useState("");
  const [aiIngredient, setAiIngredient] = useState<Ingredient | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const results = useMemo(
    () => (query.trim() ? services.ingredients.search(query) : services.ingredients.all()),
    [query],
  );
  const handleAISearch = async () => {
  if (!query.trim()) return;

  setLoadingAI(true);

  try {
    const ai = await searchIngredientAI(query);

    const ingredient: Ingredient = {
      id: "ai-" + ai.name.toLowerCase().replace(/\s+/g, "-"),
      name: ai.name,
      aliases: [],
      category: ai.category,
      description: ai.description,
      benefits: ai.benefits,
      sideEffects: ai.sideEffects,
      suitableSkinTypes: ai.suitableSkinTypes,
      usage: ai.usage,
      compatibleWith: [],
      avoidMixingWith: ai.avoidMixingWith,
      avoidMixingReason: "AI generated recommendation",
      evidenceLevel: ai.evidenceLevel,
      pregnancySafe: ai.pregnancySafe,
    };

    setAiIngredient(ingredient);
  } catch (err) {
    console.error(err);
    alert("AI search failed.");
  } finally {
    setLoadingAI(false);
  }
};

  return (
    <AppShell>
      <PageHeader
        eyebrow="Intelligence"
        title="Ingredient search engine"
        description="Look up any active to see what it does, who it suits and what it should never be layered with."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search retinol, niacinamide, vitamin C…"
            className="pl-9"
            aria-label="Search ingredients"
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{results.length} ingredients</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((ing) => (
            <article key={ing.id} className="surface-panel flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{ing.name}</h2>
                  <p className="text-xs text-muted-foreground">{ing.category}</p>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] capitalize">{ing.evidenceLevel} evidence</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{ing.description}</p>

              <div className="mt-4 space-y-3 text-xs">
                <Block title="Benefits" items={ing.benefits} />
                <Block title="Possible side effects" items={ing.sideEffects} />
                <Block title="Best for" items={ing.suitableSkinTypes} inline />
                <Block title="Avoid mixing with" items={ing.avoidMixingWith} inline />
              </div>

              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <strong className="text-foreground">How to use:</strong> {ing.usage}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <strong className="text-foreground">Pregnancy:</strong>{" "}
                {ing.pregnancySafe ? "Generally considered safe" : "Avoid — ask your doctor"}
              </p>
            </article>
          ))}
        </div>

        {results.length === 0 && (
  <div className="mt-10 text-center">

    {!aiIngredient && (
      <>
        <p className="text-sm text-muted-foreground">
          No ingredient matched "{query}".
        </p>

        <button
          onClick={handleAISearch}
          disabled={loadingAI}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          {loadingAI ? "Searching AI..." : "🔍 Search with AI"}
        </button>
      </>
    )}

    {aiIngredient && (
      <div className="mt-8">

        <div className="mb-4">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
             AI Generated
          </span>
        </div>

        <article className="surface-panel mx-auto max-w-xl p-5">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="text-base font-semibold">
                {aiIngredient.name}
              </h2>

              <p className="text-xs text-muted-foreground">
                {aiIngredient.category}
              </p>
            </div>

            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px]">
              {aiIngredient.evidenceLevel} evidence
            </span>

          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {aiIngredient.description}
          </p>

          <div className="mt-4 space-y-3 text-xs">
            <Block title="Benefits" items={aiIngredient.benefits} />
            <Block title="Possible side effects" items={aiIngredient.sideEffects} />
            <Block title="Best for" items={aiIngredient.suitableSkinTypes} inline />
            <Block title="Avoid mixing with" items={aiIngredient.avoidMixingWith} inline />
          </div>

          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <strong>How to use:</strong> {aiIngredient.usage}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Pregnancy:</strong>{" "}
            {aiIngredient.pregnancySafe
              ? "Generally considered safe"
              : "Avoid — ask your doctor"}
          </p>

        </article>

      </div>
    )}

  </div>
)}
      </div>
    </AppShell>
  );
}

function Block({ title, items, inline }: { title: string; items: string[]; inline?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-medium text-foreground">{title}</p>
      {inline ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {items.map((i) => (
            <span key={i} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {i}
            </span>
          ))}
        </div>
      ) : (
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          {items.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
