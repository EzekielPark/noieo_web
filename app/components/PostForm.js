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
          <span>Approved gmail.com email</span>
          <input name="authorEmail" maxLength="80" defaultValue={authorEmail} required />
        </label>
        <label className="field--full">
          <span>Title</span>
          <input name="title" maxLength="60" defaultValue={title} required />
        </label>
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
