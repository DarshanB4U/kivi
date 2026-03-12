import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { generateSignedGetUrl } from "@/lib/s3/signed-url";

/**
 * HLS proxy — generates signed URLs for sub-playlists and .ts segments.
 * The hls.js player calls this endpoint to access individual HLS files.
 *
 * GET /api/hls?key=videos/abc123/720p/index.m3u8
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ message: "Missing key parameter" }, { status: 400 });
    }

    // Only allow access to files under the videos/ prefix (safety check)
    if (!key.startsWith("videos/")) {
      return NextResponse.json({ message: "Invalid key" }, { status: 403 });
    }

    // Generate a short-lived signed URL and redirect
    const signedUrl = await generateSignedGetUrl(key, 60);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("HLS proxy error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
