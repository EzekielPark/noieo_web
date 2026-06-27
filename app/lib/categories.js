export const POST_CATEGORIES = [
  {
    value: "science",
    label: "자연과학",
    subcategories: [
      { value: "none", label: "구분 없음" },
      { value: "ancient-cosmology", label: "고대 우주관" },
      { value: "lab-equipment", label: "실험장비" },
      { value: "quantum-mechanics", label: "양자 역학" },
    ],
  },
  {
    value: "engineering",
    label: "공학",
    subcategories: [
      { value: "none", label: "구분 없음" },
      { value: "gui-web-app", label: "GUI/웹/앱" },
      { value: "firmware-hardware", label: "펌웨어/하드웨어" },
      { value: "mechanism-vacuum", label: "기구/진공" },
      { value: "ai", label: "AI" },
    ],
  },
  {
    value: "humanities",
    label: "인문학",
    subcategories: [
      { value: "none", label: "구분 없음" },
      { value: "german-philosophy", label: "독일철학" },
      { value: "greek-philosophy", label: "그리스철학" },
      { value: "psychoanalysis", label: "정신분석" },
      { value: "cultural-criticism", label: "문화비평" },
    ],
  },
  {
    value: "archive",
    label: "아카이브",
    subcategories: [
      { value: "physics-textbook", label: "물리학 전공서" },
      { value: "classic-text", label: "고전 문헌" },
    ],
  },
  {
    value: "free",
    label: "자유게시판",
    subcategories: [],
  },
];

export const LEGACY_CATEGORY_MAP = {
  physics: "science",
};

export const DEFAULT_POST_CATEGORY = "free";
export const DEFAULT_POST_SUBCATEGORY = "none";

export function getCategory(value) {
  const normalizedValue = LEGACY_CATEGORY_MAP[value] || value;
  return POST_CATEGORIES.find((category) => category.value === normalizedValue);
}

export function normalizeCategory(value) {
  return getCategory(value)?.value || DEFAULT_POST_CATEGORY;
}

export function normalizeSubcategory(categoryValue, subcategoryValue) {
  const category = getCategory(categoryValue);
  if (!category || !category.subcategories.length) {
    return "";
  }

  return (
    category.subcategories.find((subcategory) => subcategory.value === subcategoryValue)?.value ||
    DEFAULT_POST_SUBCATEGORY
  );
}

export function getCategoryLabel(value) {
  return getCategory(value)?.label || getCategory(DEFAULT_POST_CATEGORY).label;
}

export function getSubcategoryLabel(categoryValue, subcategoryValue) {
  const category = getCategory(categoryValue);
  if (!category || !subcategoryValue) {
    return "";
  }

  return category.subcategories.find((subcategory) => subcategory.value === subcategoryValue)?.label || "";
}

export function getPostCategory(post) {
  return normalizeCategory(post?.category);
}

export function getPostSubcategory(post) {
  return normalizeSubcategory(getPostCategory(post), post?.subcategory);
}

export function getCategoryFilter(value) {
  const category = getCategory(value);
  return category ? category.value : "all";
}

export function getSubcategoryFilter(categoryValue, subcategoryValue) {
  if (getCategoryFilter(categoryValue) === "all") {
    return "";
  }

  const normalized = normalizeSubcategory(categoryValue, subcategoryValue);
  return normalized && normalized !== DEFAULT_POST_SUBCATEGORY ? normalized : "";
}

export function buildCategoryQuery(categoryValue, subcategoryValue = "") {
  if (categoryValue === "all") {
    return {};
  }

  if (categoryValue === "science") {
    const query = { category: { $in: ["science", "physics"] } };
    if (subcategoryValue) {
      query.subcategory = subcategoryValue;
    }
    return query;
  }

  if (categoryValue === "free") {
    return {
      $or: [
        { category: "free" },
        { category: { $exists: false } },
        { category: "" },
      ],
    };
  }

  const query = { category: categoryValue };
  if (subcategoryValue) {
    query.subcategory = subcategoryValue;
  }
  return query;
}
