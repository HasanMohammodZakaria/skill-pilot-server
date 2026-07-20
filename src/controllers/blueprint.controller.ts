import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import type {
  CreateBlueprintInput,
  UpdateBlueprintInput,
} from "../types/blueprint.types.js";

const sortMap = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title_asc: { title: 1 },
} as const;

export const getBlueprints = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    difficulty,
    sort = "newest",
    page = "1",
    limit = "8",
  } = req.query as Record<string, string>;

  const filter: Record<string, any> = { status: "published" };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { skillTags: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;

  const sortKey = (sort in sortMap ? sort : "newest") as keyof typeof sortMap;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const collection = BlueprintCollection();

  const [items, total] = await Promise.all([
    collection
      .find(filter)
      .sort(sortMap[sortKey])
      .skip(skip)
      .limit(limitNum)
      .toArray(),
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

export const getBlueprintById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const blueprint = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!blueprint) throw new AppError("Blueprint not found", 404);

  res.json({ success: true, data: blueprint });
});

export const getRelatedBlueprints = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const current = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!current) throw new AppError("Blueprint not found", 404);

  const related = await BlueprintCollection()
    .find({ category: current.category, _id: { $ne: current._id } })
    .limit(4)
    .toArray();

  res.json({ success: true, data: related });
});


export const createBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateBlueprintInput;
  const userId = req.user!.id;

  const doc = {
    ...body,
    roadmap: [],
    aiGenerated: false,
    status: "published" as const,
    createdBy: new ObjectId(userId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await BlueprintCollection().insertOne(doc);
  res.status(201).json({ success: true, data: { _id: result.insertedId, ...doc } });
});

export const updateBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as UpdateBlueprintInput;
  const userId = req.user!.id;

  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const existing = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!existing) throw new AppError("Blueprint not found", 404);
  if (existing.createdBy.toString() !== userId) {
    throw new AppError("You can only edit your own blueprints", 403);
  }

  const updateData = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  );

  await BlueprintCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  res.json({ success: true, message: "Blueprint updated" });
});

export const deleteBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const existing = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!existing) throw new AppError("Blueprint not found", 404);
  if (existing.createdBy.toString() !== userId) {
    throw new AppError("You can only delete your own blueprints", 403);
  }

  await BlueprintCollection().deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true, message: "Blueprint deleted" });
});

export const getMyBlueprints = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const items = await BlueprintCollection()
    .find({ createdBy: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, data: items });
});

export const getBlueprintFilters = asyncHandler(async (_req: Request, res: Response) => {
  const collection = BlueprintCollection();

  const [categories, difficulties] = await Promise.all([
    collection
      .aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
  ]);

  res.json({
    success: true,
    data: {
      categories: categories.map((c) => ({ value: c._id, count: c.count })),
      difficulties: difficulties.map((d) => ({ value: d._id, count: d.count })),
    },
  });
});

export const getFeaturedBlueprints = asyncHandler(async (req: Request, res: Response) => {
  const blueprints = await BlueprintCollection()
    .find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .toArray();

  res.json({ success: true, data: blueprints });
});