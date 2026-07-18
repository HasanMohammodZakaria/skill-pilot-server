import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import type { AIGenerateBlueprintInput } from "../types/blueprint.types.js";
import type { RecommendationInput } from "../types/ai.types.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-pro";

async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "{}";
  return JSON.parse(text) as T;
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
  "skillTags": string[],
  "estimatedDuration": string,
  "roadmap": [{ "step": number, "title": string, "description": string }]
}
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
) {
  const chat = ai.chats.create({
    model: MODEL,
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    config: {
      systemInstruction:
        "You are SkillPilot AI's career assistant. Help users navigate the platform, " +
        "answer questions about learning paths, and give career guidance. Keep answers concise.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text ?? "";
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