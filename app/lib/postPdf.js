import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const MAX_POST_PDF_BYTES = 50 * 1000 * 1000;
const PDF_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "pdfs");

function getDataUrlSize(base64) {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function validatePdfDataUrl(dataUrl) {
  if (!dataUrl) {
    return { ok: true, empty: true };
  }

  const match = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    return { ok: false, reason: "invalid_type" };
  }

  const base64 = match[1];
  const size = getDataUrlSize(base64);
  if (size <= 0 || size > MAX_POST_PDF_BYTES) {
    return { ok: false, reason: "invalid_size" };
  }

  return { ok: true, base64, size };
}

export async function savePostPdf({ dataUrl, name } = {}) {
  const result = validatePdfDataUrl(dataUrl);
  if (!result.ok || result.empty) {
    return null;
  }

  await fs.mkdir(PDF_UPLOAD_DIR, { recursive: true });
  const safeName = String(name || "document.pdf")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "document.pdf";
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.pdf`;
  const filePath = path.join(PDF_UPLOAD_DIR, filename);
  await fs.writeFile(filePath, Buffer.from(result.base64, "base64"));

  return {
    url: `/uploads/pdfs/${filename}`,
    name: safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`,
    size: result.size,
  };
}
