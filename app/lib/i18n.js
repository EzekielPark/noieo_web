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

export function getTranslateUrl(path) {
  const target = new URL(path, SITE_URL).toString();
  return `https://translate.google.com/translate?sl=ko&tl=en&u=${encodeURIComponent(target)}`;
}
