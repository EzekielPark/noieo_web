import Link from "next/link";
import AppShell from "../components/AppShell";

export const dynamic = "force-dynamic";

function noticeFromQuery(searchParams) {
  switch (searchParams?.error) {
    case "rate_limit":
      return "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694";
    case "code_rate_limit":
      return "\uC778\uC99D\uCF54\uB4DC \uBC1C\uC1A1\uC740 1\uBD84 \uB4A4\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.";
    case "invalid_email":
      return "gmail.com \uC774\uBA54\uC77C\uB9CC \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
    case "duplicate":
      return "\uC774\uBBF8 \uC2E0\uCCAD\uD588\uAC70\uB098 \uC2B9\uC778\uB41C \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4.";
    case "invalid_input":
      return "\uBAA8\uB4E0 \uD56D\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.";
    case "send_code_first":
      return "\uBA3C\uC800 \uC778\uC99D\uCF54\uB4DC\uB97C \uBC1C\uC1A1\uD574\uC8FC\uC138\uC694.";
    case "invalid_code":
      return "\uC778\uC99D\uCF54\uB4DC\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
    case "expired_code":
      return "\uC778\uC99D\uCF54\uB4DC \uC720\uD6A8\uC2DC\uAC04\uC774 \uC9C0\uB0AC\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uBC1C\uC1A1\uD574\uC8FC\uC138\uC694.";
    case "mail_send_failed":
      return "\uBA54\uC77C \uBC1C\uC1A1 \uC124\uC815\uC774 \uC5C6\uAC70\uB098 \uBC1C\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
    default:
      return searchParams?.success === "1"
        ? "\uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
        : searchParams?.email_sent === "1"
          ? "\uC778\uC99D\uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4."
          : undefined;
  }
}

export default async function ApplyWriterPage({ searchParams }) {
  const notice = noticeFromQuery(searchParams);
  const defaultEmail = typeof searchParams?.email === "string" ? searchParams.email : "";

  return (
    <AppShell
      actions={
        <Link className="button-secondary" href="/write/">
          Back
        </Link>
      }
    >
      <div className="form-panel glass-panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Writer Approval</h2>
            <p className="form-help">
              {"\uC2B9\uC778\uB41C \uC2E0\uCCAD\uC790\uB9CC \uBCF8\uBB38 \uAE00\uC4F0\uAE30\uAC00 \uAC00\uB2A5\uD569\uB2C8\uB2E4."}
            </p>
          </div>
        </div>
        {notice ? <p className="notice-inline">{notice}</p> : null}

        <form className="verify-panel" action="/api/writer/send-code" method="POST">
          <div className="verify-inline">
            <label>
              <span>gmail.com email</span>
              <input
                name="email"
                maxLength="80"
                placeholder="example@gmail.com"
                defaultValue={defaultEmail}
                required
              />
            </label>
            <button className="button-secondary" type="submit">
              {"\uCF54\uB4DC \uBC1C\uC1A1"}
            </button>
          </div>
        </form>

        <form className="form-grid" action="/api/writer/apply" method="POST">
          <label className="field--full">
            <span>gmail.com email</span>
            <input
              name="email"
              maxLength="80"
              placeholder="example@gmail.com"
              defaultValue={defaultEmail}
              required
            />
          </label>
          <label className="field--full">
            <span>{"\uC778\uC99D \uCF54\uB4DC"}</span>
            <input name="verificationCode" maxLength="6" inputMode="numeric" required />
          </label>
          <label>
            <span>{"\uC88B\uC544\uD558\uB294 \uCC45"}</span>
            <input name="favoriteBook" maxLength="20" required />
          </label>
          <label>
            <span>{"\uC88B\uC544\uD558\uB294 \uD559\uC790"}</span>
            <input name="favoriteScholar" maxLength="20" required />
          </label>
          <label className="field--full">
            <span>{"\uC4F0\uACE0 \uC2F6\uC740 \uAE00\uC5D0 \uB300\uD558\uC5EC"}</span>
            <textarea name="writingIntent" maxLength="200" required />
          </label>
          <div className="form-actions field--full">
            <button className="button-primary" type="submit">
              {"\uC2E0\uCCAD \uC81C\uCD9C"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
