import Link from "next/link";
import AppShell from "../components/AppShell";
import PostForm from "../components/PostForm";

export const dynamic = "force-dynamic";

export default async function WritePage({ searchParams }) {
  const noticeMap = {
    rate_limit: "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694",
    writer_not_approved:
      "\uC2B9\uC778\uB41C gmail.com \uC774\uBA54\uC77C\uB9CC \uAE00\uC744 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    invalid_email:
      "\uC62C\uBC14\uB978 gmail.com \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
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
        helperText={
          "물리학과 인문학은 승인된 이메일로만 글쓰기가 가능하고, 자유게시판은 누구나 쓸 수 있습니다."
        }
        notice={notice}
        defaultValues={{ authorEmail: searchParams?.email || "" }}
      />
    </AppShell>
  );
}
