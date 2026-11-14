
import type {
  AIChatResponse,
  SearchFilters,
} from "../types/event";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function sendAIMessage(
  message: string,
  previousFilters?: SearchFilters
): Promise<AIChatResponse> {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      ...(previousFilters && { previousFilters }),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch AI recommendations"
    );
  }

  return data as AIChatResponse;
}
