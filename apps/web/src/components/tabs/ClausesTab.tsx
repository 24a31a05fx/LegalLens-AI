'use client';

import React, { useState } from 'react';
import { CitationPill } from '../CitationViewer';

export interface ClauseItem {
  id: string;
  title: string;
  category: string;
  originalText: string;
  plainLanguage: string;
  chunkId: string;
  page: number;
}

export const ClausesTab: React.FC<{ clauses?: ClauseItem[] }> = ({ clauses = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Licensing & IP', 'Payment', 'Termination', 'Liability'];

  const filtered = clauses.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plainLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.originalText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main>
      <div className="flex-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="heading-xl">Clauses Explorer</h2>
          <p className="text-sm-secondary">
            Categorized contract clauses with plain-language translations and verified document citations.
          </p>
        </div>

        <input
          type="search"
          placeholder="Filter clauses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Filter clauses"
          className="input-search"
        />
      </div>

      {/* Category Pills */}
      <div className="flex-gap-2 margin-top-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)' }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm-secondary margin-top-6">
          No cited clauses are available yet. Run document analysis after processing an upload.
        </p>
      )}

      {/* Clauses List */}
      <div className="flex-col gap-4">
        {filtered.map((clause) => {
          const isExpanded = expandedId === clause.id;

          return (
            <article key={clause.id} className="card card-padded">
              <div className="flex-between margin-top-2">
                <div>
                  <span className="badge-primary">
                    {clause.category}
                  </span>
                  <h3 className="text-base font-bold" style={{ display: 'inline' }}>
                    {clause.title}
                  </h3>
                </div>
                <CitationPill chunkId={clause.chunkId} page={clause.page} snippet={clause.originalText} />
              </div>

              {/* Plain Language Interpretation */}
              <div className="margin-top-3 text-sm text-primary">
                <strong>Plain-Language Explanation:</strong> {clause.plainLanguage}
              </div>

              {/* Original Document Excerpt Toggle */}
              <div className="margin-top-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isExpanded ? '▼ Hide original document text' : '▶ View original contract wording'}
                </button>

                {isExpanded && (
                  <blockquote className="blockquote-style">
                    "{clause.originalText}"
                  </blockquote>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};
