import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { enqueueTranscodeJob } from "@/lib/queue";

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
    const creatorId = (session as any).id;

    // Verify video belongs to this creator
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video || video.creatorId !== creatorId) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (video.status !== "UPLOADING") {
      return NextResponse.json(
        { message: "Video is not in UPLOADING state" },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "PROCESSING" },
    });

    // Enqueue transcoding job
    await enqueueTranscodeJob(videoId, video.originalFileKey);

    return NextResponse.json({ message: "Transcoding enqueued", status: "PROCESSING" });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
