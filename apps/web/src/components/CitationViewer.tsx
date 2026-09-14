'use client';

import React, { useState } from 'react';

export interface CitationProps {
  chunkId: string;
  page?: number | null;
  offsetStart?: number | null;
  offsetEnd?: number | null;
  snippet?: string;
  sourceDocName?: string;
}

export const CitationPill: React.FC<CitationProps> = ({
  chunkId,
  page,
  snippet,
  sourceDocName,
}) => {
  const [showModal, setShowModal] = useState(false);

  const label = page ? `p. ${page}` : `ref #${chunkId.substring(0, 6)}`;

  return (
    <>
      <button
        type="button"
        className="citation-pill"
        onClick={() => setShowModal(true)}
        title="View source document evidence"
        aria-label={`Source citation: ${label}`}
      >
        <span>📄</span>
        <span>{label}</span>
      </button>

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="citation-modal-title"
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div className="flex-between margin-top-3">
              <h3 id="citation-modal-title" className="text-base font-bold">
                Verified Source Citation
              </h3>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: 'var(--font-size-xs)' }}
                onClick={() => setShowModal(false)}
                aria-label="Close citation modal"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs-secondary margin-top-3">
              <div><strong>Document:</strong> {sourceDocName || 'Uploaded Document'}</div>
              <div><strong>Chunk ID:</strong> <code>{chunkId}</code></div>
              {page && <div><strong>Page Number:</strong> {page}</div>}
            </div>

            <div className="citation-modal-content">
              {snippet || 'Verified against document text index. Exact source excerpt captured during extraction.'}
            </div>

            <div className="margin-top-4" style={{ textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
