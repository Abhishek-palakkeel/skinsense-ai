import { LLMProvider } from "./provider";
import type { ChatMessage, LLMResponse } from "../types";
import { InMemoryRetriever } from "../rag/retriever";

/**
 * Deterministic mock provider so the chat experience is fully functional
 * before any API key exists. It grounds every answer in retrieved knowledge
 * base passages, exactly like the future Grok + RAG implementation will.
 */
export class MockLLMProvider extends LLMProvider {
  readonly name = "mock-derm-assistant";

  constructor(private readonly retriever = new InMemoryRetriever()) {
    super();
  }

  async generateResponse({ messages }: { messages: ChatMessage[]; context?: string[] }): Promise<LLMResponse> {
    const question = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));

    const hits = await this.retriever.retrieve(question, 3);

    if (!hits.length) {
      return {
        content: [
          "I can help with skincare routines, ingredients, skin concerns and general dermatology education.",
          "",
          "Try asking something like:",
          "- *How do I start using retinol without irritation?*",
          "- *What causes dark marks after acne?*",
          "- *Can I use niacinamide and vitamin C together?*",
          "",
          "I don't diagnose conditions or recommend medication — for that, see a dermatologist.",
        ].join("\n"),
      };
    }

    const body = hits
      .map((hit) => `**${hit.document.title}**\n\n${hit.document.content.trim()}`)
      .join("\n\n---\n\n");

    return {
      content: [
        answerOpener(question),
        "",
        body,
        "",
        "_This is educational guidance, not a medical diagnosis. Persistent or worsening skin issues should be reviewed by a dermatologist._",
      ].join("\n"),
      sources: hits.map((h) => h.document.title),
    };
  }
}

function answerOpener(question: string) {
  const q = question.toLowerCase();
  if (q.includes("routine")) return "Here's how I'd structure that routine:";
  if (q.includes("mix") || q.includes("together")) return "On layering those together:";
  if (q.includes("why") || q.includes("cause")) return "Here's what's usually driving that:";
  return "Here's what the knowledge base says:";
}
