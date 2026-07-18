import { z } from "zod";

export const createBlueprintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  shortDescription: z.string().min(10).max(200),
  fullDescription: z.string().min(30),
  category: z.string().min(2),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estimatedDuration: z.string().min(1),
  skillTags: z.array(z.string()).min(1, "At least one skill tag is required"),
  learningGoal: z.string().min(5),
  resourceLink: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateBlueprintSchema = createBlueprintSchema.partial();

export const aiGenerateBlueprintSchema = z.object({
  targetRole: z.string().min(2, "Target role/goal is required"),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  timeCommitment: z.string().min(1, "e.g. '5 hours/week'"),
  focusAreas: z.array(z.string()).optional(),
});

export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;
export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>;
export type AIGenerateBlueprintInput = z.infer<typeof aiGenerateBlueprintSchema>;