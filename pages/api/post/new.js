import { connectDB } from "app/test/mongo/database";
import { formatDate, getDbName, normalizeText } from "app/lib/board";
import { normalizeCategory, normalizeSubcategory } from "app/lib/categories";
import { normalizePostImage } from "app/lib/postImage";
import { savePostPdf, validatePdfDataUrl } from "app/lib/postPdf";
import { allowRequestByIp } from "app/lib/rateLimit";
import { isApprovedWriter, isValidGmailEmail, normalizeEmail } from "app/lib/writerApproval";
import { getPostEnglishTranslation } from "app/lib/localTranslate";
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

  const title = normalizeText(req.body.title);
  const content = normalizeText(req.body.content);
  const password = normalizeText(req.body.password);
  const authorEmail = normalizeEmail(req.body.authorEmail);
  const category = normalizeCategory(req.body.category);
  const subcategory = normalizeSubcategory(category, req.body.subcategory);
  const needsApprovedEmail = category !== "free";
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

  if (!title || !content || !/^\d{4}$/.test(password)) {
    return res.redirect(302, "/write/");
  }

  if (imageDataUrl && !image) {
    return res.redirect(302, "/write/?error=image_invalid");
  }

  if (youtubeUrl && !youtube) {
    return res.redirect(302, "/write/?error=youtube_invalid");
  }

  if (!pdfValidation.ok) {
    return res.redirect(302, "/write/?error=pdf_invalid");
  }

  if (needsApprovedEmail && !isValidGmailEmail(authorEmail)) {
    return res.redirect(302, `/write/?error=invalid_email&email=${encodeURIComponent(authorEmail)}`);
  }

  const client = await connectDB;
  const approved = needsApprovedEmail ? await isApprovedWriter(client, authorEmail) : true;
  if (needsApprovedEmail && !approved) {
    return res.redirect(
      302,
      `/write/?error=writer_not_approved&email=${encodeURIComponent(authorEmail)}`
    );
  }

  const isAllowed = await allowRequestByIp({
    dbClient: client,
    req,
    key: "post:create",
    windowSeconds: 30,
  });

  if (!isAllowed) {
    res.setHeader("Retry-After", "30");
    return res.redirect(302, "/write/?error=rate_limit");
  }

  const db = client.db(getDbName());
  const total = await db.collection("board").countDocuments();
  const pdf = await savePostPdf({
    dataUrl: pdfDataUrl,
    name: pdfName,
  });
  const translation = await getPostEnglishTranslation({ title, content });

  await db.collection("board").insertOne({
    title,
    content,
    ...translation,
    authorEmail,
    category,
    subcategory,
    image,
    youtube,
    pdf,
    password,
    date: formatDate(),
    view: 0,
    number: total + 1,
  });

  return res.redirect(302, "/test/");
}
