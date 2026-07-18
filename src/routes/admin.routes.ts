import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { getAdminStats } from "../controllers/admin.controller.js";

export function adminRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.get("/stats", requireAuth, adminMiddleware, getAdminStats);

  return router;
}