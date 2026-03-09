import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const enrollSchema = z.object({
  courseId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = enrollSchema.parse(body);

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: (session as any).id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Already enrolled" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: (session as any).id,
        courseId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
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
