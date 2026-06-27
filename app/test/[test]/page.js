import BoardPage from "../../components/BoardPage";
import fetchBoardPage from "../../lib/fetchBoardPage";
import { PAGE_GROUP_SIZE, toPositiveNumber } from "../../lib/board";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function TestGroupPage({ params, searchParams }) {
  const group = toPositiveNumber(params.test);
  const firstPageInGroup = (group - 1) * PAGE_GROUP_SIZE + 1;
  const state = await fetchBoardPage(firstPageInGroup, searchParams?.category, searchParams?.subcategory);
  return <BoardPage {...state} />;
}
