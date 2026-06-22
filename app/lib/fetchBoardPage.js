import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "../test/mongo/database";
import { BOARD_PAGE_SIZE, getDbName, getPagination, toPositiveNumber } from "./board";

export default async function fetchBoardPage(page) {
  noStore();

  const currentPage = toPositiveNumber(page);
  const client = await connectDB;
  const db = client.db(getDbName());
  const totalPosts = await db.collection("board").countDocuments();
  const totalComments = await db.collection("comment").countDocuments();
  const pagination = getPagination(totalPosts, currentPage);
  const skip = (pagination.currentPage - 1) * BOARD_PAGE_SIZE;

  const posts = await db
    .collection("board")
    .find()
    .sort({ number: -1, _id: -1 })
    .skip(skip)
    .limit(BOARD_PAGE_SIZE)
    .toArray();

  return {
    totalPosts,
    totalComments,
    pagination,
    posts: posts.map((post) => ({
      ...post,
      date: post.date || "",
      view: Number(post.view || 0),
    })),
  };
}
