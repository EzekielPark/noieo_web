"use client";

import { useMemo, useRef, useState } from "react";

export default function PdfBookViewer({ pdf }) {
  const [spreadStart, setSpreadStart] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);
  const pages = useMemo(() => [spreadStart, spreadStart + 1], [spreadStart]);

  if (!pdf?.url) {
    return null;
  }

  async function toggleFullscreen() {
    const element = viewerRef.current;
    if (!element) {
      return;
    }

    if (!document.fullscreenElement && element.requestFullscreen) {
      await element.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    setIsFullscreen((current) => !current);
  }

  function goPrevious() {
    setSpreadStart((current) => Math.max(1, current - 2));
  }

  function goNext() {
    setSpreadStart((current) => current + 2);
  }

  return (
    <section ref={viewerRef} className={`pdf-book${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="pdf-book__toolbar">
        <div className="pdf-book__title">
          <span>PDF</span>
          <strong>{pdf.name || "document.pdf"}</strong>
        </div>
        <div className="pdf-book__actions">
          <button className="button-secondary pdf-book__button" type="button" onClick={goPrevious}>
            Prev
          </button>
          <span className="pdf-book__spread">{pages[0]} / {pages[1]}</span>
          <button className="button-secondary pdf-book__button" type="button" onClick={goNext}>
            Next
          </button>
          <button className="button-primary pdf-book__button" type="button" onClick={toggleFullscreen}>
            Full
          </button>
        </div>
      </div>
      <div className="pdf-book__pages">
        {pages.map((page) => (
          <div className="pdf-book__page" key={page}>
            <iframe
              className="pdf-book__frame"
              title={`${pdf.name || "PDF"} page ${page}`}
              src={`${pdf.url}#page=${page}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            />
            <span className="pdf-book__page-number">{page}</span>
          </div>
        ))}
      </div>
      <a className="pdf-book__open" href={pdf.url} target="_blank" rel="noreferrer">
        새 창에서 PDF 열기
      </a>
    </section>
  );
}
