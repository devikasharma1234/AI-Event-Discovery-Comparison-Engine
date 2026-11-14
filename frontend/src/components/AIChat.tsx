
"use client";

import { useState, type FormEvent } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

import { sendAIMessage } from "../lib/api";

import type {
  Event,
  SearchFilters,
} from "../types/event";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  onResults: (events: Event[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function AIChat({
  onResults,
  onFiltersChange,
}: AIChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousFilters, setPreviousFilters] =
    useState<SearchFilters>();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! Tell me what kind of events you're looking for. You can mention your city, budget, group size, and interests.",
    },
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await sendAIMessage(
        message,
        previousFilters
      );

      setPreviousFilters(response.activeFilters);
      onFiltersChange(response.activeFilters);

      onResults(response.recommendations);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, ${errorMessage}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="rounded-xl bg-violet-600/20 p-3 text-violet-400">
          <Sparkles size={22} />
        </div>

        <div>
          <h2 className="font-semibold text-white">
            AI Event Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Describe your perfect event
          </p>
        </div>
      </div>

      <div className="flex h-80 flex-col gap-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto bg-violet-600 text-white"
                : "mr-auto bg-white/5 text-slate-200"
            }`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-violet-300">
            <Loader2 size={16} className="animate-spin" />
            Finding the best events...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-3 border-t border-white/10 p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find music events in Delhi under ₹2000..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center rounded-xl bg-violet-600 px-5 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
