import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "../../components/AppShell";
import { ADMIN_COOKIE_NAME, isValidAdminToken } from "../../lib/adminAuth";
import { connectDB } from "../../test/mongo/database";
import { getDbName } from "../../lib/board";

export const dynamic = "force-dynamic";

const PAGE_SIZE_OPTIONS = [20, 50];

function normalizeStatus(value) {
  return ["pending", "approved", "rejected", "all"].includes(value) ? value : "pending";
}

function normalizePage(value) {
  const page = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function normalizePageSize(value) {
  const pageSize = Number.parseInt(String(value || "20"), 10);
  return PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 20;
}

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase().slice(0, 80);
}

function buildFilter(status, query) {
  const filter = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (query) {
    filter.email = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  return filter;
}

function buildQueryString({ status, query, page, pageSize }) {
  const params = new URLSearchParams();
  if (status && status !== "pending") {
    params.set("status", status);
  }
  if (query) {
    params.set("query", query);
  }
  if (page && page !== 1) {
    params.set("page", String(page));
  }
  if (pageSize && pageSize !== 20) {
    params.set("pageSize", String(pageSize));
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

function pageHref(overrides, current) {
  return `/admin/applications${buildQueryString({ ...current, ...overrides })}`;
}

export default async function AdminApplicationsPage({ searchParams }) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidAdminToken(token)) {
    redirect("/admin/login");
  }

  const status = normalizeStatus(searchParams?.status);
  const query = normalizeQuery(searchParams?.query);
  const pageSize = normalizePageSize(searchParams?.pageSize);
  const requestedPage = normalizePage(searchParams?.page);
  const currentQuery = { status, query, page: requestedPage, pageSize };

  const db = (await connectDB).db(getDbName());
  const collection = db.collection("writer_applications");
  const filter = buildFilter(status, query);
  const totalCount = await collection.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const applications = await collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).toArray();

  const pageWindowStart = Math.max(1, page - 2);
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
  const pageNumbers = [];
  for (let currentPage = Math.max(1, pageWindowEnd - 4); currentPage <= pageWindowEnd; currentPage += 1) {
    pageNumbers.push(currentPage);
  }

  const redirectTo = pageHref({ page }, { status, query, page, pageSize });

  return (
    <AppShell
      actions={
        <form action="/api/admin/logout" method="POST">
          <button className="button-secondary" type="submit">
            Logout
          </button>
        </form>
      }
    >
      <div className="main-panel glass-panel">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Writer Applications</h2>
            <p className="form-help">Recent submissions first, with filters for status and email.</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-filter-row">
            <Link
              className={status === "pending" ? "button-primary" : "button-secondary"}
              href={pageHref({ status: "pending", page: 1 }, currentQuery)}
            >
              Pending
            </Link>
            <Link
              className={status === "approved" ? "button-primary" : "button-secondary"}
              href={pageHref({ status: "approved", page: 1 }, currentQuery)}
            >
              Approved
            </Link>
            <Link
              className={status === "rejected" ? "button-primary" : "button-secondary"}
              href={pageHref({ status: "rejected", page: 1 }, currentQuery)}
            >
              Rejected
            </Link>
            <Link
              className={status === "all" ? "button-primary" : "button-secondary"}
              href={pageHref({ status: "all", page: 1 }, currentQuery)}
            >
              All
            </Link>
          </div>

          <form className="admin-search-row" action="/admin/applications" method="GET">
            <input type="hidden" name="status" value={status} />
            <label className="admin-search-field">
              <span className="sr-only">Search email</span>
              <input
                type="search"
                name="query"
                placeholder="Search email"
                defaultValue={query}
              />
            </label>
            <label className="admin-select-field">
              <span className="sr-only">Page size</span>
              <select name="pageSize" defaultValue={String(pageSize)}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </select>
            </label>
            <input type="hidden" name="page" value="1" />
            <button className="button-secondary" type="submit">
              Apply
            </button>
          </form>
        </div>

        <div className="admin-summary">
          <p className="form-help">
            {totalCount} results · page {page} / {totalPages}
          </p>
        </div>

        <div className="application-list">
          {applications.length ? (
            applications.map((application) => (
              <div className="application-card" key={application._id.toString()}>
                <div className="application-head">
                  <strong>{application.email}</strong>
                  <span className="application-status">{application.status}</span>
                </div>
                <p className="form-help">Favorite book: {application.favoriteBook}</p>
                <p className="form-help">Favorite scholar: {application.favoriteScholar}</p>
                <p className="application-intent">{application.writingIntent}</p>
                <p className="comment-meta">
                  Submitted at: {new Date(application.createdAt).toLocaleString("ko-KR")}
                </p>
                <div className="form-actions">
                  <form action="/api/admin/applications/update" method="POST">
                    <input type="hidden" name="_id" value={application._id.toString()} />
                    <input type="hidden" name="status" value="approved" />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <button className="button-primary" type="submit">
                      Approve
                    </button>
                  </form>
                  <form action="/api/admin/applications/update" method="POST">
                    <input type="hidden" name="_id" value={application._id.toString()} />
                    <input type="hidden" name="status" value="rejected" />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <button className="button-secondary" type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No applications found.</div>
          )}
        </div>

        <div className="pagination">
          <Link
            className={page > 1 ? "pagination-link" : "pagination-link is-disabled"}
            href={page > 1 ? pageHref({ page: page - 1 }, currentQuery) : pageHref({ page: 1 }, currentQuery)}
            aria-disabled={page <= 1}
          >
            Prev
          </Link>
          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              className={pageNumber === page ? "pagination-link is-active" : "pagination-link"}
              href={pageHref({ page: pageNumber }, currentQuery)}
            >
              {pageNumber}
            </Link>
          ))}
          <Link
            className={page < totalPages ? "pagination-link" : "pagination-link is-disabled"}
            href={page < totalPages ? pageHref({ page: page + 1 }, currentQuery) : pageHref({ page: totalPages }, currentQuery)}
            aria-disabled={page >= totalPages}
          >
            Next
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
