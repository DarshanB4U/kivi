import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./client";

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Generate a presigned GET URL for an R2 object.
 * Default expiry: 60 seconds (for HLS playlist/segment access).
 */
export async function generateSignedGetUrl(
  key: string,
  expiresIn: number = 60
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
