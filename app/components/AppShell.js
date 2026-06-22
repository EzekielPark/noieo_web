import Link from "next/link";

export default function AppShell({ children, actions }) {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="app-header">
          <Link href="/">
            <h1 className="brand-title">NOIEO</h1>
          </Link>
          {actions ? <div className="toolbar">{actions}</div> : null}
        </div>
        <div className="content-stack">{children}</div>
      </div>
    </div>
  );
}
