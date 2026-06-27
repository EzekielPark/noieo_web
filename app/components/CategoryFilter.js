"use client";

import Link from "next/link";
import { useState } from "react";
import { POST_CATEGORIES } from "../lib/categories";

function categoryHref(category, subcategory = "") {
  if (category === "all") {
    return "/test/";
  }

  const params = new URLSearchParams({ category });
  if (subcategory) {
    params.set("subcategory", subcategory);
  }
  return `/test/?${params.toString()}`;
}

export default function CategoryFilter({ activeCategory = "all", activeSubcategory = "" }) {
  const [openCategory, setOpenCategory] = useState("");
  const filters = [{ value: "all", label: "전체", subcategories: [] }, ...POST_CATEGORIES];

  return (
    <nav className="category-filter" aria-label="게시판 분류">
      {filters.map((filter) => {
        const hasSubcategories = filter.subcategories.length > 0;
        const isOpen = openCategory === filter.value;
        const isActive = activeCategory === filter.value;

        return (
          <div
            key={filter.value}
            className={`category-filter__group${isOpen ? " is-open" : ""}`}
            onMouseLeave={() => setOpenCategory("")}
          >
            <Link
              className={`category-filter__item${isActive ? " is-active" : ""}`}
              href={categoryHref(filter.value)}
              onMouseEnter={() => hasSubcategories && setOpenCategory(filter.value)}
              onClick={(event) => {
                if (!hasSubcategories) {
                  return;
                }

                event.preventDefault();
                setOpenCategory(isOpen ? "" : filter.value);
              }}
            >
              <span>{filter.label}</span>
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
                      href={categoryHref(filter.value, subcategoryValue)}
                    >
                      {subcategory.label}
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
