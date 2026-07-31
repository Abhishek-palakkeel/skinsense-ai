import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/services/container";
import type { ChatMessage } from "@/services/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Skincare Assistant — Ask About Your Skin" },
      { name: "description", content: "Ask the AI skincare assistant about routines, actives, sensitivity and traditional herbal support, with answers grounded in the knowledge base." },
      { property: "og:title", content: "AI Skincare Assistant" },
      { property: "og:description", content: "Grounded, source-cited answers to your skincare questions." },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "How do I start using retinol without irritation?",
  "What helps with dark spots after acne?",
  "Which herbs help oily skin?",
  "Can I use vitamin C and niacinamide together?",
];

function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your skin assistant. Ask me about routines, ingredients, sensitivity or traditional herbal support. I answer from a curated knowledge base and I never prescribe medication.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await services.llmProvider.generateResponse({ messages: next });
      setMessages([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.content,
          createdAt: new Date().toISOString(),
          sources: res.sources,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Assistant" title="AI skin assistant" description="Provider-agnostic chat, grounded in the platform knowledge base." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="surface-panel flex h-[60vh] flex-col p-5">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[90%] rounded-2xl rounded-bl-sm bg-surface-raised px-4 py-2.5 text-sm"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <p className="mt-2 text-[11px] text-muted-foreground">Sources: {m.sources.join(" · ")}</p>
                )}
              </div>
            ))}
            {busy && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Thinking…
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Input
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your skin…"
              aria-label="Message the assistant"
            />
            <Button type="submit" disabled={busy || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
