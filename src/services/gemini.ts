import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFoodImage(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this food image. Identify the food items and estimate the following:
- Total Calories
- Protein (g)
- Carbohydrates (g)
- Fat (g)
- Fiber (g)
- Vitamins (A, B, C, D) as percentages of daily value (0-100).
- Confidence level (0-1).

Recognize Indian foods like roti, dal, rice, dosa, idli, sabzi, biryani if present.
If the image is not food, return a response with 0 calories and empty items.

Return the result as a JSON object.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              vitamins: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.NUMBER },
                  B: { type: Type.NUMBER },
                  C: { type: Type.NUMBER },
                  D: { type: Type.NUMBER },
                },
                required: ["A", "B", "C", "D"],
              },
            },
            required: ["calories", "protein", "carbs", "fat", "fiber", "vitamins"],
          },
          confidence: { type: Type.NUMBER },
        },
        required: ["items", "nutrition", "confidence"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AnalysisResult;
}

export async function getHealthAdvice(meals: any[], profile: any): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Based on the following meal history and user profile, give a short, encouraging health advice (max 2 sentences).
  
  Profile: ${JSON.stringify(profile)}
  Recent Meals: ${JSON.stringify(meals.slice(0, 5))}
  
  Focus on protein, calories, or hydration.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || "Keep up the good work!";
}
