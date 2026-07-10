import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as presignUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider } from "./types";

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

// Keeps the original extension (needed for content-type inference on
// download) while sanitizing everything else the same way image-naming.ts does.
function buildObjectKey(folder: string, fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  const ext = lastDot > -1 ? fileName.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = (lastDot > -1 ? fileName.slice(0, lastDot) : fileName)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const timestamp = Math.floor(Date.now() / 1000);
  return `${folder}/${timestamp}-${base}${ext ? `.${ext}` : ""}`;
}

export const r2Provider: StorageProvider = {
  async upload({ buffer, fileName, mimeType, folder }) {
    const key = buildObjectKey(folder, fileName);
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return { providerFileId: key };
  },

  async delete(providerFileId) {
    const client = getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: providerFileId,
      })
    );
  },

  async getSignedUrl({ providerFileId }, expiresInSeconds = 300) {
    const client = getClient();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: providerFileId,
    });
    return presignUrl(client, command, { expiresIn: expiresInSeconds });
  },
};
