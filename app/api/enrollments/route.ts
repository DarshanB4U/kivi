import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: (session as any).id,
      },
      include: {
        course: {
          include: {
            creator: {
                select: { name: true }
            }
          }
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
