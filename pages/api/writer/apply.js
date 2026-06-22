import { connectDB } from "app/test/mongo/database";
import { allowRequestByIp } from "app/lib/rateLimit";
import {
  isValidGmailEmail,
  normalizeEmail,
  trimToLength,
  verifySubmittedCode,
  writerApplications,
} from "app/lib/writerApproval";

function buildRedirect(email, error, success) {
  const params = new URLSearchParams();
  if (email) {
    params.set("email", email);
  }
  if (error) {
    params.set("error", error);
  }
  if (success) {
    params.set("success", "1");
  }
  return `/apply-writer?${params.toString()}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const email = normalizeEmail(req.body.email);
  const favoriteBook = trimToLength(req.body.favoriteBook, 20);
  const favoriteScholar = trimToLength(req.body.favoriteScholar, 20);
  const writingIntent = trimToLength(req.body.writingIntent, 200);
  const verificationCode = trimToLength(req.body.verificationCode, 6);

  if (!isValidGmailEmail(email)) {
    return res.redirect(302, buildRedirect(email, "invalid_email"));
  }

  if (!favoriteBook || !favoriteScholar || !writingIntent || !verificationCode) {
    return res.redirect(302, buildRedirect(email, "invalid_input"));
  }

  const client = await connectDB;
  const isAllowed = await allowRequestByIp({
    dbClient: client,
    req,
    key: "writer:apply",
    windowSeconds: 1800,
  });

  if (!isAllowed) {
    res.setHeader("Retry-After", "1800");
    return res.redirect(302, buildRedirect(email, "rate_limit"));
  }

  const verificationResult = await verifySubmittedCode(client, email, verificationCode);

  if (!verificationResult.ok) {
    const reason =
      verificationResult.reason === "expired"
        ? "expired_code"
        : verificationResult.reason === "missing"
          ? "send_code_first"
          : "invalid_code";
    return res.redirect(302, buildRedirect(email, reason));
  }

  const collection = writerApplications(client);
  const existing = await collection.findOne({
    email,
    status: { $in: ["pending", "approved"] },
  });

  if (existing) {
    return res.redirect(302, buildRedirect(email, "duplicate"));
  }

  await collection.insertOne({
    email,
    favoriteBook,
    favoriteScholar,
    writingIntent,
    status: "pending",
    createdAt: new Date(),
    approvedAt: null,
    lastSubmitIp: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
  });

  return res.redirect(302, buildRedirect(email, null, true));
}
