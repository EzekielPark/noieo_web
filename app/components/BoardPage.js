import Link from "next/link";
import AppShell from "./AppShell";
import BoardList from "./BoardList";
import CategoryFilter from "./CategoryFilter";
import Pagination from "./Pagination";
import { isEnglish, withLang } from "../lib/i18n";

function getBoardPath(categoryFilter, subcategoryFilter, lang) {
  const path = "/test";
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
  const englishBoardPath = getBoardPath(categoryFilter, subcategoryFilter, "en");
  const koreanBoardPath = getBoardPath(categoryFilter, subcategoryFilter, "ko");

  return (
    <AppShell
      actions={
        <>
          {english ? (
            <Link className="button-secondary" href={koreanBoardPath}>
              KR
            </Link>
          ) : (
            <Link className="button-secondary" href={englishBoardPath}>
              EN
            </Link>
          )}
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
