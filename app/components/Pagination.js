import Link from "next/link";

function withFilters(href, categoryFilter, subcategoryFilter, lang) {
  const params = new URLSearchParams();

  if (categoryFilter && categoryFilter !== "all") {
    params.set("category", categoryFilter);
  }
  if (subcategoryFilter) {
    params.set("subcategory", subcategoryFilter);
  }
  if (lang === "en") {
    params.set("lang", "en");
  }

  const query = params.toString();
  return query ? `${href}?${query}` : href;
}

function pageHref(page, categoryFilter, subcategoryFilter, lang) {
  const group = Math.ceil(page / 5);
  const href = `/test/${group}/${page}`;
  return withFilters(href, categoryFilter, subcategoryFilter, lang);
}

function groupHref(group, categoryFilter, subcategoryFilter, lang) {
  const href = `/test/${group}`;
  return withFilters(href, categoryFilter, subcategoryFilter, lang);
}

export default function Pagination({ pagination, categoryFilter, subcategoryFilter, lang = "ko" }) {
  return (
    <div className="pagination">
      {pagination.hasPrevGroup ? (
        <Link
          className="pagination-link"
          href={groupHref(pagination.currentGroup - 1, categoryFilter, subcategoryFilter, lang)}
        >
          Prev
        </Link>
      ) : null}
      {pagination.pages.map((page) => (
        <Link
          key={page}
          className={`pagination-link${page === pagination.currentPage ? " is-active" : ""}`}
          href={pageHref(page, categoryFilter, subcategoryFilter, lang)}
        >
          {page}
        </Link>
      ))}
      {pagination.hasNextGroup ? (
        <Link
          className="pagination-link"
          href={groupHref(pagination.currentGroup + 1, categoryFilter, subcategoryFilter, lang)}
        >
          Next
        </Link>
      ) : null}
    </div>
  );
}
