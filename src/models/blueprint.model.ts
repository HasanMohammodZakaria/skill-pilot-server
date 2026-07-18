import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type BlueprintStatus = "draft" | "published";

export interface BlueprintDoc {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  difficulty: DifficultyLevel;
  estimatedDuration: string;
  skillTags: string[];
  learningGoal: string;
  resourceLink?: string | undefined;
  coverImageUrl?: string | undefined;

  roadmap: {
    step: number;
    title: string;
    description: string;
  }[];

  aiGenerated: boolean;
 aiScore?: number | undefined;

  status: BlueprintStatus;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export function BlueprintCollection() {
  return getDB().collection<BlueprintDoc>("blueprints");
}