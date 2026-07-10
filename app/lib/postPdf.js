import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const MAX_POST_DOCUMENT_BYTES = 50 * 1000 * 1000;
const DOCUMENT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");

const DOCUMENT_TYPES = {
  pdf: {
    extension: "pdf",
    mimePattern: /^application\/pdf$/i,
    fallbackMimePattern: /^application\/octet-stream$/i,
  },
  epub: {
    extension: "epub",
    mimePattern: /^application\/epub\+zip$/i,
    fallbackMimePattern: /^application\/octet-stream$/i,
  },
};

function getDataUrlSize(base64) {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function getExtension(name = "") {
  return String(name).toLowerCase().split(".").pop();
}

function normalizeDocumentType({ mimeType, name }) {
  const extension = getExtension(name);

  for (const [type, config] of Object.entries(DOCUMENT_TYPES)) {
    if (config.mimePattern.test(mimeType)) {
      return type;
    }

    if (extension === config.extension && config.fallbackMimePattern.test(mimeType)) {
      return type;
    }
  }

  return "";
}

export function validatePdfDataUrl(dataUrl, name = "") {
  if (!dataUrl) {
    return { ok: true, empty: true };
  }

  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    return { ok: false, reason: "invalid_type" };
  }

  const mimeType = match[1];
  const type = normalizeDocumentType({ mimeType, name });
  if (!type) {
    return { ok: false, reason: "invalid_type" };
  }

  const base64 = match[2];
  const size = getDataUrlSize(base64);
  if (size <= 0 || size > MAX_POST_DOCUMENT_BYTES) {
    return { ok: false, reason: "invalid_size" };
  }

  return { ok: true, base64, size, type, mimeType };
}

export async function savePostPdf({ dataUrl, name } = {}) {
  const result = validatePdfDataUrl(dataUrl, name);
  if (!result.ok || result.empty) {
    return null;
  }

  await fs.mkdir(DOCUMENT_UPLOAD_DIR, { recursive: true });
  const extension = DOCUMENT_TYPES[result.type].extension;
  const safeName = String(name || `document.${extension}`)
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || `document.${extension}`;
  const displayName = safeName.toLowerCase().endsWith(`.${extension}`)
    ? safeName
    : `${safeName}.${extension}`;
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(DOCUMENT_UPLOAD_DIR, filename);
  await fs.writeFile(filePath, Buffer.from(result.base64, "base64"));

  return {
    url: `/uploads/documents/${filename}`,
    name: displayName,
    size: result.size,
    type: result.type,
    mimeType: result.mimeType,
  };
}
