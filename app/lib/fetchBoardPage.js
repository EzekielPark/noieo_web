import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "../test/mongo/database";
import { BOARD_PAGE_SIZE, getDbName, getPagination, toPositiveNumber } from "./board";
import {
  buildCategoryQuery,
  getCategoryFilter,
  getCategoryLabel,
  getPostCategory,
  getPostSubcategory,
  getSubcategoryLabel,
} from "./categories";

export default async function fetchBoardPage(page, category) {
  noStore();

  const currentPage = toPositiveNumber(page);
  const categoryFilter = getCategoryFilter(category);
  const filter = buildCategoryQuery(categoryFilter);
  const client = await connectDB;
  const db = client.db(getDbName());
  const totalPosts = await db.collection("board").countDocuments(filter);
  const totalComments = await db.collection("comment").countDocuments();
  const pagination = getPagination(totalPosts, currentPage);
  const skip = (pagination.currentPage - 1) * BOARD_PAGE_SIZE;

  const posts = await db
    .collection("board")
    .find(filter)
    .sort({ number: -1, _id: -1 })
    .skip(skip)
    .limit(BOARD_PAGE_SIZE)
    .toArray();

  return {
    totalPosts,
    totalComments,
    pagination,
    categoryFilter,
    posts: posts.map((post) => ({
      ...post,
      date: post.date || "",
      view: Number(post.view || 0),
      category: getPostCategory(post),
      subcategory: getPostSubcategory(post),
      categoryLabel: getCategoryLabel(getPostCategory(post)),
      subcategoryLabel: getSubcategoryLabel(getPostCategory(post), getPostSubcategory(post)),
    })),
  };
}
