import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

export const getUserDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = new ObjectId(req.user!.id);
  const collection = BlueprintCollection();

  const [totalBlueprints, aiGeneratedCount, recent] = await Promise.all([
    collection.countDocuments({ createdBy: userId }),
    collection.countDocuments({ createdBy: userId, aiGenerated: true }),
    collection
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
  ]);

  res.json({
    success: true,
    data: {
      totalBlueprints,
      aiGeneratedCount,
      recentActivity: recent,
    },
  });
});