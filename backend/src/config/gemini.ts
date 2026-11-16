
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const gemini = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: { timeout: 7000 },
}) : undefined;

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
