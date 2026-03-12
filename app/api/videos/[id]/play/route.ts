import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { generateSignedGetUrl } from "@/lib/s3/signed-url";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const userId = session.id;
    const role = session.role;

    // Fetch video with lesson → module → course
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!video || !video.hlsPlaylistKey) {
      return NextResponse.json({ message: "Video not found or not ready" }, { status: 404 });
    }

    // Creators can always access their own videos
    if (role === "CREATOR" && video.creatorId === userId) {
      // allowed
    } else if (video.lesson) {
      // Students must be enrolled in the course
      const courseId = video.lesson.module.course.id;
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.id, courseId },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Generate signed URL for master.m3u8 (60 second expiry)
    const signedUrl = await generateSignedGetUrl(video.hlsPlaylistKey, 60);

    return NextResponse.json({
      url: signedUrl,
      status: video.status,
    });
  } catch (error) {
    console.error("Play error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
