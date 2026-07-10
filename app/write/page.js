import Link from "next/link";
import AppShell from "../components/AppShell";
import PostForm from "../components/PostForm";

export const dynamic = "force-dynamic";

export default async function WritePage({ searchParams }) {
  const noticeMap = {
    rate_limit: "잠시 후 다시 시도해주세요",
    writer_not_approved: "승인된 gmail.com 이메일만 글을 쓸 수 있습니다.",
    invalid_email: "올바른 gmail.com 이메일을 입력해주세요.",
    image_invalid: "이미지는 JPG, PNG, GIF, WEBP, AVIF 형식으로 최대 10MB까지 첨부할 수 있습니다.",
    youtube_invalid: "올바른 YouTube 영상 링크를 입력해주세요.",
    pdf_invalid: "PDF 또는 EPUB 문서는 최대 50MB까지 첨부할 수 있습니다.",
  };
  const notice = noticeMap[searchParams?.error];

  return (
    <AppShell
      actions={
        <>
          <Link className="button-secondary" href="/apply-writer/">
            Apply
          </Link>
          <Link className="button-secondary" href="/test/">
            Back
          </Link>
        </>
      }
    >
      <PostForm
        action="/api/post/new"
        submitLabel="Publish post"
        helperText="자유게시판은 누구나 쓸 수 있고, 나머지 분류는 승인된 이메일로만 글쓰기가 가능합니다."
        notice={notice}
        defaultValues={{ authorEmail: searchParams?.email || "" }}
      />
    </AppShell>
  );
}
