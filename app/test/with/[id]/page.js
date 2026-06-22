import Link from "next/link";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { ObjectId } from "mongodb";
import AppShell from "../../../components/AppShell";
import CommentForm from "../../../components/CommentForm";
import CommentList from "../../../components/CommentList";
import { connectDB } from "../../mongo/database";
import { formatDate, getClientIp, getDbName } from "../../../lib/board";
import {
  getCategoryLabel,
  getPostCategory,
  getPostSubcategory,
  getSubcategoryLabel,
} from "../../../lib/categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PostDetailPage({ params, searchParams }) {
  noStore();

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

  const post = await db.collection("board").findOne({ _id: postId });

  if (!post) {
    return (
      <div className="page-shell">
        <div className="center-panel glass-panel">
          <h2 className="section-title">Post not found</h2>
          <p className="field-hint">The link may point to a deleted post.</p>
          <div className="form-actions">
            <Link className="button-primary" href="/test/">
              Return to board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let currentViewCount = Number(post.view || 0);
  const category = getPostCategory(post);
  const subcategory = getPostSubcategory(post);
  const subcategoryLabel = getSubcategoryLabel(category, subcategory);

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

  return (
    <AppShell
      actions={
        <>
          <Link className="button-secondary" href={`/edit/${post._id.toString()}`}>
            Edit
          </Link>
          <Link className="button-secondary" href={`/delete/${post._id.toString()}`}>
            Delete
          </Link>
          <Link className="button-primary" href="/test/">
            Board
          </Link>
        </>
      }
    >
      <div className="article-panel glass-panel">
        <div className="section-heading">
          <h2 className="article-title">{post.title}</h2>
        </div>
        <div className="article-meta">
          <span>No. {post.number}</span>
          <span>{getCategoryLabel(category)}</span>
          {subcategoryLabel && subcategory !== "none" ? <span>{subcategoryLabel}</span> : null}
          <span>{post.date}</span>
          <span>{currentViewCount} views</span>
        </div>
        <div className="article-body">{post.content}</div>
      </div>
      <CommentForm parentId={post._id.toString()} notice={notice} />
      <CommentList comments={comments} />
    </AppShell>
  );
}
