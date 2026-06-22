import Link from "next/link";
import { ObjectId } from "mongodb";
import AppShell from "../../components/AppShell";
import { connectDB } from "../../test/mongo/database";
import { getDbName } from "../../lib/board";

export const dynamic = "force-dynamic";

export default async function DeletePage({ params }) {
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
      <form className="form-panel glass-panel" action="/api/post/delete" method="POST">
        <div className="section-heading">
          <div>
            <h2 className="section-title">{post.title}</h2>
            <p className="form-help">This action uses the password you set when the post was created.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field--full">
            <span>Password</span>
            <input
              type="password"
              name="fordelete"
              inputMode="numeric"
              minLength="4"
              maxLength="4"
              pattern="[0-9]{4}"
              placeholder="4 digits"
              required
            />
          </label>
        </div>
        <input type="hidden" name="_id" value={post._id.toString()} />
        <div className="form-actions">
          <button className="button-danger" type="submit">
            Delete post
          </button>
        </div>
      </form>
    </AppShell>
  );
}
