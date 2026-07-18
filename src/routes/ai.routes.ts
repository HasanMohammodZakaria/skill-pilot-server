import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { aiGenerateBlueprintSchema } from "../types/blueprint.types.js";
import { recommendationSchema, chatMessageSchema } from "../types/ai.types.js";
import {
  aiGenerateBlueprint,
  aiRecommend,
  aiChat,
  aiReviewBlueprint,
} from "../controllers/ai.controller.js";

export function aiRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.post(
    "/generate-blueprint",
    requireAuth,
    validate(aiGenerateBlueprintSchema),
    aiGenerateBlueprint
  );
  router.post("/recommend", requireAuth, validate(recommendationSchema), aiRecommend);
  router.post("/chat", requireAuth, validate(chatMessageSchema), aiChat);
  router.post("/review/:blueprintId", requireAuth, aiReviewBlueprint);

  return router;
}