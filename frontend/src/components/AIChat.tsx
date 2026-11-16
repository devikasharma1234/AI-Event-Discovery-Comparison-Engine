"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { sendAIMessage } from "../lib/api";
import type { Event, SearchFilters } from "../types/event";

const prompts = [
  "Music in Delhi under ₹1,000",
  "Comedy in Chandigarh",
  "Family events this weekend",
];

export interface SearchEntry {
  message: string;
  filters?: SearchFilters;
  awaitingAge: boolean;
}

interface Props {
  onResults: (events: Event[], filters: SearchFilters, needsAge: boolean) => void;
  onSearch: (entry: SearchEntry) => void;
  onReset: () => void;
  context?: SearchEntry;
}

export default function AIChat({ onResults, onSearch, onReset, context }: Props) {
  const [input, setInput] = useState(context?.message ?? "");
  const [filters, setFilters] = useState(context?.filters);
  const [needsAge, setNeedsAge] = useState(context?.awaitingAge ?? false);
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<{ query: string; reply: string; basic?: boolean }[]>([]);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [turns]);

  async function search(raw: string) {
    const message = raw.trim();
    if (!message || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    try {
      const response = await sendAIMessage(message, filters, needsAge, controller.signal);
      if (controller.signal.aborted) return;
      const awaitingAge = Boolean(response.needsClarification);
      setTurns((old) => [...old, { query: message, reply: response.reply, basic: response.mode === "basic" }]);
      setFilters(response.activeFilters);
      setNeedsAge(awaitingAge);
      setInput("");
      onSearch({ message, filters, awaitingAge: needsAge });
      onResults(response.recommendations, response.activeFilters, awaitingAge);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Search failed. Try again.");
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setLoading(false);
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(input);
  }

  return (
    <section className="assistant" id="search" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <span className="assistant-icon"><Sparkles size={21} /></span>
        <div><h2 id="assistant-title">Ask PlanBee</h2><p>Tell us where, when, and what you’re in the mood for.</p></div>
        {(context || turns.length > 0) && <button className="subtle-button ml-auto" onClick={onReset} disabled={loading}><RotateCcw size={15} /> <span>New search</span></button>}
      </div>
      {turns.length > 0 && (
        <div className="chat-log" role="log" aria-label="Conversation" ref={log}>
          {turns.map((turn, index) => (
            <div className="chat-turn" key={index}>
              <p className="user-query">{turn.query}</p>
              <p className="chat-reply">{turn.reply}{turn.basic && <small>Basic search</small>}</p>
            </div>
          ))}
        </div>
      )}
      <form className="assistant-form" onSubmit={submit}>
        <input id="event-query" aria-label="Describe the events you want to find" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} placeholder={needsAge ? "Enter the youngest attendee’s age…" : "Try “Find concerts in Delhi under ₹1,500”"} />
        <button className="primary-button" disabled={loading || !input.trim()} type="submit" aria-label={loading ? "Searching" : "Find events"}>
          {loading ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowRight size={18} />}
          <span>{loading ? "Searching" : "Find events"}</span>
        </button>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {turns.length === 0 && !context && <div className="prompt-row" aria-label="Example searches">
        {prompts.map((prompt) => <button key={prompt} type="button" disabled={loading} onClick={() => { setInput(prompt); document.getElementById("event-query")?.focus(); }}>{prompt}</button>)}
      </div>}
    </section>
  );
}
