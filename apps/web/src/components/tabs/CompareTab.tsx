'use client';

import React, { useState, useEffect } from 'react';
import { CitationPill } from '../CitationViewer';

export interface ComparisonDiffItem {
  id: string;
  section: string;
  changeType: 'added' | 'removed' | 'modified';
  materiality: 'material' | 'minor' | 'formatting_only';
  docAText?: string;
  docBText?: string;
  explanation: string;
  chunkIdA?: string;
  chunkIdB?: string;
  pageA?: number;
  pageB?: number;
}

const DEFAULT_COMPARISON_ITEMS: ComparisonDiffItem[] = [
  {
    id: 'diff_1',
    section: 'Section 2. Royalty and Audit Frequency',
    changeType: 'modified',
    materiality: 'material',
    docAText: 'Licensee shall remit a 5.0% royalty on Net Revenues quarterly. Licensor may audit upon 10 business days notice.',
    docBText: 'Licensee shall remit a 7.5% royalty on Net Revenues quarterly. Licensor may audit upon 5 business days notice, up to twice per year.',
    explanation: 'Royalty percentage increased by 2.5% points (5.0% -> 7.5%), and audit notice window compressed from 10 to 5 days.',
    chunkIdA: 'chunk_v1_sec2',
    chunkIdB: 'chunk_v2_sec2',
    pageA: 2,
    pageB: 2,
  },
  {
    id: 'diff_2',
    section: 'Section 3. Termination for Cause & Cure Period',
    changeType: 'modified',
    materiality: 'material',
    docAText: 'Either party may terminate immediately upon material breach with 30 days notice to cure.',
    docBText: 'Licensor may terminate immediately upon material breach with 15 days notice to cure. Licensee cure rights excluded for payment default.',
    explanation: 'Cure period halved from 30 to 15 days, and unilateral exclusion introduced against Licensee for payment issues.',
    chunkIdA: 'chunk_v1_sec3',
    chunkIdB: 'chunk_v2_sec3',
    pageA: 3,
    pageB: 3,
  },
  {
    id: 'diff_3',
    section: 'Section 7. Notice Addresses',
    changeType: 'modified',
    materiality: 'minor',
    docAText: 'Notice sent to apex@technologies.com',
    docBText: 'Notice sent to legal-notices@apexglobal.tech',
    explanation: 'Updated corporate email contact domain for formal legal notices.',
    chunkIdA: 'chunk_v1_sec7',
    chunkIdB: 'chunk_v2_sec7',
    pageA: 6,
    pageB: 6,
  },
  {
    id: 'diff_4',
    section: 'Section 8. Heading Capitalization',
    changeType: 'modified',
    materiality: 'formatting_only',
    docAText: 'governing law and dispute resolution',
    docBText: 'GOVERNING LAW AND DISPUTE RESOLUTION',
    explanation: 'Capitalization changed to uppercase; no legal substance altered.',
    chunkIdA: 'chunk_v1_sec8',
    chunkIdB: 'chunk_v2_sec8',
    pageA: 7,
    pageB: 7,
  },
];

interface ApiComparisonChange {
  id: string;
  section_title?: string;
  change_type?: 'added' | 'removed' | 'modified';
  materiality_level?: 'material' | 'minor' | 'formatting_only';
  text_before?: string;
  text_after?: string;
  explanation?: string;
  chunk_a_id?: string;
  chunk_b_id?: string;
}

export const CompareTab: React.FC<{
  projectId: string;
  diffItems?: ComparisonDiffItem[];
}> = ({ projectId, diffItems }) => {
  const [items, setItems] = useState<ComparisonDiffItem[]>(diffItems || DEFAULT_COMPARISON_ITEMS);
  const [materialityFilter, setMaterialityFilter] = useState<'all' | 'material' | 'minor' | 'formatting_only'>('all');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
    if (!token || !projectId) return;

    fetch(`http://localhost:4000/api/v1/projects/${projectId}/comparisons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.comparisons && data.comparisons.length > 0) {
          const comp = data.comparisons[0];
          fetch(`http://localhost:4000/api/v1/projects/${projectId}/comparisons/${comp.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((cRes) => (cRes.ok ? cRes.json() : null))
            .then((compData) => {
              if (compData?.changes && compData.changes.length > 0) {
                const mapped: ComparisonDiffItem[] = compData.changes.map((c: ApiComparisonChange) => ({
                  id: c.id,
                  section: c.section_title || 'Section Comparison',
                  changeType: c.change_type || 'modified',
                  materiality: c.materiality_level || 'minor',
                  docAText: c.text_before || '',
                  docBText: c.text_after || '',
                  explanation: c.explanation || '',
                  chunkIdA: c.chunk_a_id,
                  chunkIdB: c.chunk_b_id,
                  pageA: 1,
                  pageB: 1,
                }));
                setItems(mapped);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [projectId]);

  const filtered = items.filter(
    (item) => materialityFilter === 'all' || item.materiality === materialityFilter
  );

  return (
    <main>
      <div className="flex-between margin-top-6 flex-wrap gap-4">
        <div>
          <h2 className="heading-xl">Contract Version Comparison</h2>
          <p className="text-sm-secondary margin-top-1">
            Side-by-side structural comparison with materiality classification and dual-document citations.
          </p>
        </div>

        {/* Materiality Filter */}
        <div className="flex-gap-2">
          {(
            [
              { id: 'all', label: 'All Changes' },
              { id: 'material', label: '🔴 Material Only' },
              { id: 'minor', label: '🟡 Minor' },
              { id: 'formatting_only', label: '⚪ Formatting Only' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn ${materialityFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) var(--space-3)' }}
              onClick={() => setMaterialityFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-col gap-6">
        {filtered.map((item) => (
          <article key={item.id} className="card card-padded-lg">
            <div className="flex-between margin-top-4">
              <div>
                <span
                  className="materiality-badge"
                  style={{
                    backgroundColor:
                      item.materiality === 'material'
                        ? 'var(--color-review-bg)'
                        : item.materiality === 'minor'
                        ? '#FEF3C7'
                        : '#F3F4F6',
                    color:
                      item.materiality === 'material'
                        ? 'var(--color-review)'
                        : item.materiality === 'minor'
                        ? '#92400E'
                        : '#4B5563',
                  }}
                >
                  {item.materiality.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold" style={{ display: 'inline' }}>
                  {item.section}
                </h3>
              </div>

              <div className="flex-gap-2">
                {item.chunkIdA && (
                  <CitationPill
                    chunkId={item.chunkIdA}
                    page={item.pageA}
                    sourceDocName="Doc A (Original)"
                    snippet={item.docAText}
                  />
                )}
                {item.chunkIdB && (
                  <CitationPill
                    chunkId={item.chunkIdB}
                    page={item.pageB}
                    sourceDocName="Doc B (Revised)"
                    snippet={item.docBText}
                  />
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="analysis-box text-sm">
              <strong>Analysis:</strong> {item.explanation}
            </div>

            {/* Side by Side Diff */}
            <div className="grid-diff">
              <div className="diff-box-a">
                <div className="text-xs font-bold" style={{ color: '#C53030', marginBottom: 'var(--space-2)' }}>
                  DOCUMENT A
                </div>
                <div className="text-xs" style={{ fontFamily: 'monospace', color: '#742A2A', lineHeight: 1.5 }}>
                  {item.docAText || '(No matching clause in Document A)'}
                </div>
              </div>

              <div className="diff-box-b">
                <div className="text-xs font-bold" style={{ color: '#276749', marginBottom: 'var(--space-2)' }}>
                  DOCUMENT B
                </div>
                <div className="text-xs" style={{ fontFamily: 'monospace', color: '#22543D', lineHeight: 1.5 }}>
                  {item.docBText || '(No matching clause in Document B)'}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};
