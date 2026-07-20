import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { deleteBlueprintByAdmin, getAdminStats, getAllBlueprintsForAdmin, getAllUsers, updateBlueprintStatus, updateUserRole } from "../controllers/admin.controller.js";

export function adminRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.get("/stats", requireAuth, adminMiddleware, getAdminStats);
  router.get("/users", requireAuth, adminMiddleware, getAllUsers);
  router.patch("/users/:id/role", requireAuth, adminMiddleware, updateUserRole);
  router.get("/blueprints", requireAuth, adminMiddleware, getAllBlueprintsForAdmin);
  router.delete("/blueprints/:id", requireAuth, adminMiddleware, deleteBlueprintByAdmin);
  router.patch("/blueprints/:id/status", requireAuth, adminMiddleware, updateBlueprintStatus);
  return router;
}