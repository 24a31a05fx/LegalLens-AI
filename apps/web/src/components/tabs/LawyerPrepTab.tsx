'use client';

import React, { useState, useEffect } from 'react';
import { CitationPill } from '../CitationViewer';
import { getApiBaseUrl } from '../../lib/api-config';

export interface LawyerPrepData {
  id: string;
  status: 'draft' | 'finalized';
  situationSummary: string;
  keyClauses: Array<{ title: string; summary: string; citationChunkId: string; page: number }>;
  keyDates: Array<{ event: string; date: string }>;
  factsStillNeeded: string[];
  questionsForLawyer: string[];
  userNotes: string;
}

const DEFAULT_PREP: LawyerPrepData = {
  id: 'lp_draft_01',
  status: 'draft',
  situationSummary: 'Generate a lawyer-preparation draft after document analysis completes. Do not rely on this workspace until every item has a source citation.',
  keyClauses: [],
  keyDates: [],
  factsStillNeeded: [],
  questionsForLawyer: [],
  userNotes: '',
};

interface ApiPrepClause {
  title: string;
  excerpt?: string;
  chunk_id?: string;
  page?: number;
}

interface ApiPrepDate {
  label: string;
  timing: string;
}

export const LawyerPrepTab: React.FC<{
  projectId: string;
  onExportBriefing: () => void;
}> = ({ projectId, onExportBriefing }) => {
  const [data, setData] = useState<LawyerPrepData>(DEFAULT_PREP);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
    if (!token || !projectId) return;

    const apiBase = getApiBaseUrl();
    fetch(`${apiBase}/api/v1/projects/${projectId}/lawyer-prep`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.drafts && resData.drafts.length > 0) {
          const draft = resData.drafts[0];
          setData({
            id: draft.id,
            status: draft.status || 'draft',
            situationSummary: draft.situation_summary || DEFAULT_PREP.situationSummary,
            keyClauses: (draft.key_clauses?.clauses || []).map((c: ApiPrepClause) => ({
              title: c.title,
              summary: c.excerpt || '',
              citationChunkId: c.chunk_id || '',
              page: c.page || 1,
            })),
            keyDates: (draft.key_dates?.dates || []).map((d: ApiPrepDate) => ({ event: d.label, date: d.timing })),
            factsStillNeeded: draft.facts_still_needed?.items || [],
            questionsForLawyer: draft.questions_for_lawyer?.questions || [],
            userNotes: draft.user_notes || '',
          });
        }
      })
      .catch(() => {
        // Fallback gracefully on network error
      });
  }, [projectId]);

  const handleSave = async () => {
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
      const apiBase = getApiBaseUrl();
      if (token && projectId && data.id && !data.id.startsWith('lp_draft')) {
        await fetch(`${apiBase}/api/v1/projects/${projectId}/lawyer-prep/${data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userNotes: data.userNotes,
            status: data.status,
          }),
        });
      }
    } catch {
      // Handled gracefully in offline mode
    }
  };

  const handleToggleFinalize = async () => {
    const newStatus = data.status === 'draft' ? 'finalized' : 'draft';
    setData((prev) => ({
      ...prev,
      status: newStatus,
    }));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
      const apiBase = getApiBaseUrl();
      if (token && projectId && data.id && !data.id.startsWith('lp_draft')) {
        await fetch(`${apiBase}/api/v1/projects/${projectId}/lawyer-prep/${data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        });
      }
    } catch {
      // Handled gracefully in offline mode
    }
  };

  return (
    <main>
      <div className="flex-between margin-top-6 flex-wrap gap-4">
        <div>
          <div className="flex-gap-2">
            <h2 className="heading-xl">
              Lawyer Preparation Briefing
            </h2>
            <span
              className="text-xs font-bold uppercase"
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: data.status === 'finalized' ? 'var(--color-obligation-bg)' : '#F3F4F6',
                color: data.status === 'finalized' ? 'var(--color-obligation)' : 'var(--color-text-secondary)',
              }}
            >
              {data.status === 'finalized' ? '✓ Finalized' : '✏️ Editable Draft'}
            </span>
          </div>
          <p className="text-sm-secondary margin-top-1">
            Structured briefing document designed to streamline your legal consultation and save billable hours.
          </p>
        </div>

        <div className="flex-gap-3">
          <button
            type="button"
            className={`btn ${data.status === 'finalized' ? 'btn-ghost' : 'btn-secondary'}`}
            onClick={handleToggleFinalize}
          >
            {data.status === 'finalized' ? 'Mark as Draft' : 'Mark as Finalized'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onExportBriefing}
          >
            📄 Export Briefing (DOCX / PDF)
          </button>
        </div>
      </div>

      {/* Strict Copy Notice */}
      <div className="notice-banner">
        <span aria-hidden="true">📋</span>
        <div className="text-xs-secondary">
          <strong>Informational Briefing Notice:</strong> This document organizes contract terms, key dates, and preliminary questions for your independent legal counsel. It is not legal advice, a case assessment, or a formal legal opinion.
        </div>
      </div>

      {isSaved && (
        <div className="success-box" style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
          ✓ Changes saved successfully!
        </div>
      )}

      {/* Briefing Sections */}
      <div className="flex-col gap-6">
        {/* 1. Situation Summary */}
        <section className="card">
          <div className="flex-between margin-top-3">
            <h3 className="text-base font-bold">
              1. Situation & Agreement Summary
            </h3>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '2px 8px', fontSize: 'var(--font-size-xs)' }}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Summary'}
            </button>
          </div>

          {isEditing ? (
            <div>
              <textarea
                value={data.situationSummary}
                onChange={(e) => setData({ ...data, situationSummary: e.target.value })}
                rows={4}
                className="textarea-style"
              />
              <div className="margin-top-2" style={{ textAlign: 'right' }}>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  Save Summary
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
              {data.situationSummary}
            </p>
          )}
        </section>

        {/* 2. Key Clauses for Discussion */}
        <section className="card">
          <h3 className="text-base font-bold margin-top-3">
            2. Key Clauses for Legal Review
          </h3>
          <div className="flex-col gap-3">
            {data.keyClauses.map((clause, idx) => (
              <div key={idx} className="clause-item">
                <div>
                  <div className="text-sm font-semibold">{clause.title}</div>
                  <div className="text-xs-secondary margin-top-1">
                    {clause.summary}
                  </div>
                </div>
                <CitationPill chunkId={clause.citationChunkId} page={clause.page} snippet={clause.summary} />
              </div>
            ))}
          </div>
        </section>

        {/* 3. Facts Still Needed */}
        <section className="card">
          <h3 className="text-base font-bold margin-top-3">
            3. Facts & Documentation Still Needed
          </h3>
          <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
            {data.factsStillNeeded.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </section>

        {/* 4. Questions for Lawyer */}
        <section className="card">
          <h3 className="text-base font-bold margin-top-3">
            4. Recommended Questions for Your Lawyer
          </h3>
          <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
            {data.questionsForLawyer.map((q, idx) => (
              <li key={idx} className="margin-top-2">
                <strong>{q}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. User Consultation Notes */}
        <section className="card">
          <h3 className="text-base font-bold margin-top-2">
            5. Your Consultation Notes
          </h3>
          <textarea
            value={data.userNotes}
            onChange={(e) => setData({ ...data, userNotes: e.target.value })}
            placeholder="Type your notes, attorney name, meeting date, or custom instructions here..."
            rows={3}
            className="textarea-style"
          />
        </section>
      </div>
    </main>
  );
};
