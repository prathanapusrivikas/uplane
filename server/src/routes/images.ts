import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { config } from "../config";
import { deleteImageById, getImageById, insertImage } from "../db";
import { uploadImage, deleteImage } from "../services/cloudinary";
import { flipImage } from "../services/imagePipeline";
import { removeBackground } from "../services/removeBg";
import { HttpError } from "../utils/errors";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "Please upload a single image file.", "missing_file");
    }

    if (!req.file.mimetype.startsWith("image/")) {
      throw new HttpError(400, "Only image uploads are supported.", "invalid_file_type");
    }

    const id = randomUUID();
    const folder = config.cloudinaryFolder;

    let originalPublicId: string | undefined;
    let processedPublicId: string | undefined;

    try {
      const original = await uploadImage(req.file.buffer, `${folder}/originals`, `orig_${id}`);
      originalPublicId = original.publicId;

      const removedBackground = await removeBackground(req.file.buffer, req.file.mimetype);
      const flipped = await flipImage(removedBackground);

      const processed = await uploadImage(flipped, `${folder}/processed`, `proc_${id}`);
      processedPublicId = processed.publicId;

      insertImage({
        id,
        originalPublicId,
        processedPublicId,
        processedUrl: processed.url,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ id, processedUrl: processed.url });
    } catch (error) {
      if (originalPublicId) {
        await safeDelete(originalPublicId);
      }
      if (processedPublicId) {
        await safeDelete(processedPublicId);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const record = getImageById(req.params.id);
    if (!record) {
      throw new HttpError(404, "Image not found.", "not_found");
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const record = getImageById(req.params.id);
    if (!record) {
      throw new HttpError(404, "Image not found.", "not_found");
    }

    const results = await Promise.allSettled([
      deleteImage(record.originalPublicId),
      deleteImage(record.processedPublicId)
    ]);

    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length > 0) {
      throw new HttpError(502, "Failed to delete image from storage.", "delete_failed");
    }

    deleteImageById(record.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

async function safeDelete(publicId: string): Promise<void> {
  try {
    await deleteImage(publicId);
  } catch {
    // Best-effort cleanup to avoid masking the original error.
  }
}

export { router as imagesRouter };
