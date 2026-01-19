import axios from "axios";
import FormData from "form-data";
import { config } from "../config";
import { HttpError } from "../utils/errors";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

function guessFilename(mimeType: string): string {
  if (mimeType.includes("png")) return "upload.png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "upload.jpg";
  if (mimeType.includes("webp")) return "upload.webp";
  return "upload";
}

export async function removeBackground(imageBuffer: Buffer, mimeType = "image/png"): Promise<Buffer> {
  const form = new FormData();
  form.append("image_file", imageBuffer, {
    filename: guessFilename(mimeType),
    contentType: mimeType
  });
  form.append("size", "auto");

  const response = await axios.post(REMOVE_BG_ENDPOINT, form, {
    headers: {
      ...form.getHeaders(),
      "X-Api-Key": config.removeBgApiKey
    },
    responseType: "arraybuffer",
    validateStatus: () => true
  });

  if (response.status !== 200) {
    const contentType = response.headers["content-type"] || "";
    let detail = "";

    try {
      const bodyText = Buffer.from(response.data).toString("utf8");
      if (contentType.includes("application/json")) {
        const json = JSON.parse(bodyText);
        detail = json?.errors?.[0]?.title || json?.errors?.[0]?.detail || bodyText;
      } else {
        detail = bodyText;
      }
    } catch {
      detail = "";
    }

    const message = detail
      ? `Background removal failed: ${detail}`
      : "Background removal failed.";

    throw new HttpError(502, message, "removebg_failed");
  }

  return Buffer.from(response.data);
}
