import Link from "next/link";
import AppShell from "./AppShell";
import BoardList from "./BoardList";
import CategoryFilter from "./CategoryFilter";
import Pagination from "./Pagination";

export default function BoardPage({
  posts,
  pagination,
  categoryFilter = "all",
  subcategoryFilter = "",
}) {
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
        <CategoryFilter activeCategory={categoryFilter} activeSubcategory={subcategoryFilter} />
        <BoardList posts={posts} />
        <Pagination
          pagination={pagination}
          categoryFilter={categoryFilter}
          subcategoryFilter={subcategoryFilter}
        />
      </div>
    </AppShell>
  );
}
