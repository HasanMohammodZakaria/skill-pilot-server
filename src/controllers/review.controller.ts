import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ReviewCollection } from "../models/review.model.js";
import { BlueprintCollection } from "../models/blueprint.model.js";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import type { CreateReviewInput } from "../types/review.types.js";

export const getReviewsForBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const reviews = await ReviewCollection()
    .find({ blueprintId: new ObjectId(id) })
    .sort({ createdAt: -1 })
    .toArray();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  res.json({
    success: true,
    data: reviews,
    meta: { averageRating: Number(avgRating.toFixed(1)), totalReviews: reviews.length },
  });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body as CreateReviewInput;
  const user = req.user!;

  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const blueprint = await BlueprintCollection().findOne({ _id: new ObjectId(id) });
  if (!blueprint) throw new AppError("Blueprint not found", 404);

  const alreadyReviewed = await ReviewCollection().findOne({
    blueprintId: new ObjectId(id),
    userId: new ObjectId(user.id),
  });
  if (alreadyReviewed) {
    throw new AppError("You have already reviewed this blueprint", 400);
  }

  const doc = {
    blueprintId: new ObjectId(id),
    userId: new ObjectId(user.id),
    userName: user.name,
    rating,
    comment,
    createdAt: new Date(),
  };

  const result = await ReviewCollection().insertOne(doc);
  res.status(201).json({ success: true, data: { _id: result.insertedId, ...doc } });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const userId = req.user!.id;

  if (!reviewId || Array.isArray(reviewId) || !ObjectId.isValid(reviewId)) {
    throw new AppError("Invalid review id", 400);
  }

  const review = await ReviewCollection().findOne({ _id: new ObjectId(reviewId) });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId.toString() !== userId) {
    throw new AppError("You can only delete your own review", 403);
  }

  await ReviewCollection().deleteOne({ _id: new ObjectId(reviewId) });
  res.json({ success: true, message: "Review deleted" });
});

export const getFeaturedReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await ReviewCollection()
    .aggregate([
      { $match: { rating: { $gte: 4 } } },
      { $sort: { createdAt: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $addFields: {
          userImageUrl: { $arrayElemAt: ["$userInfo.image", 0] },
        },
      },
      {
        $project: {
          userInfo: 0,
        },
      },
    ])
    .toArray();

  res.json({ success: true, data: reviews });
});