import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Bot,
  CircleDollarSign,
  Flame,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Package,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Growth AI Assistant — Merchant Growth AI" },
      { name: "description", content: "Your 24/7 AI business advisor, data analyst, and marketing strategist." },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTED_CHIPS = [
  { label: "How can I increase my sales?", icon: CircleDollarSign },
  { label: "Which product is performing best?", icon: Package },
  { label: "Which customers should I target?", icon: Users },
  { label: "Why did my Growth Score change?", icon: Flame },
  { label: "Give me a weekend marketing idea", icon: Lightbulb },
  { label: "What should I focus on this week?", icon: Sparkles },
];

function AssistantPage() {
  const { chatMessages, sendChatMessage, clearChat, business, metrics } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput("");
    setLoading(true);
    await sendChatMessage(query);
    setLoading(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-[1000px] flex-col">
      <PageHeader
        eyebrow="Autonomous Business Advisor"
        title="Growth AI Assistant"
        description={`Analyzing real metrics for ${business?.businessName || "your store"}. Ask anything about revenue, inventory, marketing, or churn.`}
        actions={
          chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-full border border-input bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              <RotateCcw className="size-3.5" /> Clear History
            </button>
          )
        }
      />

      {/* Chat Messages Container */}
      <div className="surface flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
              <Sparkles className="size-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              Welcome to your Growth AI Assistant
            </h3>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              I have direct access to your real products, order receipts, customers, and margins. Click any prompt below or ask your own question.
            </p>

            {/* Quick Prompt Chips */}
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 max-w-lg w-full">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSend(chip.label)}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-3 text-left text-xs font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <chip.icon className="size-4 text-primary shrink-0" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-bold text-primary-foreground text-xs shadow">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium"
                      : "surface-ink text-primary-foreground shadow-md"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                  <span className="mt-1.5 block text-[10px] opacity-60 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {isUser && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-muted-foreground">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-bold text-primary-foreground">
              AI
            </div>
            <div className="surface-ink px-4 py-2.5 rounded-2xl flex items-center gap-2 text-primary-foreground">
              <Sparkles className="size-3.5 animate-spin text-primary" />
              <span>Analyzing store metrics & formulating recommendations…</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested chips row if chat is active */}
      {chatMessages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2 px-1 text-xs">
          {SUGGESTED_CHIPS.slice(0, 4).map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.label)}
              className="shrink-0 rounded-full border border-border bg-card/80 px-3 py-1 text-muted-foreground hover:text-ink hover:bg-muted"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <div className="mt-2 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
        >
          <input
            type="text"
            placeholder="Ask Growth AI about sales trends, inventory, campaign ideas…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2 text-sm font-medium focus:outline-none"
          />
          <Btn
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-xl px-4 py-2 text-xs"
          >
            <Send className="size-3.5" />
          </Btn>
        </form>
      </div>
    </div>
  );
}
