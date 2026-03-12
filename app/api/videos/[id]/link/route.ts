import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ message: "lessonId is required" }, { status: 400 });
    }

    // Verify video belongs to this creator
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video || video.creatorId !== session.id) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    // Disconnect any existing video from this lesson
    await prisma.video.updateMany({
      where: { lessonId },
      data: { lessonId: null },
    });

    // Link this video to the lesson
    const updated = await prisma.video.update({
      where: { id: videoId },
      data: { lessonId },
    });

    return NextResponse.json({ message: "Video linked", video: updated });
  } catch (error) {
    console.error("Link video error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
