import herbsData from "@/data/herbs.json";
import type { Herb, IHerbalService } from "./types";

/** JSON-backed traditional herbal support service. */
export class JsonHerbalService implements IHerbalService {
  private readonly data = herbsData as Herb[];

  all() {
    return this.data;
  }

  getByIds(ids: string[]) {
    return ids.map((id) => this.data.find((h) => h.id === id)).filter((h): h is Herb => Boolean(h));
  }

  recommendFor(concerns: string[]) {
    if (!concerns.length) return this.data.slice(0, 3);
    return this.data
      .map((herb) => ({
        herb,
        overlap: herb.supports.filter((s) => concerns.includes(s)).length,
      }))
      .filter((r) => r.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .map((r) => r.herb);
  }
}
