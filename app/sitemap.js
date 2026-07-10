import { connectDB } from "./test/mongo/database";
import { getDbName } from "./lib/board";

const SITE_URL = "https://noieo.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toSitemapDate(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap() {
  const baseRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/test`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const client = await connectDB;
    const db = client.db(getDbName());
    const posts = await db
      .collection("board")
      .find({}, { projection: { _id: 1, date: 1 } })
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();

    return [
      ...baseRoutes,
      ...posts.map((post) => ({
        url: `${SITE_URL}/test/with/${post._id.toString()}`,
        lastModified: toSitemapDate(post.date),
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    ];
  } catch {
    return baseRoutes;
  }
}
