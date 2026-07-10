"use client";

import { useEffect, useRef, useState } from "react";

function getDocumentType(file) {
  const type = file?.type;
  if (type === "epub" || type === "pdf") {
    return type;
  }

  const name = String(file?.name || file?.url || "").toLowerCase();
  return name.endsWith(".epub") ? "epub" : "pdf";
}

function PdfPageCanvas({ pdfDocument, pageNumber }) {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!pdfDocument || !pageNumber || pageNumber > pdfDocument.numPages) {
        return;
      }

      setIsLoading(true);
      const page = await pdfDocument.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas || cancelled) {
        setIsLoading(false);
        return;
      }

      const containerWidth = canvas.parentElement?.clientWidth || 520;
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, Math.max(0.7, containerWidth / viewport.width));
      const scaledViewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");

      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    renderPage().catch(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pdfDocument, pageNumber]);

  return (
    <div className="pdf-book__page">
      {pageNumber <= pdfDocument.numPages ? (
        <>
          {isLoading ? <span className="pdf-book__loading">Loading</span> : null}
          <canvas className="pdf-book__canvas" ref={canvasRef} />
          <span className="pdf-book__page-number">{pageNumber}</span>
        </>
      ) : (
        <div className="pdf-book__blank">End</div>
      )}
    </div>
  );
}

function PdfViewer({ file }) {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [spreadStart, setSpreadStart] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [loadError, setLoadError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);
  const totalPages = pdfDocument?.numPages || 0;
  const pages = [spreadStart, spreadStart + 1];

  useEffect(() => {
    let cancelled = false;

    async function loadPdfRuntime() {
      try {
        const runtime = await import(/* webpackIgnore: true */ "/pdf.min.mjs");
        runtime.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        if (!cancelled) {
          setPdfjsLib(runtime);
        }
      } catch {
        if (!cancelled) {
          setLoadError("PDF 뷰어를 불러오지 못했습니다.");
        }
      }
    }

    loadPdfRuntime();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      if (!file?.url || !pdfjsLib) {
        return;
      }

      setLoadError("");
      setPdfDocument(null);
      setSpreadStart(1);
      setPageInput("1");

      try {
        const documentTask = pdfjsLib.getDocument(file.url);
        const loadedDocument = await documentTask.promise;
        if (!cancelled) {
          setPdfDocument(loadedDocument);
        }
      } catch {
        if (!cancelled) {
          setLoadError("PDF를 불러오지 못했습니다.");
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [file?.url, pdfjsLib]);

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
    setSpreadStart((current) => {
      const next = Math.max(1, current - 2);
      setPageInput(String(next));
      return next;
    });
  }

  function goNext() {
    setSpreadStart((current) => {
      if (!totalPages) {
        return current;
      }
      const next = current + 2;
      const resolved = next > totalPages ? current : next;
      setPageInput(String(resolved));
      return resolved;
    });
  }

  function jumpToPage(event) {
    event.preventDefault();
    if (!totalPages) {
      return;
    }

    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      return;
    }

    const clamped = Math.min(totalPages, Math.max(1, requested));
    const spreadPage = clamped % 2 === 0 ? clamped - 1 : clamped;
    setSpreadStart(spreadPage);
    setPageInput(String(clamped));
  }

  return (
    <section ref={viewerRef} className={`pdf-book${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="pdf-book__toolbar">
        <div className="pdf-book__title">
          <span>PDF</span>
          <strong>{file.name || "document.pdf"}</strong>
        </div>
        <div className="pdf-book__actions">
          <button className="button-secondary pdf-book__button" type="button" onClick={goPrevious} disabled={spreadStart <= 1}>
            Prev
          </button>
          <span className="pdf-book__spread">
            {totalPages ? `${pages[0]}-${Math.min(pages[1], totalPages)} / ${totalPages}` : "Loading"}
          </span>
          <button className="button-secondary pdf-book__button" type="button" onClick={goNext} disabled={!totalPages || spreadStart + 2 > totalPages}>
            Next
          </button>
          <form className="pdf-book__jump" onSubmit={jumpToPage}>
            <input
              aria-label="PDF page"
              inputMode="numeric"
              min="1"
              max={totalPages || undefined}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />
            <button className="button-secondary pdf-book__button" type="submit">
              Go
            </button>
          </form>
          <button className="button-primary pdf-book__button" type="button" onClick={toggleFullscreen}>
            Full
          </button>
        </div>
      </div>
      {loadError ? <p className="notice-inline">{loadError}</p> : null}
      {pdfDocument ? (
        <div className="pdf-book__spread-view" aria-label="PDF spread pages">
          {pages.map((pageNumber) => (
            <PdfPageCanvas key={pageNumber} pdfDocument={pdfDocument} pageNumber={pageNumber} />
          ))}
        </div>
      ) : (
        <div className="pdf-book__placeholder">PDF loading</div>
      )}
      <a className="pdf-book__open" href={file.url} target="_blank" rel="noreferrer">
        새 창에서 PDF 열기
      </a>
    </section>
  );
}

function EpubViewer({ file }) {
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [currentLocation, setCurrentLocation] = useState(1);
  const [totalLocations, setTotalLocations] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEpubRuntime() {
      if (window.ePub) {
        return window.ePub;
      }

      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-epubjs="true"]');
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "/epub.min.js";
        script.async = true;
        script.dataset.epubjs = "true";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      return window.ePub;
    }

    async function renderEpub() {
      if (!file?.url || !stageRef.current) {
        return;
      }

      try {
        setLoadError("");
        setIsReady(false);
        setTotalLocations(1);
        setCurrentLocation(1);
        setPageInput("1");

        const ePub = await loadEpubRuntime();
        if (!ePub || cancelled) {
          return;
        }

        renditionRef.current?.destroy?.();
        bookRef.current?.destroy?.();
        stageRef.current.replaceChildren();

        let book;
        try {
          book = ePub(file.url, {
            openAs: "epub",
            replacements: "blobUrl",
          });
          await book.opened;
        } catch {
          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error("EPUB 파일을 가져오지 못했습니다.");
          }

          const arrayBuffer = await response.arrayBuffer();
          if (cancelled) {
            return;
          }

          book = ePub(arrayBuffer, {
            openAs: "binary",
            replacements: "blobUrl",
          });
          await book.opened;
        }

        if (cancelled) {
          book?.destroy?.();
          return;
        }

        bookRef.current = book;

        const rendition = book.renderTo(stageRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "always",
          manager: "default",
        });
        renditionRef.current = rendition;

        rendition.themes.default({
          body: {
            color: "#16191f",
            background: "#f4f1ea",
            "font-family": "serif",
          },
        });

        rendition.on("relocated", (location) => {
          const nextLocation = location?.start?.location;
          if (typeof nextLocation === "number") {
            const pageNumber = nextLocation + 1;
            setCurrentLocation(pageNumber);
            setPageInput(String(pageNumber));
          }
        });

        await rendition.display();
        await book.ready;
        if (cancelled) {
          return;
        }

        setIsReady(true);

        book.locations.generate(800).then(() => {
          if (!cancelled) {
            setTotalLocations(book.locations.length() || 1);
          }
        }).catch(() => {
          if (!cancelled) {
            setTotalLocations(1);
          }
        });
      } catch (error) {
        if (!cancelled) {
          const message = error?.message ? ` (${error.message})` : "";
          setLoadError(`EPUB을 불러오지 못했습니다.${message}`);
        }
      }
    }

    renderEpub();

    return () => {
      cancelled = true;
      renditionRef.current?.destroy?.();
      bookRef.current?.destroy?.();
      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [file?.url]);

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
    renditionRef.current?.prev();
  }

  function goNext() {
    renditionRef.current?.next();
  }

  function jumpToLocation(event) {
    event.preventDefault();
    if (!bookRef.current || !renditionRef.current) {
      return;
    }

    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      return;
    }

    const clamped = Math.min(totalLocations || 1, Math.max(1, requested));
    const cfi = bookRef.current.locations?.cfiFromLocation?.(clamped - 1);
    if (cfi) {
      renditionRef.current.display(cfi);
      setCurrentLocation(clamped);
      setPageInput(String(clamped));
    }
  }

  return (
    <section ref={viewerRef} className={`pdf-book${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="pdf-book__toolbar">
        <div className="pdf-book__title">
          <span>EPUB</span>
          <strong>{file.name || "document.epub"}</strong>
        </div>
        <div className="pdf-book__actions">
          <button className="button-secondary pdf-book__button" type="button" onClick={goPrevious} disabled={!isReady}>
            Prev
          </button>
          <span className="pdf-book__spread">
            {isReady ? `${currentLocation} / ${totalLocations || 1}` : "Loading"}
          </span>
          <button className="button-secondary pdf-book__button" type="button" onClick={goNext} disabled={!isReady}>
            Next
          </button>
          <form className="pdf-book__jump" onSubmit={jumpToLocation}>
            <input
              aria-label="EPUB page"
              inputMode="numeric"
              min="1"
              max={totalLocations || undefined}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />
            <button className="button-secondary pdf-book__button" type="submit" disabled={!isReady}>
              Go
            </button>
          </form>
          <button className="button-primary pdf-book__button" type="button" onClick={toggleFullscreen}>
            Full
          </button>
        </div>
      </div>
      {loadError ? <p className="notice-inline">{loadError}</p> : null}
      <div className="epub-book__shell">
        {!isReady && !loadError ? <div className="epub-book__loading">EPUB loading</div> : null}
        <div className="epub-book__stage" ref={stageRef} />
      </div>
      <a className="pdf-book__open" href={file.url} target="_blank" rel="noreferrer">
        새 창에서 EPUB 열기
      </a>
    </section>
  );
}

export default function PdfBookViewer({ pdf }) {
  if (!pdf?.url) {
    return null;
  }

  return getDocumentType(pdf) === "epub" ? <EpubViewer file={pdf} /> : <PdfViewer file={pdf} />;
}
