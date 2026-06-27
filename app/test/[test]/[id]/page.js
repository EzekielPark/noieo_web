import BoardPage from "../../../components/BoardPage";
import fetchBoardPage from "../../../lib/fetchBoardPage";
import { toPositiveNumber } from "../../../lib/board";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function TestPagedPage({ params, searchParams }) {
  const page = toPositiveNumber(params.id);
  const state = await fetchBoardPage(page, searchParams?.category, searchParams?.subcategory);
  return <BoardPage {...state} />;
}
