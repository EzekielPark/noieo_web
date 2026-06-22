import { connectDB } from "app/test/mongo/database";
import { allowRequestByIp } from "app/lib/rateLimit";
import {
  generateVerificationCode,
  isValidGmailEmail,
  normalizeEmail,
  saveVerificationCode,
  sendWriterVerificationEmail,
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
    params.set("email_sent", "1");
  }
  return `/apply-writer?${params.toString()}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const email = normalizeEmail(req.body.email);

  if (!isValidGmailEmail(email)) {
    return res.redirect(302, buildRedirect(email, "invalid_email"));
  }

  const client = await connectDB;
  const isAllowed = await allowRequestByIp({
    dbClient: client,
    req,
    key: `writer:send-code:${email}`,
    windowSeconds: 60,
  });

  if (!isAllowed) {
    res.setHeader("Retry-After", "60");
    return res.redirect(302, buildRedirect(email, "code_rate_limit"));
  }

  const existing = await writerApplications(client).findOne({
    email,
    status: { $in: ["pending", "approved"] },
  });

  if (existing) {
    return res.redirect(302, buildRedirect(email, "duplicate"));
  }

  const code = generateVerificationCode();

  try {
    await saveVerificationCode(client, email, code);
    await sendWriterVerificationEmail(email, code);
    return res.redirect(302, buildRedirect(email, null, true));
  } catch (error) {
    console.error(error);
    return res.redirect(302, buildRedirect(email, "mail_send_failed"));
  }
}
