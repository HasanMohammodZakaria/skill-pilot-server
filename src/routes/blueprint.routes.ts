import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createBlueprintSchema,
  updateBlueprintSchema,
} from "../types/blueprint.types.js";
import {
  getBlueprints,
  getBlueprintById,
  getRelatedBlueprints,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
  getMyBlueprints,
  getBlueprintFilters,
} from "../controllers/blueprint.controller.js";

export function blueprintRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.get("/filters", getBlueprintFilters);
  router.get("/", getBlueprints);
  router.get("/mine", requireAuth, getMyBlueprints);
  router.get("/:id", getBlueprintById);
  router.get("/:id/related", getRelatedBlueprints);

  router.post("/", requireAuth, validate(createBlueprintSchema), createBlueprint);
  router.patch("/:id", requireAuth, validate(updateBlueprintSchema), updateBlueprint);
  router.delete("/:id", requireAuth, deleteBlueprint);

  return router;
}