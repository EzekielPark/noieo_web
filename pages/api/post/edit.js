import { ObjectId } from "mongodb";
import { connectDB } from "app/test/mongo/database";
import { getDbName, normalizeText } from "app/lib/board";
import { normalizeCategory, normalizeSubcategory } from "app/lib/categories";
import { normalizePostImage } from "app/lib/postImage";
import { savePostPdf, validatePdfDataUrl } from "app/lib/postPdf";
import { normalizeYouTubeVideo } from "app/lib/youtube";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "90mb",
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const db = (await connectDB).db(getDbName());
  const _id = normalizeText(req.body._id);
  const password = normalizeText(req.body.password);
  const title = normalizeText(req.body.title);
  const titleEn = normalizeText(req.body.titleEn);
  const content = normalizeText(req.body.content);
  const contentEn = normalizeText(req.body.contentEn);
  const category = normalizeCategory(req.body.category);
  const subcategory = normalizeSubcategory(category, req.body.subcategory);
  const imageDataUrl = normalizeText(req.body.imageDataUrl);
  const image = normalizePostImage({
    dataUrl: imageDataUrl,
    name: normalizeText(req.body.imageName),
  });
  const youtubeUrl = normalizeText(req.body.youtubeUrl);
  const youtube = normalizeYouTubeVideo(youtubeUrl);
  const pdfDataUrl = normalizeText(req.body.pdfDataUrl);
  const pdfName = normalizeText(req.body.pdfName);
  const pdfValidation = validatePdfDataUrl(pdfDataUrl, pdfName);

  if (!_id || !title || !content || !/^\d{4}$/.test(password)) {
    return res.redirect(302, `/edit/${_id}`);
  }

  if (imageDataUrl && !image) {
    return res.redirect(302, `/edit/${_id}`);
  }

  if (youtubeUrl && !youtube) {
    return res.redirect(302, `/edit/${_id}`);
  }

  if (!pdfValidation.ok) {
    return res.redirect(302, `/edit/${_id}`);
  }

  const post = await db.collection("board").findOne({ _id: new ObjectId(_id) });

  if (!post || post.password !== password) {
    return res.redirect(302, `/edit/${_id}`);
  }

  const $set = {
    title,
    titleEn,
    content,
    contentEn,
    category,
    subcategory,
    youtube,
  };

  if (image) {
    $set.image = image;
  }

  const pdf = await savePostPdf({
    dataUrl: pdfDataUrl,
    name: pdfName,
  });

  if (pdf) {
    $set.pdf = pdf;
  }

  await db.collection("board").updateOne({ _id: new ObjectId(_id) }, { $set });

  return res.redirect(302, `/test/with/${_id}`);
}
