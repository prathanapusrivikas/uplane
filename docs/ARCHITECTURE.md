# Architecture and Pipeline

## Overview
This project is a full-stack image transformation service. Users upload a single image, the backend removes the background via remove.bg, flips the image horizontally, hosts the result on Cloudinary, and returns a shareable URL. Users can also delete both the original and processed images.

The system is intentionally split into a web client and a backend API to keep the user experience fast while keeping API keys and third-party integrations secure on the server.

## High-level architecture
- Frontend (React + Vite): handles file selection, upload, status updates, and showing the final URL.
- Backend (Express + TypeScript): accepts uploads, calls the remove.bg API, flips the resulting image, uploads to Cloudinary, and stores metadata.
- Storage: a JSON file (`server/data.json`) tracks image IDs and Cloudinary public IDs so deletions are possible.

## Pipeline flow
1. Upload
   - The browser posts a multipart form-data request to `POST /api/images` with the `image` field.
   - The backend uses Multer to read the file into memory and validates that it is an image.

2. Background removal (remove.bg)
   - The backend sends the image buffer to remove.bg via HTTPS.
   - The remove.bg response is expected to be a PNG with transparency.
   - The response is treated as a raw binary buffer to avoid quality loss.

3. Horizontal flip
   - The server flips the transparent PNG horizontally using Jimp.
   - Output is encoded back to PNG to preserve transparency.

4. Hosting
   - The backend uploads:
     - the original image to `cloudinary/<folder>/originals`
     - the processed image to `cloudinary/<folder>/processed`
   - The API returns a secure Cloudinary URL for the processed image.

5. Metadata persistence
   - The backend stores the image record in `server/data.json`:
     - `id` (UUID)
     - `originalPublicId`
     - `processedPublicId`
     - `processedUrl`
     - `createdAt`

6. Deletion
   - `DELETE /api/images/:id` uses the stored Cloudinary public IDs to delete both assets.
   - The record is removed from the local JSON store.

## Key design choices
- **Remove.bg for background removal**: It provides reliable background removal and a free tier for testing, which matches the challenge requirements.
- **Cloudinary for hosting**: It offers a stable CDN URL, clean asset deletion via public IDs, and is easy to configure.
- **JSON storage over SQLite**: The goal is to avoid native build dependencies and make local setup fast. The store is intentionally simple and can be swapped later for SQLite or a hosted database.
- **Buffer-based processing**: The pipeline avoids writing to disk during transformation, reducing latency and keeping processing scoped to memory for simplicity.

## Error handling strategy
- Client-friendly JSON errors with `error` and `message` fields.
- Common cases handled explicitly:
  - missing file
  - unsupported file type
  - file too large (10MB limit)
  - remove.bg failure
  - Cloudinary upload or deletion failure

## What to evolve next
- Replace JSON storage with a real database for concurrency and durability.
- Add a queue if transformation volume increases.
- Add a dedicated results page with history or a public share page.
