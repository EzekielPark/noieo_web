export const SITE_URL = "https://noieo.com";

export function getLocale(lang) {
  return lang === "en" ? "en" : "ko";
}

export function isEnglish(lang) {
  return getLocale(lang) === "en";
}

export function withLang(path, lang) {
  if (!isEnglish(lang)) {
    return path;
  }

  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", "en");
  return `${pathname}?${params.toString()}`;
}
