import type { ChatMessage, ILLMProvider, LLMResponse } from "../types";

/**
 * Provider-agnostic LLM boundary.
 *
 * The chat UI depends ONLY on ILLMProvider. To go live with xAI Grok:
 *   1. Add XAI_API_KEY as a server secret.
 *   2. Implement GrokProvider (server function) satisfying ILLMProvider.
 *   3. Register it in src/services/container.ts.
 * No frontend changes are required.
 */
export abstract class LLMProvider implements ILLMProvider {
  abstract readonly name: string;
  abstract generateResponse(input: {
    messages: ChatMessage[];
    context?: string[];
  }): Promise<LLMResponse>;
}

export type { ILLMProvider, LLMResponse };
