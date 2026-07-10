const DEFAULT_TRANSLATE_ENDPOINT = "http://127.0.0.1:5000/translate";
const DEFAULT_TIMEOUT_MS = 3500;

function isTranslateEnabled() {
  return process.env.LOCAL_TRANSLATE_ENABLED !== "false";
}

function getTranslateEndpoint() {
  const configuredUrl =
    process.env.LIBRETRANSLATE_URL ||
    process.env.LOCAL_TRANSLATE_URL ||
    DEFAULT_TRANSLATE_ENDPOINT;
  const trimmedUrl = String(configuredUrl || "").trim().replace(/\/+$/, "");

  if (!trimmedUrl) {
    return DEFAULT_TRANSLATE_ENDPOINT;
  }

  return trimmedUrl.endsWith("/translate") ? trimmedUrl : `${trimmedUrl}/translate`;
}

function getTimeoutMs() {
  const parsed = Number(process.env.LOCAL_TRANSLATE_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export async function translateTextToEnglish(value) {
  const text = String(value || "").trim();

  if (!text || !isTranslateEnabled()) {
    return "";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const body = {
    q: text,
    source: "ko",
    target: "en",
    format: "text",
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    body.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  try {
    const response = await fetch(getTranslateEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json().catch(() => null);
    return String(data?.translatedText || "").trim();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPostEnglishTranslation({ title, content }) {
  const [titleEn, contentEn] = await Promise.all([
    translateTextToEnglish(title),
    translateTextToEnglish(content),
  ]);
  const translated = Boolean(titleEn || contentEn);

  return {
    titleEn,
    contentEn,
    translationProvider: translated ? "libretranslate-local" : "",
    translatedAt: translated ? new Date() : null,
  };
}

export async function ensurePostEnglishTitle(db, post) {
  if (!post || post.titleEn || !post.title) {
    return post;
  }

  const titleEn = await translateTextToEnglish(post.title);

  if (!titleEn) {
    return post;
  }

  const patch = {
    titleEn,
    translationProvider: "libretranslate-local",
    translatedAt: new Date(),
  };

  await db.collection("board").updateOne({ _id: post._id }, { $set: patch });
  return { ...post, ...patch };
}

export async function ensurePostEnglishTranslation(db, post) {
  if (!post || (post.titleEn && post.contentEn)) {
    return post;
  }

  const [titleEn, contentEn] = await Promise.all([
    post.titleEn ? Promise.resolve(post.titleEn) : translateTextToEnglish(post.title),
    post.contentEn ? Promise.resolve(post.contentEn) : translateTextToEnglish(post.content),
  ]);
  const patch = {};

  if (titleEn && titleEn !== post.titleEn) {
    patch.titleEn = titleEn;
  }
  if (contentEn && contentEn !== post.contentEn) {
    patch.contentEn = contentEn;
  }
  if (Object.keys(patch).length) {
    patch.translationProvider = "libretranslate-local";
    patch.translatedAt = new Date();
    await db.collection("board").updateOne({ _id: post._id }, { $set: patch });
  }

  return { ...post, ...patch };
}
