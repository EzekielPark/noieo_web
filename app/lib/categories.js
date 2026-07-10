export const POST_CATEGORIES = [
  {
    value: "science",
    label: "자연과학",
    labelEn: "Natural Science",
    subcategories: [
      { value: "none", label: "구분 없음", labelEn: "Unsorted" },
      { value: "ancient-cosmology", label: "고대 우주관", labelEn: "Ancient Cosmology" },
      { value: "lab-equipment", label: "실험장비", labelEn: "Lab Equipment" },
      { value: "quantum-mechanics", label: "양자 역학", labelEn: "Quantum Mechanics" },
    ],
  },
  {
    value: "engineering",
    label: "공학",
    labelEn: "Engineering",
    subcategories: [
      { value: "none", label: "구분 없음", labelEn: "Unsorted" },
      { value: "gui-web-app", label: "GUI/웹/앱", labelEn: "GUI/Web/App" },
      { value: "firmware-hardware", label: "펌웨어/하드웨어", labelEn: "Firmware/Hardware" },
      { value: "mechanism-vacuum", label: "기구/진공", labelEn: "Mechanism/Vacuum" },
      { value: "ai", label: "AI", labelEn: "AI" },
    ],
  },
  {
    value: "humanities",
    label: "인문학",
    labelEn: "Humanities",
    subcategories: [
      { value: "none", label: "구분 없음", labelEn: "Unsorted" },
      { value: "german-philosophy", label: "독일철학", labelEn: "German Philosophy" },
      { value: "greek-philosophy", label: "그리스철학", labelEn: "Greek Philosophy" },
      { value: "psychoanalysis", label: "정신분석", labelEn: "Psychoanalysis" },
      { value: "cultural-criticism", label: "문화비평", labelEn: "Cultural Criticism" },
    ],
  },
  {
    value: "archive",
    label: "아카이브",
    labelEn: "Archive",
    subcategories: [
      { value: "physics-textbook", label: "물리학 전공서", labelEn: "Physics Textbooks" },
      { value: "classic-text", label: "고전 문헌", labelEn: "Classic Texts" },
    ],
  },
  {
    value: "free",
    label: "자유게시판",
    labelEn: "Free Board",
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

function getLabel(item, locale = "ko") {
  if (!item) {
    return "";
  }

  return locale === "en" ? item.labelEn || item.label : item.label;
}

export function getCategoryLabel(value, locale = "ko") {
  return getLabel(getCategory(value), locale) || getLabel(getCategory(DEFAULT_POST_CATEGORY), locale);
}

export function getSubcategoryLabel(categoryValue, subcategoryValue, locale = "ko") {
  const category = getCategory(categoryValue);
  if (!category || !subcategoryValue) {
    return "";
  }

  return getLabel(category.subcategories.find((subcategory) => subcategory.value === subcategoryValue), locale);
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
