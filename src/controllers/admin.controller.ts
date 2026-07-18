import type { Request, Response } from "express";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { UserCollection } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalBlueprints, categoryDistribution, difficultyDistribution] =
    await Promise.all([
      UserCollection().countDocuments(),
      BlueprintCollection().countDocuments(),
      BlueprintCollection()
        .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
        .toArray(),
      BlueprintCollection()
        .aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }])
        .toArray(),
    ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalBlueprints,
      categoryDistribution,
      difficultyDistribution,
    },
  });
});