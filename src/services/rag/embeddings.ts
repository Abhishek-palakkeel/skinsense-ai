import type { IEmbeddingService } from "./types";

/**
 * Deterministic hashing-based embedding service (bag-of-ngrams projected into
 * a fixed-size vector). Good enough for local semantic-ish retrieval and
 * requires no network. Replace with an API embedding model later — the
 * IEmbeddingService interface stays identical.
 */
export class HashingEmbeddingService implements IEmbeddingService {
  readonly dimensions: number;

  constructor(dimensions = 256) {
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<number[]> {
    const vec = new Array<number>(this.dimensions).fill(0);
    for (const token of tokenize(text)) {
      vec[hash(token) % this.dimensions] += 1;
      const stem = token.slice(0, 5);
      vec[hash(`stem:${stem}`) % this.dimensions] += 0.5;
    }
    const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "are", "you", "your", "can",
  "how", "what", "why", "does", "did", "was", "have", "has", "但", "from",
  "about", "into", "should", "would", "could", "there", "their", "them",
]);

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
