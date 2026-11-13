
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async () => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: responseSchema,
          temperature: 0,
        },
      });
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? error.status
          : undefined;

      if (
        status !== 503 ||
        attempt === maxAttempts
      ) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);

      console.log(
        `Gemini unavailable. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error("Gemini retry attempts exhausted");
};

const response = await generateWithRetry();
