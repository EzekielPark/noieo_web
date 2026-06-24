const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeVideoId(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (YOUTUBE_ID_PATTERN.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(parts[0])) {
          videoId = parts[1] || "";
        }
      }
    }

    return YOUTUBE_ID_PATTERN.test(videoId) ? videoId : "";
  } catch {
    return "";
  }
}

export function normalizeYouTubeVideo(value) {
  const videoId = getYouTubeVideoId(value);
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function getYouTubeEmbedUrl(videoId) {
  return YOUTUBE_ID_PATTERN.test(String(videoId || ""))
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : "";
}
