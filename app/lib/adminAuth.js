import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "noieo_admin_session";

function adminSecret() {
  return process.env.ADMIN_PASSWORD || "";
}

export function hasAdminPassword() {
  return Boolean(adminSecret());
}

export function createAdminToken() {
  return crypto
    .createHmac("sha256", adminSecret())
    .update("noieo-admin")
    .digest("hex");
}

export function isValidAdminToken(token) {
  if (!token || !hasAdminPassword()) {
    return false;
  }

  const expected = createAdminToken();
  const left = Buffer.from(String(token));
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function buildAdminCookie() {
  return `${ADMIN_COOKIE_NAME}=${createAdminToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearAdminCookie() {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

