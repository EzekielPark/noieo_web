export const POST_CATEGORIES = [
  {
    value: "physics",
    label: "물리학",
    subcategories: [
      { value: "none", label: "구분 없음" },
      { value: "ancient-cosmology", label: "고대 우주관" },
      { value: "lab-equipment", label: "실험장비" },
      { value: "quantum-mechanics", label: "양자 역학" },
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
    value: "free",
    label: "자유게시판",
    subcategories: [],
  },
];

export const DEFAULT_POST_CATEGORY = "free";
export const DEFAULT_POST_SUBCATEGORY = "none";

export function getCategory(value) {
  return POST_CATEGORIES.find((category) => category.value === value);
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

export function buildCategoryQuery(categoryValue) {
  if (categoryValue === "physics" || categoryValue === "humanities") {
    return { category: categoryValue };
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

  return {};
}
