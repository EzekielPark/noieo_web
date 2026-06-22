import { clearAdminCookie } from "app/lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  res.setHeader("Set-Cookie", clearAdminCookie());
  return res.redirect(302, "/admin/login");
}

