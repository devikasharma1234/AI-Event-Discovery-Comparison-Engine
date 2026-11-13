
import { Router } from "express";
import { handleAIChat } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", handleAIChat);

export default router;
