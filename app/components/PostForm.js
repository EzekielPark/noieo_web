"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_POST_CATEGORY,
  DEFAULT_POST_SUBCATEGORY,
  POST_CATEGORIES,
  getCategory,
  normalizeCategory,
  normalizeSubcategory,
} from "../lib/categories";
import { getPostImageError } from "../lib/postImage";

const MAX_DOCUMENT_BYTES = 50 * 1000 * 1000;
const DOCUMENT_EXTENSIONS = [".pdf", ".epub"];

export default function PostForm({
  action,
  submitLabel,
  defaultValues = {},
  includePassword = true,
  helperText,
  notice,
  hiddenFields = [],
}) {
  const { title = "", content = "", authorEmail = "" } = defaultValues;
  const initialCategory = normalizeCategory(defaultValues.category);
  const initialSubcategory = normalizeSubcategory(
    initialCategory,
    defaultValues.subcategory || DEFAULT_POST_SUBCATEGORY,
  );
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory || DEFAULT_POST_SUBCATEGORY);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [documentDataUrl, setDocumentDataUrl] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const activeCategory = useMemo(() => getCategory(category), [category]);
  const subcategories = activeCategory?.subcategories || [];
  const needsApprovedEmail = category !== "free";
  const currentImageName = defaultValues.image?.name || "";
  const currentDocumentName = defaultValues.pdf?.name || "";
  const currentYouTubeUrl = defaultValues.youtube?.url || "";

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setImageDataUrl("");
    setImageName("");
    setImageError("");

    if (!file) {
      return;
    }

    const error = getPostImageError(file);
    if (error) {
      event.target.value = "";
      setImageError(error);
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result || ""));
      setImageName(file.name);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setImageError("이미지를 읽지 못했습니다. 다시 선택해주세요.");
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDocumentChange(event) {
    const file = event.target.files?.[0];
    setDocumentDataUrl("");
    setDocumentName("");
    setDocumentError("");

    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isSupported = DOCUMENT_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
    if (!isSupported) {
      event.target.value = "";
      setDocumentError("PDF 또는 EPUB 파일만 첨부할 수 있습니다.");
      return;
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      event.target.value = "";
      setDocumentError("문서는 최대 50MB까지 첨부할 수 있습니다.");
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentDataUrl(String(reader.result || ""));
      setDocumentName(file.name);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setDocumentError("문서를 읽지 못했습니다. 다시 선택해주세요.");
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form className="form-panel glass-panel" action={action} method="POST">
      <div className="section-heading">
        <div>
          <h2 className="section-title">{submitLabel}</h2>
          {helperText ? <p className="form-help">{helperText}</p> : null}
        </div>
      </div>
      {notice ? <p className="notice-inline">{notice}</p> : null}
      <div className="form-grid">
        <label className="field--full">
          <span>{needsApprovedEmail ? "승인된 gmail.com 이메일" : "gmail.com 이메일(선택)"}</span>
          <input
            name="authorEmail"
            maxLength="80"
            defaultValue={authorEmail}
            required={needsApprovedEmail}
          />
        </label>
        <label className="field--full">
          <span>Title</span>
          <input name="title" maxLength="60" defaultValue={title} required />
        </label>
        <label>
          <span>대분류</span>
          <select
            name="category"
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setCategory(nextCategory);
              setSubcategory(DEFAULT_POST_SUBCATEGORY);
            }}
          >
            {POST_CATEGORIES.map((categoryOption) => (
              <option key={categoryOption.value} value={categoryOption.value}>
                {categoryOption.label}
              </option>
            ))}
          </select>
        </label>
        {subcategories.length ? (
          <label>
            <span>소분류</span>
            <select
              name="subcategory"
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
            >
              {subcategories.map((subcategoryOption) => (
                <option key={subcategoryOption.value} value={subcategoryOption.value}>
                  {subcategoryOption.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="subcategory" value="" />
        )}
        {includePassword ? (
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              inputMode="numeric"
              minLength="4"
              maxLength="4"
              pattern="[0-9]{4}"
              placeholder="4 digits"
              required
            />
          </label>
        ) : null}
        <label className="field--full">
          <span>이미지</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleImageChange}
          />
          <input type="hidden" name="imageDataUrl" value={imageDataUrl} />
          <input type="hidden" name="imageName" value={imageName} />
          {currentImageName && !imageName ? <p className="field-hint">현재 이미지: {currentImageName}</p> : null}
          {imageName ? <p className="field-hint">첨부 이미지: {imageName}</p> : null}
          {imageError ? <p className="notice-inline">{imageError}</p> : null}
        </label>
        <label className="field--full">
          <span>YouTube URL</span>
          <input
            type="url"
            name="youtubeUrl"
            maxLength="300"
            defaultValue={currentYouTubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="field-hint">유튜브 영상 링크 1개를 선택적으로 첨부할 수 있습니다.</p>
        </label>
        <label className="field--full">
          <span>문서</span>
          <input type="file" accept="application/pdf,application/epub+zip,.pdf,.epub" onChange={handleDocumentChange} />
          <input type="hidden" name="pdfDataUrl" value={documentDataUrl} />
          <input type="hidden" name="pdfName" value={documentName} />
          {currentDocumentName && !documentName ? <p className="field-hint">현재 문서: {currentDocumentName}</p> : null}
          {documentName ? <p className="field-hint">첨부 문서: {documentName}</p> : null}
          {documentError ? <p className="notice-inline">{documentError}</p> : null}
        </label>
        <label className="field--full">
          <span>Content</span>
          <textarea name="content" maxLength="2000" defaultValue={content} required />
        </label>
      </div>
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <div className="form-actions">
        <button className="button-primary" type="submit" disabled={isReadingFile}>
          {isReadingFile ? "Reading file..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
