import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              video: {
                select: { id: true, status: true },
              },
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  let isEnrolled = false;
  if (session) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId: id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  const isCreator = session?.id === course.creatorId;

  // Filter out videoUrl for non-creators to prevent direct downloads
  if (!isCreator) {
    course.modules = course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => {
        // Create a new object without videoUrl
        const { videoUrl, ...lessonWithoutVideoUrl } = lesson;
        return {
          ...lessonWithoutVideoUrl,
          // We must satisfy the type, so we return an empty string
          videoUrl: "", 
        };
      })
    }));
  }

  return NextResponse.json({ ...course, isEnrolled });
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const courseOwner = await prisma.course.findUnique({
    where: { id, creatorId: session.id }
  });

  if (!courseOwner) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...body
    }
  });

  return NextResponse.json(course);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const courseOwner = await prisma.course.findUnique({
    where: { id, creatorId: session.id }
  });

  if (!courseOwner) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.course.delete({
    where: { id }
  });

  return NextResponse.json({ message: "Course deleted successfully" });
}

