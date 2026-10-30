import sharp from "sharp";

/** Longest side kept for store images; product galleries never show them larger. */
export const MAX_IMAGE_SIDE = 1600;
const WEBP_QUALITY = 82;

export type CompressedImage = {
  buffer: Buffer;
  ext: "webp";
  contentType: "image/webp";
  width: number;
  height: number;
};

/**
 * One step for every image we store (admin uploads, category icons, the Telegram bot):
 * EXIF-rotate, drop metadata, fit inside 1600px without enlarging, WebP q82
 * (alpha kept for transparent PNG icons; GIF animation kept).
 * Returns null when sharp can't decode the file, so the caller can store it as-is.
 */
export async function compressImage(input: Buffer): Promise<CompressedImage | null> {
  try {
    const { data, info } = await sharp(input, { failOn: "none", animated: true })
      .rotate()
      .resize({
        width: MAX_IMAGE_SIDE,
        height: MAX_IMAGE_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, alphaQuality: 90, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      ext: "webp",
      contentType: "image/webp",
      width: info.width,
      height: info.pageHeight ?? info.height,
    };
  } catch (e) {
    console.error("[compressImage]", e);
    return null;
  }
}
