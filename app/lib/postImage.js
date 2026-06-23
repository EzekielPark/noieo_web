export const MAX_POST_IMAGE_BYTES = 10 * 1000 * 1000;
export const ALLOWED_POST_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

export function getPostImageError(file) {
  if (!file) {
    return "";
  }

  if (!ALLOWED_POST_IMAGE_TYPES.has(file.type)) {
    return "JPG, PNG, GIF, WEBP, AVIF 이미지 파일만 첨부할 수 있습니다.";
  }

  if (file.size > MAX_POST_IMAGE_BYTES) {
    return "이미지는 최대 10MB까지 첨부할 수 있습니다.";
  }

  return "";
}

function getDataUrlSize(base64) {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function normalizePostImage({ dataUrl, name } = {}) {
  if (!dataUrl) {
    return null;
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const size = getDataUrlSize(base64);

  if (!ALLOWED_POST_IMAGE_TYPES.has(mimeType) || size <= 0 || size > MAX_POST_IMAGE_BYTES) {
    return null;
  }

  return {
    dataUrl,
    mimeType,
    size,
    name: String(name || "image").slice(0, 120),
  };
}
