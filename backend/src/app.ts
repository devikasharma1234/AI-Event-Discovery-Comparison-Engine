import express, {type Request,type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import eventRoutes from "./routes/event.routes.js";
import searchRoutes from "./routes/search.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

// Parse JSON requests
app.use(express.json());

// Log HTTP requests
app.use(morgan("dev"));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "AI Event Discovery API is running",
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);


export default app;
