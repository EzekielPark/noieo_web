import Link from "next/link";
import { ObjectId } from "mongodb";
import AppShell from "../../components/AppShell";
import PostForm from "../../components/PostForm";
import { connectDB } from "../../test/mongo/database";
import { getDbName } from "../../lib/board";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }) {
  const client = await connectDB;
  const db = client.db(getDbName());
  const post = await db.collection("board").findOne({ _id: new ObjectId(params.id) });

  if (!post) {
    return (
      <div className="page-shell">
        <div className="center-panel glass-panel">
          <h2 className="section-title">Post not found</h2>
          <p className="field-hint">The post may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      actions={
        <Link className="button-secondary" href={`/test/with/${post._id.toString()}`}>
          Back
        </Link>
      }
    >
      <PostForm
        action="/api/post/edit"
        submitLabel="Save changes"
        helperText="Enter the original 4-digit password to save."
        defaultValues={{
          title: post.title,
          content: post.content,
          category: post.category,
          subcategory: post.subcategory,
          image: post.image,
          youtube: post.youtube,
          pdf: post.pdf,
        }}
        hiddenFields={[{ name: "_id", value: post._id.toString() }]}
      />
    </AppShell>
  );
}
