export const BOARD_PAGE_SIZE = 10;
export const PAGE_GROUP_SIZE = 5;

export function getDbName() {
  return process.env.MONGODB_DB || "noieo";
}

export function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getClientIp(forwardedFor, fallback = "") {
  const raw = String(forwardedFor || fallback || "").trim();

  if (!raw) {
    return "";
  }

  return (
    raw
      .split(",")
      .map((value) => value.trim())
      .find(Boolean) || ""
  );
}

export function toPositiveNumber(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPagination(totalItems, page = 1) {
  const totalPages = Math.max(1, Math.ceil(totalItems / BOARD_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const currentGroup = Math.ceil(safePage / PAGE_GROUP_SIZE);
  const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(totalPages, startPage + PAGE_GROUP_SIZE - 1);
  const pages = [];

  for (let value = startPage; value <= endPage; value += 1) {
    pages.push(value);
  }

  return {
    totalPages,
    currentPage: safePage,
    currentGroup,
    startPage,
    endPage,
    pages,
    hasPrevGroup: currentGroup > 1,
    hasNextGroup: endPage < totalPages,
  };
}

export function normalizeText(value, fallback = "") {
  return String(value || fallback).trim();
}
