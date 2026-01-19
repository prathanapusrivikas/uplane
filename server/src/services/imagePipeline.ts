export async function flipImage(buffer: Buffer): Promise<Buffer> {
  const { default: Jimp } = await import("jimp");
  const image = await Jimp.read(buffer);
  image.flip(true, false);
  return await image.getBufferAsync(Jimp.MIME_PNG);
}
