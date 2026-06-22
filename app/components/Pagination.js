import Link from "next/link";

function pageHref(page) {
  const group = Math.ceil(page / 5);
  return `/test/${group}/${page}`;
}

export default function Pagination({ pagination }) {
  return (
    <div className="pagination">
      {pagination.hasPrevGroup ? (
        <Link className="pagination-link" href={`/test/${pagination.currentGroup - 1}`}>
          Prev
        </Link>
      ) : null}
      {pagination.pages.map((page) => (
        <Link
          key={page}
          className={`pagination-link${page === pagination.currentPage ? " is-active" : ""}`}
          href={pageHref(page)}
        >
          {page}
        </Link>
      ))}
      {pagination.hasNextGroup ? (
        <Link className="pagination-link" href={`/test/${pagination.currentGroup + 1}`}>
          Next
        </Link>
      ) : null}
    </div>
  );
}

