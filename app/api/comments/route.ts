import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json({ message: "Lesson ID is required" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { lessonId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, lessonId } = await req.json();

    if (!content || !lessonId) {
      return NextResponse.json({ message: "Content and Lesson ID are required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        lessonId,
        userId: (session as any).id
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to post comment" }, { status: 500 });
  }
}
