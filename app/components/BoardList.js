import Link from "next/link";

function PostRow({ post }) {
  return (
    <Link href={`/test/with/${post._id}`} className="board-row board-row--item">
      <div>{post.number}</div>
      <div className="board-row__title">
        <p className="board-title">{post.title}</p>
        <div className="board-row__meta">
          <span>{post.date}</span>
          <span>{post.view} views</span>
        </div>
      </div>
      <div>{post.date}</div>
      <div>{post.view}</div>
    </Link>
  );
}

export default function BoardList({ posts }) {
  return (
    <div className="board-table">
      <div className="board-row board-row--header">
        <div>No.</div>
        <div>Title</div>
        <div>Date</div>
        <div>Views</div>
      </div>
      {posts.length ? (
        posts.map((post) => <PostRow key={post._id.toString()} post={post} />)
      ) : (
        <div className="empty-state">No posts yet. Start the board with the first note.</div>
      )}
    </div>
  );
}
