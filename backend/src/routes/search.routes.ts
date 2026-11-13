
import { Router } from "express";
import { fetchSearchResults } from "../controllers/search.controller.js";

const router = Router();

router.get("/", fetchSearchResults);

export default router;
