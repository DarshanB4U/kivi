import { s3Client } from "@/lib/s3/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, lessonId } = await req.json();
    const isVideo = contentType.startsWith("video/");
    const creatorId = session.id;

    const key = `lessons/${creatorId}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    let videoId = null;

    if (isVideo) {
      // If replacing a video for an existing lesson, disconnect the old one first
      if (lessonId) {
        await prisma.video.updateMany({
          where: { lessonId },
          data: { lessonId: null },
        });
      }

      // Create a Video record to track this upload
      const video = await prisma.video.create({
        data: {
          title: filename,
          creatorId: session.id,
          originalFileKey: key,
          status: "UPLOADING",
          ...(lessonId ? { lessonId } : {}),
        },
      });
      videoId = video.id;
    }

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      videoId,
      originalFileKey: key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
