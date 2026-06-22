import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const _id = normalizeText(req.body._id);
  const parent = normalizeText(req.body.parent);
  const password = normalizeText(req.body.fordelete);
  const db = (await connectDB).db(getDbName());

  if (!_id || !parent || !/^\d{4}$/.test(password)) {
    return res.redirect(302, `/test/with/${parent}`);
  }

  const comment = await db.collection("comment").findOne({ _id: new ObjectId(_id) });

  if (!comment || comment.password !== password) {
    return res.redirect(302, `/test/with/${parent}`);
  }

  await db.collection("comment").deleteOne({ _id: new ObjectId(_id) });

  return res.redirect(302, `/test/with/${parent}`);
}

