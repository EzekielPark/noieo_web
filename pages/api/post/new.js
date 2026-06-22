import { connectDB } from "app/test/mongo/database";
import { formatDate, getDbName, normalizeText } from "app/lib/board";
import { allowRequestByIp } from "app/lib/rateLimit";
import { isApprovedWriter, isValidGmailEmail, normalizeEmail } from "app/lib/writerApproval";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const title = normalizeText(req.body.title);
  const content = normalizeText(req.body.content);
  const password = normalizeText(req.body.password);
  const authorEmail = normalizeEmail(req.body.authorEmail);

  if (!title || !content || !/^\d{4}$/.test(password)) {
    return res.redirect(302, "/write/");
  }

  if (!isValidGmailEmail(authorEmail)) {
    return res.redirect(302, `/write/?error=invalid_email&email=${encodeURIComponent(authorEmail)}`);
  }

  const client = await connectDB;
  const approved = await isApprovedWriter(client, authorEmail);
  if (!approved) {
    return res.redirect(
      302,
      `/write/?error=writer_not_approved&email=${encodeURIComponent(authorEmail)}`
    );
  }

  const isAllowed = await allowRequestByIp({
    dbClient: client,
    req,
    key: "post:create",
    windowSeconds: 30,
  });

  if (!isAllowed) {
    res.setHeader("Retry-After", "30");
    return res.redirect(302, "/write/?error=rate_limit");
  }

  const db = client.db(getDbName());
  const total = await db.collection("board").countDocuments();

  await db.collection("board").insertOne({
    title,
    content,
    authorEmail,
    password,
    date: formatDate(),
    view: 0,
    number: total + 1,
  });

  return res.redirect(302, "/test/");
}
