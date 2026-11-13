import { Router } from "express";
import {
  fetchAllEvents,
  fetchEventById,
} from "../controllers/event.controller.js";

const router = Router();

router.get("/", fetchAllEvents);

router.get("/:id", fetchEventById);

export default router;
