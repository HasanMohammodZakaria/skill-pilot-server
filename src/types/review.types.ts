import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(500),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;