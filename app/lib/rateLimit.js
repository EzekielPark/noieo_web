import { getDbName } from "./board";

function firstForwardedIp(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return String(value || "")
    .split(",")[0]
    .trim();
}

export function getClientIp(req) {
  const forwarded = firstForwardedIp(req.headers["x-forwarded-for"]);
  const realIp = firstForwardedIp(req.headers["x-real-ip"]);
  const socketIp = req.socket?.remoteAddress || "";
  return forwarded || realIp || socketIp || "unknown";
}

export async function allowRequestByIp({ dbClient, req, key, windowSeconds }) {
  const db = dbClient.db(getDbName());
  const ip = getClientIp(req);
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);
  const collection = db.collection("rate_limit_events");

  const recent = await collection.findOne(
    {
      key,
      ip,
      createdAt: { $gt: cutoff },
    },
    {
      sort: { createdAt: -1 },
    }
  );

  if (recent) {
    return false;
  }

  await collection.insertOne({
    key,
    ip,
    createdAt: now,
  });

  return true;
}
