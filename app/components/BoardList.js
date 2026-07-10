import Link from "next/link";
import { isEnglish, withLang } from "../lib/i18n";

function PostRow({ post, lang = "ko" }) {
  const english = isEnglish(lang);
  const title = english && post.titleEn ? post.titleEn : post.title;

  return (
    <Link href={withLang(`/test/with/${post._id}`, lang)} className="board-row board-row--item">
      <div>{post.number}</div>
      <div className="board-row__title">
        <p className="board-title">
          <span>{title}</span>
          {post.commentCount ? <span className="board-comment-count">{post.commentCount}</span> : null}
        </p>
        <div className="board-row__meta">
          <span className="category-chip">{post.categoryLabel}</span>
          <span>{post.date}</span>
          <span>{post.view} {english ? "views" : "조회"}</span>
        </div>
      </div>
      <div>{post.date}</div>
      <div>{post.view}</div>
    </Link>
  );
}

export default function BoardList({ posts, lang = "ko" }) {
  const english = isEnglish(lang);

  return (
    <div className="board-table">
      <div className="board-row board-row--header">
        <div>{english ? "No." : "번호"}</div>
        <div>{english ? "Title" : "제목"}</div>
        <div>{english ? "Date" : "날짜"}</div>
        <div>{english ? "Views" : "조회"}</div>
      </div>
      {posts.length ? (
        posts.map((post) => <PostRow key={post._id.toString()} post={post} lang={lang} />)
      ) : (
        <div className="empty-state">
          {english ? "No posts yet. Start the board with the first note." : "아직 게시글이 없습니다."}
        </div>
      )}
    </div>
  );
}
