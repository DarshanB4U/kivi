import "dotenv/config";
import { Worker } from "bullmq";
import { execSync } from "child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join, relative, extname } from "path";
import { tmpdir } from "os";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    username: parsed.username || undefined,
  };
}

async function downloadFromR2(key: string): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  );
  if (!response.Body) throw new Error(`Empty response for key: ${key}`);
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  await s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
}

function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  switch (ext) {
    case ".m3u8": return "application/vnd.apple.mpegurl";
    case ".ts": return "video/mp2t";
    default: return "application/octet-stream";
  }
}

function getAllFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function transcode(inputPath: string, outputDir: string): void {
  mkdirSync(join(outputDir, "720p"), { recursive: true });
  mkdirSync(join(outputDir, "480p"), { recursive: true });

  const ffmpegCmd = [
    "ffmpeg", "-i", `"${inputPath}"`,
    "-hide_banner", "-y",
    "-vf", '"scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2"',
    "-c:v", "libx264", "-preset", "ultrafast", "-b:v", "2800k", "-maxrate", "2996k", "-bufsize", "4200k",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
    "-hls_time", "6", "-hls_playlist_type", "vod",
    "-hls_segment_filename", `"${join(outputDir, "720p", "segment%03d.ts")}"`,
    `"${join(outputDir, "720p", "index.m3u8")}"`,
    "-vf", '"scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2"',
    "-c:v", "libx264", "-preset", "ultrafast", "-b:v", "1400k", "-maxrate", "1498k", "-bufsize", "2100k",
    "-c:a", "aac", "-b:a", "96k", "-ar", "48000",
    "-hls_time", "6", "-hls_playlist_type", "vod",
    "-hls_segment_filename", `"${join(outputDir, "480p", "segment%03d.ts")}"`,
    `"${join(outputDir, "480p", "index.m3u8")}"`,
  ].join(" ");

  execSync(ffmpegCmd, { stdio: "inherit", shell: "/bin/bash" });

  const masterPlaylist = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "",
    "#EXT-X-STREAM-INF:BANDWIDTH=2928000,RESOLUTION=1280x720",
    "720p/index.m3u8",
    "",
    "#EXT-X-STREAM-INF:BANDWIDTH=1496000,RESOLUTION=854x480",
    "480p/index.m3u8",
  ].join("\n");

  writeFileSync(join(outputDir, "master.m3u8"), masterPlaylist);
}

function rewritePlaylist(filePath: string, r2Prefix: string): void {
  let content = readFileSync(filePath, "utf-8");

  content = content.replace(
    /^((?!#).+\.ts)$/gm,
    (match) => {
      const dir = filePath.substring(filePath.lastIndexOf("/", filePath.lastIndexOf("/") - 1) + 1);
      const resolution = dir.split("/")[0];
      return `/api/hls?key=${r2Prefix}/${resolution}/${match}`;
    }
  );

  content = content.replace(
    /^(\d+p\/index\.m3u8)$/gm,
    (match) => `/api/hls?key=${r2Prefix}/${match}`
  );

  writeFileSync(filePath, content);
}

const worker = new Worker(
  "video-transcoding",
  async (job) => {
    const { videoId, originalFileKey } = job.data;
    console.log(`[Worker] Processing video: ${videoId}`);

    const workDir = join(tmpdir(), `kivi-transcode-${videoId}`);
    mkdirSync(workDir, { recursive: true });

    try {
      const videoBuffer = await downloadFromR2(originalFileKey);
      const inputPath = join(workDir, "input.mp4");
      writeFileSync(inputPath, videoBuffer);

      const outputDir = join(workDir, "output");
      mkdirSync(outputDir, { recursive: true });
      transcode(inputPath, outputDir);

      const r2Prefix = `videos/${videoId}`;

      for (const res of ["720p", "480p"]) {
        const playlistPath = join(outputDir, res, "index.m3u8");
        rewritePlaylist(playlistPath, r2Prefix);
      }

      rewritePlaylist(join(outputDir, "master.m3u8"), r2Prefix);

      const allFiles = getAllFiles(outputDir);
      for (const filePath of allFiles) {
        const relativePath = relative(outputDir, filePath);
        const r2Key = `${r2Prefix}/${relativePath}`;
        const content = readFileSync(filePath);
        const contentType = getContentType(filePath);

        await uploadToR2(r2Key, content, contentType);
      }

      await prisma.video.update({
        where: { id: videoId },
        data: {
          hlsPlaylistKey: `${r2Prefix}/master.m3u8`,
          status: "READY",
        },
      });

      console.log(`[Worker] ✅ Video ${videoId} is READY`);
    } catch (error) {
      console.error(`[Worker]  Failed to process video ${videoId}:`, error);

      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED" },
      });

      throw error;
    } finally {
      try {
        rmSync(workDir, { recursive: true, force: true });
      } catch { }
    }
  },
  {
    connection: {
      ...parseRedisUrl(REDIS_URL),
      maxRetriesPerRequest: null,
    },
    concurrency: 1,
    lockDuration: 600_000,
    stalledInterval: 600_000,
    skipVersionCheck: true,
  }
);

worker.on("ready", () => {
  console.log("Transcoding worker is ready and listening for jobs...");
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(` Job ${job?.id} failed:`, err.message);
});

process.on("SIGTERM", async () => {
  console.log("[Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log(" Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
