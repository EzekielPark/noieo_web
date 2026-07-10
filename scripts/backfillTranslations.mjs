import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { MongoClient, ObjectId } from "mongodb";

const DEFAULT_TRANSLATE_ENDPOINT = "http://127.0.0.1:5000/translate";
const DEFAULT_TIMEOUT_MS = 8000;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const exact = `--${name}`;
  const arg = process.argv.find((item) => item === exact || item.startsWith(prefix));

  if (!arg) {
    return fallback;
  }

  if (arg === exact) {
    return "true";
  }

  return arg.slice(prefix.length);
}

function getNumberArg(name, fallback) {
  const parsed = Number(getArg(name, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeTranslateEndpoint(value) {
  const trimmedValue = String(value || DEFAULT_TRANSLATE_ENDPOINT).trim().replace(/\/+$/, "");
  return trimmedValue.endsWith("/translate") ? trimmedValue : `${trimmedValue}/translate`;
}

function createAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function translateText({ endpoint, apiKey, source, target, timeoutMs, text }) {
  const trimmedText = String(text || "").trim();

  if (!trimmedText) {
    return "";
  }

  const abort = createAbortSignal(timeoutMs);
  const body = {
    q: trimmedText,
    source,
    target,
    format: "text",
  };

  if (apiKey) {
    body.api_key = apiKey;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: abort.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}${message ? `: ${message.slice(0, 160)}` : ""}`);
    }

    const data = await response.json();
    return String(data?.translatedText || "").trim();
  } finally {
    abort.clear();
  }
}

async function checkTranslateServer(options) {
  const translated = await translateText({
    ...options,
    text: "안녕하세요",
  });

  if (!translated) {
    throw new Error("Translation server returned an empty response.");
  }

  return translated;
}

function buildQuery({ force, onlyTitle, onlyContent, id }) {
  const query = {};

  if (id) {
    if (!ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }
    query._id = new ObjectId(id);
    return query;
  }

  if (force) {
    return query;
  }

  const missingTitle = { $or: [{ titleEn: { $exists: false } }, { titleEn: "" }, { titleEn: null }] };
  const missingContent = { $or: [{ contentEn: { $exists: false } }, { contentEn: "" }, { contentEn: null }] };

  if (onlyTitle) {
    return missingTitle;
  }
  if (onlyContent) {
    return missingContent;
  }

  return {
    $or: [missingTitle, missingContent],
  };
}

function printUsage() {
  console.log(`Usage:
  npm run translate:backfill
  npm run translate:backfill -- --dry-run
  npm run translate:backfill -- --limit=20
  npm run translate:backfill -- --force
  npm run translate:backfill -- --id=<post ObjectId>

Options:
  --dry-run       Count and preview target posts without calling the translation server.
  --limit=N       Translate at most N posts.
  --force         Re-translate posts even when titleEn/contentEn already exist.
  --only-title    Fill titleEn only.
  --only-content  Fill contentEn only.
  --id=...        Translate a single post.
`);
}

async function main() {
  const projectRoot = process.cwd();
  loadEnvFile(path.join(projectRoot, ".env.local"));
  loadEnvFile(path.join(projectRoot, ".env"));

  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const dryRun = getArg("dry-run") === "true";
  const force = getArg("force") === "true";
  const onlyTitle = getArg("only-title") === "true";
  const onlyContent = getArg("only-content") === "true";
  const id = getArg("id", "");
  const limit = getNumberArg("limit", 0);
  const source = getArg("source", "ko");
  const target = getArg("target", "en");
  const timeoutMs = getNumberArg("timeout-ms", Number(process.env.LOCAL_TRANSLATE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS);
  const endpoint = normalizeTranslateEndpoint(
    getArg("url", process.env.LIBRETRANSLATE_URL || process.env.LOCAL_TRANSLATE_URL || DEFAULT_TRANSLATE_ENDPOINT),
  );
  const apiKey = process.env.LIBRETRANSLATE_API_KEY || "";
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB || "noieo";

  if (onlyTitle && onlyContent) {
    throw new Error("Use either --only-title or --only-content, not both.");
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const board = db.collection("board");
    const query = buildQuery({ force, onlyTitle, onlyContent, id });
    const total = await board.countDocuments(query);
    const posts = await board
      .find(query)
      .sort({ number: 1, _id: 1 })
      .limit(limit || 0)
      .toArray();

    console.log(`[NOIEO] DB: ${dbName}`);
    console.log(`[NOIEO] Translation endpoint: ${endpoint}`);
    console.log(`[NOIEO] Target posts: ${total}${limit ? `, processing limit: ${limit}` : ""}`);

    if (dryRun) {
      for (const post of posts.slice(0, 10)) {
        console.log(`- #${post.number || "?"} ${post._id.toString()} ${post.title || "(untitled)"}`);
      }
      console.log("[NOIEO] Dry run complete. No translation or DB update was performed.");
      return;
    }

    if (!posts.length) {
      console.log("[NOIEO] Nothing to translate.");
      return;
    }

    const probe = await checkTranslateServer({ endpoint, apiKey, source, target, timeoutMs });
    console.log(`[NOIEO] Translation server check: 안녕하세요 -> ${probe}`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const post of posts) {
      const patch = {};
      const titleNeedsTranslation = !onlyContent && (force || !post.titleEn);
      const contentNeedsTranslation = !onlyTitle && (force || !post.contentEn);

      try {
        if (titleNeedsTranslation && post.title) {
          const titleEn = await translateText({
            endpoint,
            apiKey,
            source,
            target,
            timeoutMs,
            text: post.title,
          });
          if (titleEn) {
            patch.titleEn = titleEn;
          }
        }

        if (contentNeedsTranslation && post.content) {
          const contentEn = await translateText({
            endpoint,
            apiKey,
            source,
            target,
            timeoutMs,
            text: post.content,
          });
          if (contentEn) {
            patch.contentEn = contentEn;
          }
        }

        if (!Object.keys(patch).length) {
          skipped += 1;
          console.log(`[SKIP] #${post.number || "?"} ${post._id.toString()}`);
          continue;
        }

        patch.translationProvider = "libretranslate-local";
        patch.translatedAt = new Date();

        await board.updateOne({ _id: post._id }, { $set: patch });
        updated += 1;
        console.log(`[OK] #${post.number || "?"} ${post._id.toString()} ${post.title || "(untitled)"}`);
      } catch (error) {
        failed += 1;
        console.log(`[FAIL] #${post.number || "?"} ${post._id.toString()} ${error.message}`);
      }
    }

    console.log(`[NOIEO] Done. updated=${updated}, skipped=${skipped}, failed=${failed}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`[NOIEO] Backfill failed: ${error.message}`);
  process.exitCode = 1;
});
