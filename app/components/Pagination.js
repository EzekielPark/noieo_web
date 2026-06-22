import Link from "next/link";

function pageHref(page, categoryFilter) {
  const group = Math.ceil(page / 5);
  const href = `/test/${group}/${page}`;
  return categoryFilter && categoryFilter !== "all" ? `${href}?category=${categoryFilter}` : href;
}

function groupHref(group, categoryFilter) {
  const href = `/test/${group}`;
  return categoryFilter && categoryFilter !== "all" ? `${href}?category=${categoryFilter}` : href;
}

export default function Pagination({ pagination, categoryFilter }) {
  return (
    <div className="pagination">
      {pagination.hasPrevGroup ? (
        <Link className="pagination-link" href={groupHref(pagination.currentGroup - 1, categoryFilter)}>
          Prev
        </Link>
      ) : null}
      {pagination.pages.map((page) => (
        <Link
          key={page}
          className={`pagination-link${page === pagination.currentPage ? " is-active" : ""}`}
          href={pageHref(page, categoryFilter)}
        >
          {page}
        </Link>
      ))}
      {pagination.hasNextGroup ? (
        <Link className="pagination-link" href={groupHref(pagination.currentGroup + 1, categoryFilter)}>
          Next
        </Link>
      ) : null}
    </div>
  );
}
