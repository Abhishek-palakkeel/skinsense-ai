import ingredientsData from "@/data/ingredients.json";
import type { IIngredientService, Ingredient } from "./types";

/**
 * JSON-backed ingredient intelligence engine.
 * Later this can be swapped for an LLM-backed IIngredientService (Grok, RAG)
 * without touching the UI — the interface stays identical.
 */
export class JsonIngredientService implements IIngredientService {
  private readonly data = ingredientsData as Ingredient[];

  all() {
    return this.data;
  }

  getById(id: string) {
    return this.data.find((i) => i.id === id);
  }

  search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return this.data;
    return this.data
      .map((item) => ({ item, score: this.score(item, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
  }

  checkCompatibility(a: string, b: string) {
    const first = this.getById(a);
    const second = this.getById(b);
    if (!first || !second) {
      return { compatible: true, reason: "One of these ingredients is not in the knowledge base yet." };
    }
    if (first.avoidMixingWith.includes(b) || second.avoidMixingWith.includes(a)) {
      return {
        compatible: false,
        reason: first.avoidMixingWith.includes(b) ? first.avoidMixingReason : second.avoidMixingReason,
      };
    }
    if (first.compatibleWith.includes(b) || second.compatibleWith.includes(a)) {
      return { compatible: true, reason: `${first.name} and ${second.name} layer well together.` };
    }
    return {
      compatible: true,
      reason: `No known conflict between ${first.name} and ${second.name}. Introduce them one at a time.`,
    };
  }

  private score(item: Ingredient, q: string) {
    if (item.name.toLowerCase() === q) return 100;
    if (item.name.toLowerCase().startsWith(q)) return 80;
    if (item.aliases.some((a) => a.toLowerCase().includes(q))) return 60;
    if (item.category.toLowerCase().includes(q)) return 40;
    if (item.benefits.some((bfit) => bfit.toLowerCase().includes(q))) return 25;
    if (item.description.toLowerCase().includes(q)) return 15;
    return 0;
  }
}
