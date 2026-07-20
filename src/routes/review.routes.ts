import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReviewSchema } from "../types/review.types.js";
import {
  getReviewsForBlueprint,
  createReview,
  deleteReview,
  getFeaturedReviews,
} from "../controllers/review.controller.js";

export function reviewRoutes(auth: Auth) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.get("/blueprints/:id/reviews", getReviewsForBlueprint);
  router.post(
    "/blueprints/:id/reviews",
    requireAuth,
    validate(createReviewSchema),
    createReview
  );
  router.get("/reviews/featured", getFeaturedReviews);
  router.delete("/reviews/:reviewId", requireAuth, deleteReview);

  return router;
}