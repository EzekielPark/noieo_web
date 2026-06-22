import crypto from "crypto";
import nodemailer from "nodemailer";
import { getDbName } from "./board";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidGmailEmail(value) {
  const email = normalizeEmail(value);
  return /^[^@\s]+@gmail\.com$/.test(email);
}

export function trimToLength(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export function writerApplications(dbClient) {
  return dbClient.db(getDbName()).collection("writer_applications");
}

export function writerVerificationCodes(dbClient) {
  return dbClient.db(getDbName()).collection("writer_verification_codes");
}

export async function isApprovedWriter(dbClient, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const application = await writerApplications(dbClient).findOne({
    email: normalized,
    status: "approved",
  });

  return Boolean(application);
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashVerificationCode(email, code) {
  return crypto
    .createHash("sha256")
    .update(`${normalizeEmail(email)}:${String(code || "").trim()}`)
    .digest("hex");
}

export function getVerificationExpiryDate(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function saveVerificationCode(dbClient, email, code) {
  const collection = writerVerificationCodes(dbClient);
  const normalized = normalizeEmail(email);
  const hashedCode = hashVerificationCode(normalized, code);
  const expiresAt = getVerificationExpiryDate(10);

  await collection.deleteMany({ email: normalized });
  await collection.insertOne({
    email: normalized,
    hashedCode,
    createdAt: new Date(),
    expiresAt,
    verifiedAt: null,
  });

  return expiresAt;
}

export async function verifySubmittedCode(dbClient, email, code) {
  const collection = writerVerificationCodes(dbClient);
  const normalized = normalizeEmail(email);
  const hashedCode = hashVerificationCode(normalized, code);
  const record = await collection.findOne({ email: normalized });

  if (!record) {
    return { ok: false, reason: "missing" };
  }

  if (record.verifiedAt) {
    return { ok: true, reason: "already_verified" };
  }

  if (record.expiresAt instanceof Date && record.expiresAt.getTime() < Date.now()) {
    await collection.deleteMany({ email: normalized });
    return { ok: false, reason: "expired" };
  }

  if (record.hashedCode !== hashedCode) {
    return { ok: false, reason: "invalid" };
  }

  await collection.updateOne(
    { _id: record._id },
    {
      $set: {
        verifiedAt: new Date(),
      },
    },
  );

  return { ok: true, reason: "verified" };
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user, pass },
    from,
  };
}

export async function sendWriterVerificationEmail(email, code) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    throw new Error("smtp_not_configured");
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
  });

  await transporter.sendMail({
    from: smtpConfig.from,
    to: email,
    subject: "[NOIEO] Writer verification code",
    text: `Verification code: ${code}\nThis code expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111"><strong>NOIEO writer verification</strong><p>Verification code: <b style="font-size:22px;letter-spacing:2px">${code}</b></p><p>This code expires in 10 minutes.</p></div>`,
  });
}
