
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

if (!apiKey || !model) {
  throw new Error("Missing GEMINI_API_KEY or GEMINI_MODEL");
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 60000,
  },
});

async function testGemini() {
  console.log("Calling Gemini API...");
  console.log("Model:", model);

  const start = Date.now();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Reply with exactly: Gemini is working",
    });

    console.log("Response:", response.text);
    console.log("Time:", Date.now() - start, "ms");
  } catch (error) {
    console.error("Gemini request failed after",
      Date.now() - start, "ms");

    console.error(error);
  }
}

testGemini();
