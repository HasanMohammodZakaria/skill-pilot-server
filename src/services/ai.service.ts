import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { env } from "../config/env.js";
import type { AIGenerateBlueprintInput } from "../types/blueprint.types.js";
import type { RecommendationInput } from "../types/ai.types.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-3.1-flash-lite";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function generateJSON<T>(prompt: string, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text ?? "{}";
      return JSON.parse(text) as T;
    } catch (err: any) {
      const isRetryable = err?.status === 503 || err?.status === 429;
      const isLastAttempt = attempt === retries;

      if (!isRetryable || isLastAttempt) {
        throw err;
      }

      const delayMs = 1000 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Failed to generate content after retries");
}

export async function generateBlueprint(input: AIGenerateBlueprintInput) {
  const prompt = `
You are a career learning path expert. Generate a structured learning blueprint in JSON.

Target Role/Goal: ${input.targetRole}
Current Level: ${input.currentLevel}
Time Commitment: ${input.timeCommitment}
Focus Areas: ${input.focusAreas?.join(", ") || "Not specified"}

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "shortDescription": string,
  "fullDescription": string,
  "category": string,
  "skillTags": string[],
  "estimatedDuration": string,
  "learningGoal": string,
  "roadmap": [{ "step": number, "title": string, "description": string }]
}

For "category", pick a single short label (e.g. "Web Development", "Data Science", "Mobile Development").
For "learningGoal", write one concise sentence describing what the learner will achieve.
`;

  return generateJSON(prompt);
}

export async function getRecommendation(input: RecommendationInput) {
  const prompt = `
You are a learning recommendation engine. Based on the user's profile below,
recommend what kind of learning blueprint categories/topics they should explore next,
and explain the reasoning briefly.

Goal: ${input.goal}
Existing Skills: ${input.existingSkills?.join(", ") || "None specified"}
Preferred Category: ${input.preferredCategory || "Any"}
Difficulty Preference: ${input.difficulty || "Any"}

Return ONLY valid JSON with this exact shape:
{
  "recommendedCategories": string[],
  "reasoning": string,
  "suggestedNextSkills": string[]
}
`;
  return generateJSON(prompt);
}


export async function chatWithAssistant(
  history: { role: "user" | "model"; text: string }[],
  message: string
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are SkillPilot AI's career assistant. Help users navigate the platform, " +
        "answer questions about learning paths, and give career guidance. Keep answers concise.",
    },
    ...history.map((h) => ({
      role: (h.role === "model" ? "assistant" : "user") as "assistant" | "user",
      content: h.text,
    })),
    { role: "user" as const, content: message },
  ];

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function reviewBlueprint(blueprintText: string) {
  const prompt = `
You are reviewing a learning blueprint for quality and completeness.

Blueprint content:
${blueprintText}

Return ONLY valid JSON with this exact shape:
{
  "score": number,
  "strengths": string[],
  "improvements": string[],
  "summary": string
}
`;
  return generateJSON(prompt);
}