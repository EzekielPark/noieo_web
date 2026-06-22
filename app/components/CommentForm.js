export default function CommentForm({ parentId, notice }) {
  return (
    <>
      {notice ? <p className="notice-inline">{notice}</p> : null}
      <form className="comment-form-compact" action="/api/comment/new" method="POST">
        <input className="compact-field" name="author" maxLength="16" placeholder="name" required />
        <input
          className="compact-field"
          type="password"
          name="password"
          inputMode="numeric"
          minLength="4"
          maxLength="4"
          pattern="[0-9]{4}"
          placeholder="password"
          required
        />
        <input className="compact-field" name="comment" maxLength="500" placeholder="write a reply" required />
        <input type="hidden" name="parent" value={parentId} />
        <button className="button-primary" type="submit">
          Post
        </button>
      </form>
    </>
  );
}
