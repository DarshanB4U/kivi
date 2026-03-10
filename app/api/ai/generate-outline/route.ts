import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

// Configure OpenRouter as an OpenAI-compatible provider
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const outlineSchema = z.object({
  modules: z.array(
    z.object({
      title: z.string(),
      lessons: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { topic, audience } = await req.json();

    if (!topic) {
      return NextResponse.json({ message: "Topic is required" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: openrouter("google/gemini-2.0-flash-001"),
      schema: outlineSchema,
      prompt: `Create a comprehensive course outline for the topic: "${topic}".
      Target audience: "${audience || "Beginners"}".
      The outline should include multiple modules, each containing several lessons.
      Return the result as a structured JSON object.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { message: "Failed to generate outline" },
      { status: 500 }
    );
  }
}
