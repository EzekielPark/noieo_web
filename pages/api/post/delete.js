import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const _id = normalizeText(req.body._id);
  const password = normalizeText(req.body.fordelete);
  const db = (await connectDB).db(getDbName());

  if (!_id || !/^\d{4}$/.test(password)) {
    return res.redirect(302, `/delete/${_id}`);
  }

  const post = await db.collection("board").findOne({ _id: new ObjectId(_id) });

  if (!post || post.password !== password) {
    return res.redirect(302, `/delete/${_id}`);
  }

  await db.collection("board").deleteOne({ _id: new ObjectId(_id) });
  await db.collection("comment").deleteMany({ parent: _id });

  return res.redirect(302, "/test/");
}

