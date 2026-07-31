import type { EmbeddedDocument, IVectorStore, RetrievalHit } from "./types";

/**
 * In-memory vector store implementing the same contract a FAISS / pgvector /
 * Chroma adapter would. Swap by implementing IVectorStore.
 */
export class InMemoryVectorStore implements IVectorStore {
  private items: EmbeddedDocument[] = [];

  async upsert(items: EmbeddedDocument[]) {
    for (const item of items) {
      const idx = this.items.findIndex((i) => i.document.id === item.document.id);
      if (idx >= 0) this.items[idx] = item;
      else this.items.push(item);
    }
  }

  async query(vector: number[], topK: number): Promise<RetrievalHit[]> {
    return this.items
      .map((item) => ({ document: item.document, score: cosine(vector, item.vector) }))
      .filter((hit) => hit.score > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  size() {
    return this.items.length;
  }
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
