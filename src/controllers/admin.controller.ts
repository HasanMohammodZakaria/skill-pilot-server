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
    { $set: { role } }
  );

  if (result.matchedCount === 0) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, message: "Role updated" });
});

export const getAllBlueprintsForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "10", search = "" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const collection = BlueprintCollection();

  const [items, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
    collection.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const deleteBlueprintByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const existing = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!existing) throw new AppError("Blueprint not found", 404);

  await BlueprintCollection().deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true, message: "Blueprint deleted by admin" });
});

export const updateBlueprintStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: unknown };

  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }
  if (status !== "published" && status !== "draft") {
    throw new AppError("Invalid status value", 400);
  }

  const result = await BlueprintCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new AppError("Blueprint not found", 404);
  }

  res.json({ success: true, message: "Blueprint status updated" });
});