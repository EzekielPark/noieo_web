import Link from "next/link";
import AppShell from "./AppShell";
import BoardList from "./BoardList";
import Pagination from "./Pagination";

export default function BoardPage({ posts, pagination }) {
  return (
    <AppShell
      actions={
        <>
          <Link className="button-secondary" href="/apply-writer/">
            Apply
          </Link>
          <Link className="button-primary" href="/write/">
            Write
          </Link>
        </>
      }
    >
      <div className="main-panel board-shell glass-panel">
        <BoardList posts={posts} />
        <Pagination pagination={pagination} />
      </div>
    </AppShell>
  );
}
