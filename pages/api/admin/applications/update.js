import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "app/lib/adminAuth";

function cookieValue(req, name) {
  const raw = String(req.headers.cookie || "");
  const match = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const token = cookieValue(req, ADMIN_COOKIE_NAME);
  if (!isValidAdminToken(token)) {
    return res.redirect(302, "/admin/login");
  }

  const _id = normalizeText(req.body._id);
  const status = normalizeText(req.body.status);
  const redirectTo = normalizeText(req.body.redirectTo) || "/admin/applications";
  if (!_id || !["approved", "rejected"].includes(status)) {
    return res.redirect(302, "/admin/applications");
  }

  const db = (await connectDB).db(getDbName());
  await db.collection("writer_applications").updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: {
        status,
        approvedAt: status === "approved" ? new Date() : null,
      },
    }
  );

  return res.redirect(302, redirectTo.startsWith("/admin/applications") ? redirectTo : "/admin/applications");
}
