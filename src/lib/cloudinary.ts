import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "auto" },
      (err, res) => {
        if (err) return reject(err);
        if (!res) return reject(new Error("Empty upload response"));
        resolve({ secure_url: res.secure_url, public_id: res.public_id });
      }
    );
    stream.end(buffer);
  });
}
