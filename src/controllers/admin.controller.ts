import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { UserCollection } from "../models/user.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";

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
    data: { totalUsers, totalBlueprints, categoryDistribution, difficultyDistribution },
  });
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserCollection()
    .find({}, { projection: { name: 1, email: 1, role: 1, image: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, data: users });
});

const VALID_ROLES = ["user", "admin"] as const;
type UserRole = (typeof VALID_ROLES)[number];

function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role: unknown };

  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid user id", 400);
  }
  if (!isValidRole(role)) {
    throw new AppError("Invalid role value", 400);
  }

  const result = await UserCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { role } } // এখন role এর টাইপ narrowed হয়ে গেছে "user" | "admin"
  );

  if (result.matchedCount === 0) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, message: "Role updated" });
});