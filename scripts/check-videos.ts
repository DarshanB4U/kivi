import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const videos = await prisma.video.findMany();
  console.log("=== VIDEO RECORDS ===");
  for (const v of videos) {
    console.log(`id=${v.id} | status=${v.status} | lessonId=${v.lessonId} | hlsKey=${v.hlsPlaylistKey} | originalKey=${v.originalFileKey}`);
  }
  console.log(`Total videos: ${videos.length}`);

  const lessons = await prisma.lesson.findMany({ include: { video: true } });
  console.log("\n=== LESSON RECORDS ===");
  for (const l of lessons) {
    console.log(`Lesson: "${l.title}" | videoUrl: ${l.videoUrl.substring(0, 80)}... | hasVideoRecord: ${!!l.video} | videoStatus: ${l.video?.status || 'N/A'}`);
  }
  console.log(`Total lessons: ${lessons.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
