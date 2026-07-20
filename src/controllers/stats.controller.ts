import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { UserCollection } from "../models/user.model.js";
import { ReviewCollection } from "../models/review.model.js";

export const getPlatformStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalBlueprints, totalUsers, totalReviews] = await Promise.all([
    BlueprintCollection().countDocuments({}),
    UserCollection().countDocuments({}),
    ReviewCollection().countDocuments({}),
  ]);

  res.json({
    success: true,
    data: {
      totalBlueprints,
      totalUsers,
      totalReviews,
    },
  });
});