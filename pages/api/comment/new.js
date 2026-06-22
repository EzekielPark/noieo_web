import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";
import { allowRequestByIp } from "app/lib/rateLimit";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const parent = normalizeText(req.body.parent);
  const author = normalizeText(req.body.author, "guest");
  const comment = normalizeText(req.body.comment);
  const password = normalizeText(req.body.password);
  const replyTo = normalizeText(req.body.replyTo);

  if (!parent || !comment || !/^\d{4}$/.test(password)) {
    return res.redirect(302, `/test/with/${parent}`);
  }

  const client = await connectDB;
  const isAllowed = await allowRequestByIp({
    dbClient: client,
    req,
    key: "comment:create",
    windowSeconds: 10,
  });

  if (!isAllowed) {
    res.setHeader("Retry-After", "10");
    return res.redirect(302, `/test/with/${parent}?error=rate_limit`);
  }

  const db = client.db(getDbName());
  let normalizedReplyTo = "";

  if (replyTo && ObjectId.isValid(replyTo)) {
    const rootComment = await db.collection("comment").findOne({ _id: new ObjectId(replyTo), parent });
    normalizedReplyTo = rootComment?.replyTo ? "" : replyTo;
  }

  await db.collection("comment").insertOne({
    parent,
    author,
    comment,
    password,
    replyTo: normalizedReplyTo,
  });

  return res.redirect(302, `/test/with/${parent}`);
}
