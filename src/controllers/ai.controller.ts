import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { asyncHandler, AppError } from "../middlewares/error.middleware.js";
import * as aiService from "../services/ai.service.js";
import { BlueprintCollection } from "../models/blueprint.model.js";
import type { AIGenerateBlueprintInput } from "../types/blueprint.types.js";
import type { RecommendationInput, ChatMessageInput } from "../types/ai.types.js";

export const aiGenerateBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as AIGenerateBlueprintInput;
  const result = await aiService.generateBlueprint(input);
  res.json({ success: true, data: result });
});

export const aiRecommend = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RecommendationInput;
  const result = await aiService.getRecommendation(input);
  res.json({ success: true, data: result });
});

export const aiChat = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body as ChatMessageInput;
  const reply = await aiService.chatWithAssistant(history, message);
  res.json({ success: true, data: { reply } });
});

export const aiReviewBlueprint = asyncHandler(async (req: Request, res: Response) => {
  const { blueprintId } = req.params;
  if (!blueprintId || Array.isArray(blueprintId) || !ObjectId.isValid(blueprintId)) {
    throw new AppError("Invalid blueprint id", 400);
  }

  const blueprint = await BlueprintCollection().findOne({ _id: new ObjectId(blueprintId) });
  if (!blueprint) throw new AppError("Blueprint not found", 404);

  const blueprintText = `Title: ${blueprint.title}\nDescription: ${blueprint.fullDescription}\nRoadmap: ${JSON.stringify(
    blueprint.roadmap
  )}`;

  const result = await aiService.reviewBlueprint(blueprintText);

  await BlueprintCollection().updateOne(
    { _id: new ObjectId(blueprintId) },
    { $set: { aiScore: (result as any).score } }
  );

  res.json({ success: true, data: result });
});