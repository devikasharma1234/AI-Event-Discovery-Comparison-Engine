import { Router } from "express";

import { fetchRecommendations } from "../controllers/recommendation.controller.js";

const router = Router();

router.post("/", fetchRecommendations);

export default router;
