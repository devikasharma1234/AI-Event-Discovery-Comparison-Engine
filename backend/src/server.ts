import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { usesLiveEvents } from "./services/live-event.service.js";

const PORT = Number(process.env.PORT) || 8080;

const startServer = async (): Promise<void> => {
  try {
    if (!usesLiveEvents() && process.env.DEMO_MODE !== "true") await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
