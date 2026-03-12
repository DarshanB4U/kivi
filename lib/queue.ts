import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Parse Redis URL into connection options
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    username: parsed.username || undefined,
  };
}

const connection = parseRedisUrl(REDIS_URL);

export const transcodingQueue = new Queue("video-transcoding", {
  connection,
});

export interface TranscodeJobData {
  videoId: string;
  originalFileKey: string;
}

/**
 * Enqueue a video for HLS transcoding.
 */
export async function enqueueTranscodeJob(
  videoId: string,
  originalFileKey: string
): Promise<void> {
  await transcodingQueue.add(
    "transcode",
    { videoId, originalFileKey } satisfies TranscodeJobData,
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
