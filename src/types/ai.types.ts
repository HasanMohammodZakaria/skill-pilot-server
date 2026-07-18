import { z } from "zod";

export const recommendationSchema = z.object({
  goal: z.string().min(2),
  existingSkills: z.array(z.string()).optional(),
  preferredCategory: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;