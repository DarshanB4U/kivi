import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  if (!session || (session as any).role !== "CREATOR") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id, creatorId: (session as any).id }
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found or unauthorized" }, { status: 404 });
    }

    const students = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
            
          }
        }
      },
      orderBy: { enrolledAt: "desc" }
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch students" }, { status: 500 });
  }
}
