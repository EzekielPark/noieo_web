import BoardPage from "../components/BoardPage";
import fetchBoardPage from "../lib/fetchBoardPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function TestIndex() {
  const state = await fetchBoardPage(1);
  return <BoardPage {...state} />;
}
