import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "../../lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (isValidAdminToken(token)) {
    redirect("/admin/applications");
  }

  const notice =
    searchParams?.error === "invalid"
      ? "관리자 비밀번호가 올바르지 않습니다."
      : undefined;

  return (
    <div className="page-shell">
      <div className="center-panel glass-panel">
        <div className="section-heading">
          <h2 className="section-title">Admin Login</h2>
        </div>
        {notice ? <p className="notice-inline">{notice}</p> : null}
        <form className="form-panel" action="/api/admin/login" method="POST">
          <div className="form-grid">
            <label className="field--full">
              <span>Password</span>
              <input type="password" name="password" required />
            </label>
          </div>
          <div className="form-actions">
            <button className="button-primary" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

