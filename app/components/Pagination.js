import Link from "next/link";

function withFilters(href, categoryFilter, subcategoryFilter) {
  if (!categoryFilter || categoryFilter === "all") {
    return href;
  }

  const params = new URLSearchParams({ category: categoryFilter });
  if (subcategoryFilter) {
    params.set("subcategory", subcategoryFilter);
  }
  return `${href}?${params.toString()}`;
}

function pageHref(page, categoryFilter, subcategoryFilter) {
  const group = Math.ceil(page / 5);
  const href = `/test/${group}/${page}`;
  return withFilters(href, categoryFilter, subcategoryFilter);
}

function groupHref(group, categoryFilter, subcategoryFilter) {
  const href = `/test/${group}`;
  return withFilters(href, categoryFilter, subcategoryFilter);
}

export default function Pagination({ pagination, categoryFilter, subcategoryFilter }) {
  return (
    <div className="pagination">
      {pagination.hasPrevGroup ? (
        <Link
          className="pagination-link"
          href={groupHref(pagination.currentGroup - 1, categoryFilter, subcategoryFilter)}
        >
          Prev
        </Link>
      ) : null}
      {pagination.pages.map((page) => (
        <Link
          key={page}
          className={`pagination-link${page === pagination.currentPage ? " is-active" : ""}`}
          href={pageHref(page, categoryFilter, subcategoryFilter)}
        >
          {page}
        </Link>
      ))}
      {pagination.hasNextGroup ? (
        <Link
          className="pagination-link"
          href={groupHref(pagination.currentGroup + 1, categoryFilter, subcategoryFilter)}
        >
          Next
        </Link>
      ) : null}
    </div>
  );
}
