import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "../test/mongo/database";
import { BOARD_PAGE_SIZE, getDbName, getPagination, toPositiveNumber } from "./board";
import {
  buildCategoryQuery,
  getCategoryFilter,
  getCategoryLabel,
  getPostCategory,
  getPostSubcategory,
  getSubcategoryFilter,
  getSubcategoryLabel,
} from "./categories";

export default async function fetchBoardPage(page, category, subcategory) {
  noStore();

  const currentPage = toPositiveNumber(page);
  const categoryFilter = getCategoryFilter(category);
  const subcategoryFilter = getSubcategoryFilter(categoryFilter, subcategory);
  const filter = buildCategoryQuery(categoryFilter, subcategoryFilter);
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
  const postIds = posts.map((post) => post._id.toString());
  const commentCounts = postIds.length
    ? await db
        .collection("comment")
        .aggregate([
          {
            $match: {
              parent: { $in: postIds },
            },
          },
          {
            $group: {
              _id: "$parent",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray()
    : [];
  const commentCountMap = new Map(commentCounts.map((item) => [item._id, Number(item.count || 0)]));

  return {
    totalPosts,
    totalComments,
    pagination,
    categoryFilter,
    subcategoryFilter,
    posts: posts.map((post) => ({
      ...post,
      date: post.date || "",
      view: Number(post.view || 0),
      commentCount: commentCountMap.get(post._id.toString()) || 0,
      category: getPostCategory(post),
      subcategory: getPostSubcategory(post),
      categoryLabel: getCategoryLabel(getPostCategory(post)),
      subcategoryLabel: getSubcategoryLabel(getPostCategory(post), getPostSubcategory(post)),
    })),
  };
}
