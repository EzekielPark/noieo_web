import Link from "next/link";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { ObjectId } from "mongodb";
import AppShell from "../../../components/AppShell";
import CommentForm from "../../../components/CommentForm";
import CommentList from "../../../components/CommentList";
import PdfBookViewer from "../../../components/PdfBookViewer";
import { connectDB } from "../../mongo/database";
import { formatDate, getClientIp, getDbName } from "../../../lib/board";
import {
  getCategoryLabel,
  getPostCategory,
  getPostSubcategory,
  getSubcategoryLabel,
} from "../../../lib/categories";
import { getLocale, isEnglish, withLang } from "../../../lib/i18n";
import { ensurePostEnglishTranslation } from "../../../lib/localTranslate";
import { getYouTubeEmbedUrl } from "../../../lib/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SITE_URL = "https://noieo.com";
const SITE_DESCRIPTION = "NOIEO는 물리학, 철학, 기독교를 중심으로 지식과 사유를 나누는 한국어 게시판입니다.";

function getPostUrl(id) {
  return `${SITE_URL}/test/with/${id}`;
}

function toPlainText(value, maxLength = 155) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

async function getPostForMetadata(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const client = await connectDB;
  const db = client.db(getDbName());
  return db.collection("board").findOne(
    { _id: new ObjectId(id) },
    {
      projection: {
        title: 1,
        content: 1,
        category: 1,
        subcategory: 1,
      },
    },
  );
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPostForMetadata(params.id);

    if (!post) {
      return {
        title: "게시글을 찾을 수 없습니다",
        description: SITE_DESCRIPTION,
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const category = getPostCategory(post);
    const subcategory = getPostSubcategory(post);
    const categoryLabel = getCategoryLabel(category);
    const subcategoryLabel = getSubcategoryLabel(category, subcategory);
    const description =
      toPlainText(post.content) ||
      `${categoryLabel}${subcategoryLabel && subcategory !== "none" ? ` / ${subcategoryLabel}` : ""}에 관한 NOIEO 게시글입니다.`;
    const url = getPostUrl(params.id);

    return {
      title: post.title,
      description,
      keywords: ["NOIEO", categoryLabel, subcategoryLabel, "물리학", "철학", "기독교"].filter(Boolean),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: post.title,
        description,
        url,
        siteName: "NOIEO",
        locale: "ko_KR",
        type: "article",
      },
      twitter: {
        card: "summary",
        title: post.title,
        description,
      },
    };
  } catch {
    return {
      title: "NOIEO",
      description: SITE_DESCRIPTION,
    };
  }
}

export default async function PostDetailPage({ params, searchParams }) {
  noStore();

  const locale = getLocale(searchParams?.lang);
  const english = isEnglish(searchParams?.lang);
  const client = await connectDB;
  const db = client.db(getDbName());
  const postId = new ObjectId(params.id);
  const requestHeaders = headers();
  const clientIp = getClientIp(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );
  const viewDate = formatDate();
  const notice = searchParams?.error === "rate_limit" ? "잠시 후 다시 시도해주세요" : undefined;

  let post = await db.collection("board").findOne({ _id: postId });

  if (!post) {
    return (
      <div className="page-shell">
        <div className="center-panel glass-panel">
          <h2 className="section-title">{english ? "Post not found" : "게시글을 찾을 수 없습니다"}</h2>
          <p className="field-hint">
            {english ? "The link may point to a deleted post." : "삭제된 게시글이거나 잘못된 링크일 수 있습니다."}
          </p>
          <div className="form-actions">
            <Link className="button-primary" href={withLang("/test/", locale)}>
              {english ? "Return to board" : "게시판으로"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let currentViewCount = Number(post.view || 0);
  if (english) {
    post = await ensurePostEnglishTranslation(db, post);
  }

  const category = getPostCategory(post);
  const subcategory = getPostSubcategory(post);
  const subcategoryLabel = getSubcategoryLabel(category, subcategory, locale);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.youtube?.videoId);

  if (clientIp) {
    const viewLogCollection = db.collection("board_view_logs");
    const existingView = await viewLogCollection.findOne({
      postId: params.id,
      ip: clientIp,
      viewDate,
    });

    if (!existingView) {
      await viewLogCollection.insertOne({
        postId: params.id,
        ip: clientIp,
        viewDate,
        createdAt: new Date(),
      });

      currentViewCount += 1;
      await db.collection("board").updateOne(
        { _id: postId },
        { $set: { view: currentViewCount } },
      );
    }
  } else {
    currentViewCount += 1;
    await db.collection("board").updateOne(
      { _id: postId },
      { $set: { view: currentViewCount } },
    );
  }

  const comments = await db.collection("comment").find({ parent: params.id }).sort({ _id: 1 }).toArray();
  const localizedTitle = english && post.titleEn ? post.titleEn : post.title;
  const localizedContent = english && post.contentEn ? post.contentEn : post.content;
  const hasEnglishTranslation = Boolean(post.titleEn || post.contentEn);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: localizedTitle,
    articleBody: localizedContent,
    url: getPostUrl(params.id),
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.authorEmail ? post.authorEmail.split("@")[0] : "NOIEO user",
    },
    commentCount: comments.length,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: currentViewCount,
    },
  };

  return (
    <AppShell
      actions={
        <>
          <Link className="button-secondary" href={english ? `/test/with/${post._id.toString()}` : `/test/with/${post._id.toString()}?lang=en`}>
            {english ? "KR" : "EN"}
          </Link>
          <Link className="button-secondary" href={`/edit/${post._id.toString()}`}>
            {english ? "Edit" : "Edit"}
          </Link>
          <Link className="button-secondary" href={`/delete/${post._id.toString()}`}>
            {english ? "Delete" : "Delete"}
          </Link>
          <Link className="button-primary" href={withLang("/test/", locale)}>
            {english ? "Board" : "Board"}
          </Link>
        </>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="article-panel glass-panel">
        <div className="section-heading">
          <h2 className="article-title">{localizedTitle}</h2>
        </div>
        <div className="article-meta">
          <span>No. {post.number}</span>
          <span>{getCategoryLabel(category, locale)}</span>
          {subcategoryLabel && subcategory !== "none" ? <span>{subcategoryLabel}</span> : null}
          <span>{post.date}</span>
          <span>{currentViewCount} {english ? "views" : "조회"}</span>
        </div>
        {post.image?.dataUrl ? (
          <div className="article-image-wrap">
            <img className="article-image" src={post.image.dataUrl} alt={post.image.name || localizedTitle} />
          </div>
        ) : null}
        {youtubeEmbedUrl ? (
          <div className="article-video-wrap">
            <iframe
              className="article-video"
              src={youtubeEmbedUrl}
              title={`${localizedTitle} YouTube video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}
        {post.pdf?.url ? <PdfBookViewer pdf={post.pdf} /> : null}
        {english && !hasEnglishTranslation ? (
          <p className="field-hint">
            English translation is not available for this post yet. The original Korean text is shown below.
          </p>
        ) : null}
        <div className="article-body">{localizedContent}</div>
      </div>
      <CommentForm parentId={post._id.toString()} notice={notice} />
      <CommentList comments={comments} />
    </AppShell>
  );
}
