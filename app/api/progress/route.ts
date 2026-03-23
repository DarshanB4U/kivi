import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const progressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.id,
      },
    });

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, completed } = progressSchema.parse(body);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId,
        },
      },
      update: {
        completed,
        watchedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.id,
        lessonId,
        completed,
        watchedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
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
