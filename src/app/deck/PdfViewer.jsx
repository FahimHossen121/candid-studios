"use client";

import { useMemo, useState } from "react";

const PDF_PATH = "/pitch-deck.pdf";
const TOTAL_PAGES = 3;

function ControlButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex h-12 min-w-28 items-center justify-center rounded-full border border-primary/15 bg-white px-5 text-sm font-medium text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
      {...props}
    >
      {children}
    </button>
  );
}

export default function PdfViewer() {
  const [page, setPage] = useState(1);

  const pdfUrl = useMemo(
    () => `${PDF_PATH}#toolbar=0&navpanes=0&scrollbar=0&page=${page}`,
    [page]
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <ControlButton
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
        >
          Prev
        </ControlButton>
        <ControlButton
          onClick={() =>
            setPage((current) => Math.min(TOTAL_PAGES, current + 1))
          }
          disabled={page === TOTAL_PAGES}
        >
          Next
        </ControlButton>
        <a
          href={PDF_PATH}
          download
          className="inline-flex h-12 min-w-28 items-center justify-center rounded-full border border-primary/15 bg-white px-5 text-sm font-medium text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5"
        >
          Download
        </a>
        <span className="ml-auto text-sm text-text-muted">
          Page {page} of {TOTAL_PAGES}
        </span>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_24px_80px_rgba(14,11,30,0.08)]">
        <iframe
          key={page}
          src={pdfUrl}
          title="Candid Studios PDF deck"
          className="h-[70vh] w-full bg-white"
        />
      </div>
    </div>
  );
}
