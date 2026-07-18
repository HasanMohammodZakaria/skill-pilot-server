import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { getUserDashboard } from "../controllers/dashboard.controller.js";

export function dashboardRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.get("/me", requireAuth, getUserDashboard);

  return router;
}