import CommentForm from "./CommentForm";

function DeleteCommentForm({ comment }) {
  return (
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
  );
}

function CommentItem({ comment, replies }) {
  const commentId = comment._id.toString();

  return (
    <div className="comment-thread">
      <div className="comment-item">
        <div className="comment-author">{comment.author || "guest"}</div>
        <p className="comment-text">{comment.comment}</p>
        <DeleteCommentForm comment={comment} />
      </div>
      <div className="comment-replies">
        {replies.map((reply) => (
          <div className="comment-item comment-item--reply" key={reply._id.toString()}>
            <div className="comment-author">{reply.author || "guest"}</div>
            <p className="comment-text">{reply.comment}</p>
            <DeleteCommentForm comment={reply} />
          </div>
        ))}
        <details className="reply-drawer">
          <summary>Reply</summary>
          <CommentForm
            parentId={comment.parent}
            replyTo={commentId}
            compact
            submitLabel="Reply"
            placeholder="reply"
          />
        </details>
      </div>
    </div>
  );
}

export default function CommentList({ comments }) {
  const rootComments = comments.filter((comment) => !comment.replyTo);
  const repliesByParent = comments.reduce((groups, comment) => {
    if (!comment.replyTo) {
      return groups;
    }

    const key = comment.replyTo.toString();
    groups[key] = groups[key] || [];
    groups[key].push(comment);
    return groups;
  }, {});

  return (
    <div className="comment-panel glass-panel">
      <div className="comment-head">
        <p className="comment-count">댓글 {comments.length}</p>
      </div>
      <div className="comment-list">
        {rootComments.length ? (
          rootComments.map((comment) => (
            <CommentItem
              key={comment._id.toString()}
              comment={comment}
              replies={repliesByParent[comment._id.toString()] || []}
            />
          ))
        ) : (
          <div className="empty-state">댓글이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
