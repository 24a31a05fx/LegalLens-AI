'use client';

import React, { useState, useEffect } from 'react';
import { CitationPill } from '../CitationViewer';

export interface DateItem {
  id: string;
  title: string;
  dateString: string;
  dateType: 'effective' | 'milestone' | 'deadline' | 'expiration';
  description: string;
  chunkId: string;
  page: number;
}

export const KeyDatesTab: React.FC<{
  dates?: DateItem[];
  projectId?: string;
  documentId?: string;
  onExportIcs?: () => void;
}> = ({ dates: initialDates = [], projectId, documentId, onExportIcs }) => {
  const [dates, setDates] = useState<DateItem[]>(initialDates);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialDates && initialDates.length > 0) {
      setDates(initialDates);
      return;
    }
    if (!projectId || !documentId) return;

    let isMounted = true;
    const fetchDates = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
        if (!token) return;

        // 1. Check for existing dates analysis with findings
        const getRes = await fetch(
          `http://localhost:4000/api/v1/projects/${projectId}/documents/${documentId}/analyses?type=dates&include_findings=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let dateFindings: Array<{
          id: string;
          title: string;
          explanation: string;
          citation_chunk_ids: string[];
        }> = [];

        if (getRes.ok) {
          const getData = await getRes.json();
          if (getData.analyses && getData.analyses.length > 0 && getData.analyses[0].findings) {
            dateFindings = getData.analyses[0].findings;
          }
        }

        // 2. If no dates analysis exists yet, generate one
        if (dateFindings.length === 0) {
          const postRes = await fetch(
            `http://localhost:4000/api/v1/projects/${projectId}/documents/${documentId}/analyses`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ analysisType: 'dates' }),
            }
          );
          if (postRes.ok) {
            const postData = await postRes.json();
            dateFindings = postData.findings || [];
          }
        }

        if (isMounted && dateFindings.length > 0) {
          const mappedDates: DateItem[] = dateFindings.map((f, idx) => {
            const textLower = `${f.title} ${f.explanation}`.toLowerCase();
            let dateType: DateItem['dateType'] = 'milestone';
            if (textLower.includes('effective') || textLower.includes('commence') || textLower.includes('start')) {
              dateType = 'effective';
            } else if (textLower.includes('terminat') || textLower.includes('expir') || textLower.includes('renew')) {
              dateType = 'expiration';
            } else if (textLower.includes('notice') || textLower.includes('cure') || textLower.includes('due') || textLower.includes('within')) {
              dateType = 'deadline';
            }

            const dateMatch =
              f.explanation.match(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i) ||
              f.explanation.match(/\b\d{1,2}\s+(?:days|months|years)\b/i) ||
              f.explanation.match(/\b(?:two|three|one)\s+\([0-9]+\)\s+years?\b/i);

            const dateString = dateMatch ? dateMatch[0] : `Milestone #${idx + 1}`;

            return {
              id: f.id,
              title: f.title,
              dateString,
              dateType,
              description: f.explanation,
              chunkId: f.citation_chunk_ids?.[0] || '',
              page: 1,
            };
          });
          setDates(mappedDates);
        }
      } catch {
        // Handled gracefully in client
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDates();
    return () => {
      isMounted = false;
    };
  }, [projectId, documentId, initialDates]);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedCount = dates.filter((d) => completedIds.has(d.id)).length;

  return (
    <main>
      <div className="flex-between margin-top-6 flex-wrap gap-4">
        <div>
          <div className="flex-gap-3">
            <h2 className="heading-xl">Key Dates & Deadlines</h2>
            <span
              className="text-xs font-semibold"
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Checked off: {completedCount} of {dates.length}
            </span>
          </div>
          <p className="text-sm-secondary margin-top-1">
            Chronological contract schedule extracted and verified against source text. Check off items as completed.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onExportIcs}
          aria-label="Export schedule to calendar as ICS file"
        >
          📅 Export Schedule to Calendar (.ics)
        </button>
      </div>

      {isLoading && (
        <div className="card text-center margin-top-4" style={{ padding: 'var(--space-6)' }}>
          <p className="text-sm-secondary">⚡ Extracting verified contract dates and timelines...</p>
        </div>
      )}

      <div className="flex-col gap-4 margin-top-4">
        {dates.map((d, index) => {
          const isDone = completedIds.has(d.id);

          return (
            <article
              key={d.id}
              className={`card article-card ${isDone ? 'article-card-done' : ''}`}
            >
              {/* Checkbox for PRD FR-24 Checkable Checklist */}
              <div style={{ paddingTop: '8px' }}>
                <input
                  type="checkbox"
                  id={`check-${d.id}`}
                  checked={isDone}
                  onChange={() => toggleItem(d.id)}
                  aria-label={`Mark "${d.title}" as completed`}
                  className="checkbox-style"
                />
              </div>

              {/* Timeline Circle */}
              <div
                className="timeline-circle"
                style={{
                  backgroundColor: isDone ? 'var(--color-obligation-bg)' : 'var(--color-deadline-bg)',
                  color: isDone ? 'var(--color-obligation)' : 'var(--color-deadline)',
                }}
              >
                {isDone ? '✓' : `#${index + 1}`}
              </div>

              <div style={{ flex: 1 }}>
                <div className="flex-between flex-wrap gap-2">
                  <div>
                    <label
                      htmlFor={`check-${d.id}`}
                      className="text-base font-bold"
                      style={{
                        marginRight: 'var(--space-2)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {d.title}
                    </label>
                    <span className="badge-deadline">
                      {d.dateType.toUpperCase()}
                    </span>
                  </div>
                  <CitationPill chunkId={d.chunkId} page={d.page} snippet={d.description} />
                </div>

                <div
                  className="text-lg font-bold"
                  style={{
                    color: isDone ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                    marginTop: 'var(--space-1)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {d.dateString}
                </div>

                <p className="text-sm-secondary margin-top-1">
                  {d.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};
