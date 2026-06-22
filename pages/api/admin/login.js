import { buildAdminCookie, hasAdminPassword } from "app/lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (!hasAdminPassword() || req.body.password !== process.env.ADMIN_PASSWORD) {
    return res.redirect(302, "/admin/login?error=invalid");
  }

  res.setHeader("Set-Cookie", buildAdminCookie());
  return res.redirect(302, "/admin/applications");
}

