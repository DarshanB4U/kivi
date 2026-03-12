import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const lessonSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  moduleId: z.string(),
  order: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = lessonSchema.parse(body);

    const lesson = await prisma.lesson.create({
      data,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
