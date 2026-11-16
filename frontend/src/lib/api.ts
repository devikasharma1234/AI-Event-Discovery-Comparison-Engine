import type { AIChatResponse, Event, SearchFilters } from "../types/event";

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Couldn’t connect to the event service. Try again in a moment.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.message || "The event service returned an unexpected response.");
  return data as T;
}

export function sendAIMessage(message: string, previousFilters?: SearchFilters, awaitingAge = false, signal?: AbortSignal) {
  return post<AIChatResponse>("/api/ai/chat", { message, previousFilters, awaitingAge }, signal);
}

export async function getRecommendations(filters: SearchFilters, signal?: AbortSignal) {
  const response = await post<{ recommendations: Event[] }>("/api/recommendations", filters, signal);
  return response.recommendations;
}
