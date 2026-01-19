import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "./config";
import { ImageRecord } from "./types";

type DbShape = {
  images: ImageRecord[];
};

const dbPath = resolve(config.dbPath);
let cache = new Map<string, ImageRecord>();

function persist(): void {
  const data: DbShape = { images: Array.from(cache.values()) };
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function load(): void {
  if (!existsSync(dbPath)) {
    persist();
    return;
  }

  try {
    const raw = readFileSync(dbPath, "utf8");
    if (!raw.trim()) {
      persist();
      return;
    }
    const data = JSON.parse(raw) as DbShape;
    if (Array.isArray(data.images)) {
      cache = new Map(data.images.map((image) => [image.id, image]));
    }
  } catch {
    cache = new Map();
    persist();
  }
}

load();

export function insertImage(record: ImageRecord): void {
  cache.set(record.id, record);
  persist();
}

export function getImageById(id: string): ImageRecord | undefined {
  return cache.get(id);
}

export function deleteImageById(id: string): void {
  cache.delete(id);
  persist();
}
