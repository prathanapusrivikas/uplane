import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";
import { HttpError } from "../utils/errors";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: true
      },
      (error, result) => {
        if (error || !result) {
          reject(new HttpError(502, "Image upload failed.", "cloudinary_upload_failed"));
          return;
        }
        resolve({ publicId: result.public_id, url: result.secure_url });
      }
    );

    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true
  });
}
