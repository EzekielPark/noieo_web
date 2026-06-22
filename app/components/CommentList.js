export default function CommentList({ comments }) {
  return (
    <div className="comment-panel glass-panel">
      <div className="comment-head">
        <p className="comment-count">댓글 {comments.length}</p>
      </div>
      <div className="comment-list">
        {comments.length ? (
          comments.map((comment) => (
            <div className="comment-item" key={comment._id.toString()}>
              <div className="comment-author">{comment.author || "guest"}</div>
              <p className="comment-text">{comment.comment}</p>
              <form className="inline-form" action="/api/comment/delete" method="POST">
                <input type="hidden" name="_id" value={comment._id.toString()} />
                <input type="hidden" name="parent" value={comment.parent} />
                <input
                  type="password"
                  name="fordelete"
                  inputMode="numeric"
                  minLength="4"
                  maxLength="4"
                  pattern="[0-9]{4}"
                  placeholder="pw"
                  required
                />
                <button className="button-secondary" type="submit">
                  X
                </button>
              </form>
            </div>
          ))
        ) : (
          <div className="empty-state">댓글이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
