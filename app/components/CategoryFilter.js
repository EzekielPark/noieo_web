"use client";

import Link from "next/link";
import { useState } from "react";
import { POST_CATEGORIES, getCategoryLabel, getSubcategoryLabel } from "../lib/categories";
import { getLocale, isEnglish } from "../lib/i18n";

function categoryHref(category, subcategory = "", lang = "ko") {
  const english = isEnglish(lang);

  if (category === "all") {
    return english ? "/test/?lang=en" : "/test/";
  }

  const params = new URLSearchParams({ category });
  if (subcategory) {
    params.set("subcategory", subcategory);
  }
  if (english) {
    params.set("lang", "en");
  }
  return `/test/?${params.toString()}`;
}

export default function CategoryFilter({ activeCategory = "all", activeSubcategory = "", lang = "ko" }) {
  const [openCategory, setOpenCategory] = useState("");
  const locale = getLocale(lang);
  const filters = [
    { value: "all", label: locale === "en" ? "All" : "전체", subcategories: [] },
    ...POST_CATEGORIES,
  ];

  return (
    <nav className="category-filter" aria-label={locale === "en" ? "Board categories" : "게시판 분류"}>
      {filters.map((filter) => {
        const hasSubcategories = filter.subcategories.length > 0;
        const isOpen = openCategory === filter.value;
        const isActive = activeCategory === filter.value;

        return (
          <div
            key={filter.value}
            className={`category-filter__group${isOpen ? " is-open" : ""}`}
          >
            <Link
              className={`category-filter__item${isActive ? " is-active" : ""}`}
              href={categoryHref(filter.value, "", locale)}
              onMouseEnter={() => hasSubcategories && setOpenCategory(filter.value)}
              onClick={(event) => {
                if (!hasSubcategories) {
                  return;
                }

                event.preventDefault();
                setOpenCategory(isOpen ? "" : filter.value);
              }}
            >
              <span>{filter.value === "all" ? filter.label : getCategoryLabel(filter.value, locale)}</span>
              {hasSubcategories ? <span className="category-filter__caret">⌄</span> : null}
            </Link>
            {hasSubcategories ? (
              <div className="category-filter__dropdown">
                {filter.subcategories.map((subcategory) => {
                  const subcategoryValue = subcategory.value === "none" ? "" : subcategory.value;
                  const subcategoryActive =
                    isActive &&
                    (activeSubcategory === subcategory.value ||
                      (!activeSubcategory && subcategory.value === "none"));

                  return (
                    <Link
                      key={subcategory.value}
                      className={`category-filter__subitem${subcategoryActive ? " is-active" : ""}`}
                      href={categoryHref(filter.value, subcategoryValue, locale)}
                    >
                      {getSubcategoryLabel(filter.value, subcategory.value, locale)}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
