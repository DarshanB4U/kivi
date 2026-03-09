import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const progressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: (session as any).id,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, completed } = progressSchema.parse(body);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: (session as any).id,
          lessonId,
        },
      },
      update: {
        completed,
      },
      create: {
        userId: (session as any).id,
        lessonId,
        completed,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
