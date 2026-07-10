import Link from "next/link";
import AppShell from "./AppShell";
import BoardList from "./BoardList";
import CategoryFilter from "./CategoryFilter";
import Pagination from "./Pagination";
import { getTranslateUrl, isEnglish, withLang } from "../lib/i18n";

function getBoardPath(categoryFilter, subcategoryFilter, lang) {
  let path = "/test/";
  const params = new URLSearchParams();

  if (categoryFilter && categoryFilter !== "all") {
    params.set("category", categoryFilter);
  }
  if (subcategoryFilter) {
    params.set("subcategory", subcategoryFilter);
  }
  if (isEnglish(lang)) {
    params.set("lang", "en");
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default function BoardPage({
  posts,
  pagination,
  categoryFilter = "all",
  subcategoryFilter = "",
  lang = "ko",
}) {
  const english = isEnglish(lang);
  const boardPath = getBoardPath(categoryFilter, subcategoryFilter, lang);

  return (
    <AppShell
      actions={
        <>
          {english ? (
            <Link className="button-secondary" href="/test/">
              KR
            </Link>
          ) : (
            <a className="button-secondary" href={getTranslateUrl(boardPath)} target="_blank" rel="noreferrer">
              EN
            </a>
          )}
          {english ? (
            <a className="button-secondary" href={getTranslateUrl(boardPath)} target="_blank" rel="noreferrer">
              Translate Page
            </a>
          ) : null}
          <Link className="button-secondary" href={withLang("/apply-writer/", lang)}>
            {english ? "Apply" : "신청"}
          </Link>
          <Link className="button-primary" href={withLang("/write/", lang)}>
            {english ? "Write" : "글쓰기"}
          </Link>
        </>
      }
    >
      <div className="main-panel board-shell glass-panel">
        <CategoryFilter activeCategory={categoryFilter} activeSubcategory={subcategoryFilter} lang={lang} />
        <BoardList posts={posts} lang={lang} />
        <Pagination
          pagination={pagination}
          categoryFilter={categoryFilter}
          subcategoryFilter={subcategoryFilter}
          lang={lang}
        />
      </div>
    </AppShell>
  );
}
