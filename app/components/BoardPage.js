import Link from "next/link";
import AppShell from "./AppShell";
import BoardList from "./BoardList";
import Pagination from "./Pagination";
import { POST_CATEGORIES } from "../lib/categories";

function categoryHref(category) {
  return category === "all" ? "/test/" : `/test/?category=${category}`;
}

function CategoryFilter({ activeCategory }) {
  const filters = [{ value: "all", label: "전체" }, ...POST_CATEGORIES];

  return (
    <nav className="category-filter" aria-label="게시판 분류">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          className={`category-filter__item${activeCategory === filter.value ? " is-active" : ""}`}
          href={categoryHref(filter.value)}
        >
          {filter.label}
        </Link>
      ))}
    </nav>
  );
}

export default function BoardPage({ posts, pagination, categoryFilter = "all" }) {
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
        <CategoryFilter activeCategory={categoryFilter} />
        <BoardList posts={posts} />
        <Pagination pagination={pagination} categoryFilter={categoryFilter} />
      </div>
    </AppShell>
  );
}
