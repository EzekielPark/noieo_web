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
  const activeCategory = useMemo(() => getCategory(category), [category]);
  const subcategories = activeCategory?.subcategories || [];
  const needsApprovedEmail = category !== "free";

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
          <span>{needsApprovedEmail ? "승인된 gmail.com 이메일" : "gmail.com 이메일 (선택)"}</span>
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
            <span>세부 분류</span>
            <select
              name="subcategory"
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
            >
              {subcategories.map((subcategory) => (
                <option key={subcategory.value} value={subcategory.value}>
                  {subcategory.label}
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
          <span>Content</span>
          <textarea name="content" maxLength="2000" defaultValue={content} required />
        </label>
      </div>
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <div className="form-actions">
        <button className="button-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
