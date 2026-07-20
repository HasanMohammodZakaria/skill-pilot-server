import { Router } from "express";
import { getPlatformStats } from "../controllers/stats.controller.js";

export function statsRoutes() {
  const router = Router();
  router.get("/", getPlatformStats);
  return router;
}