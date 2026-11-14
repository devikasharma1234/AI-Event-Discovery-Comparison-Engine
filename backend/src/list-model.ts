
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    timeout: 30000,
  },
});

async function listModels() {
  try {
    const models = await ai.models.list();

    for await (const model of models) {
      console.log({
        name: model.name,
        displayName: model.displayName,
        supportedActions: model.supportedActions,
      });
    }
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

listModels();
