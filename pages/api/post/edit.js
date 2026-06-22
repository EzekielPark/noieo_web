import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const db = (await connectDB).db(getDbName());
  const _id = normalizeText(req.body._id);
  const password = normalizeText(req.body.password);
  const title = normalizeText(req.body.title);
  const content = normalizeText(req.body.content);

  if (!_id || !title || !content || !/^\d{4}$/.test(password)) {
    return res.redirect(302, `/edit/${_id}`);
  }

  const post = await db.collection("board").findOne({ _id: new ObjectId(_id) });

  if (!post || post.password !== password) {
    return res.redirect(302, `/edit/${_id}`);
  }

  await db.collection("board").updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: {
        title,
        content,
      },
    }
  );

  return res.redirect(302, `/test/with/${_id}`);
}
