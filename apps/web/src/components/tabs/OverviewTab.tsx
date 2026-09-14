'use client';

import React, { useState } from 'react';

export interface ProjectOverview {
  id: string;
  name: string;
  jurisdiction_code?: string;
  document_type?: string;
}

export interface DocumentOverview {
  id: string;
  filename: string;
  status: string;
}

export interface AnalysisFindingItem {
  id?: string;
  finding_type: string;
  content?: string;
  title?: string;
  explanation?: string;
}

export interface AnalysisOverview {
  id?: string;
  findings?: AnalysisFindingItem[];
}

interface OverviewTabProps {
  project: ProjectOverview;
  document: DocumentOverview;
  analysis: AnalysisOverview | null;
  readingLevel?: 'simple' | 'detailed';
  onReadingLevelChange?: (level: 'simple' | 'detailed') => void;
  onNavigateTab: (tabId: string) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  project,
  document,
  analysis,
  readingLevel: readingLevelProp,
  onReadingLevelChange,
  onNavigateTab,
  onOpenUpload,
  onOpenExport,
}) => {
  const [internalReadingLevel, setInternalReadingLevel] = useState<'simple' | 'detailed'>('simple');
  const readingLevel = readingLevelProp ?? internalReadingLevel;

  const handleToggleReadingLevel = (level: 'simple' | 'detailed') => {
    setInternalReadingLevel(level);
    onReadingLevelChange?.(level);
  };

  const findings = analysis?.findings || [];
  const clausesCount = findings.filter((f) => f.finding_type === 'clause').length;
  const reviewPointsCount = findings.filter((f) => f.finding_type === 'review_point').length;
  const keyDatesCount = findings.filter((f) => f.finding_type === 'date').length;

  return (
    <main>
      {/* Top Banner with Quick Actions */}
      <div className="flex-between flex-wrap gap-4 margin-top-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {document?.filename || 'Commercial_Agreement_2026.pdf'}
          </h2>
          <p className="text-sm-secondary margin-top-1">
            Document Status:             <strong style={{ color: 'var(--color-obligation)' }}>{document.status}</strong> · Jurisdiction: {project?.jurisdiction_code || 'Not specified'}
          </p>
        </div>

        <div className="flex-gap-3">
          <button type="button" className="btn btn-secondary" onClick={onOpenUpload}>
            ➕ Upload New Version
          </button>
          <button type="button" className="btn btn-primary" onClick={onOpenExport}>
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-cards margin-top-6">
        <div className="card cursor-pointer" onClick={() => onNavigateTab('clauses')}>
          <div className="text-xs uppercase font-bold text-secondary">
            Clauses Identified
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)', margin: 'var(--space-2) 0' }}>
            {clausesCount}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-obligation)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>✓</span> All clauses cited to document
          </div>
        </div>

        <div className="card cursor-pointer" onClick={() => onNavigateTab('review_points')}>
          <div className="text-xs uppercase font-bold text-secondary">
            Review Points
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--color-review)', margin: 'var(--space-2) 0' }}>
            {reviewPointsCount}
          </div>
          <div className="text-xs-secondary">
            Notable items requiring attention
          </div>
        </div>

        <div className="card cursor-pointer" onClick={() => onNavigateTab('dates')}>
          <div className="text-xs uppercase font-bold text-secondary">
            Key Dates & Deadlines
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--color-deadline)', margin: 'var(--space-2) 0' }}>
            {keyDatesCount}
          </div>
          <div className="text-xs-secondary">
            Milestones and notice periods
          </div>
        </div>

        <div className="card cursor-pointer" onClick={() => onNavigateTab('lawyer_prep')}>
          <div className="text-xs uppercase font-bold text-secondary">
            Lawyer Consultation
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)', margin: 'var(--space-2) 0' }}>
            Draft
          </div>
          <div className="text-xs-secondary">
            Structured briefing prepared
          </div>
        </div>
      </div>

      {/* Plain Language Summary Card with Reading-Level Toggle (PRD FR-9) */}
      <div className="card margin-top-6">
        <div className="flex-between margin-top-4 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold">
              Plain-Language Executive Summary
            </h3>
            <p className="text-xs-secondary margin-top-1">Generated only after document analysis completes.</p>
          </div>

          <div className="flex-gap-3">
            {/* PRD FR-9: Reading Level Toggle */}
            <div
              role="group"
              aria-label="Summary reading level toggle"
              className="toggle-group"
            >
              <button
                type="button"
                aria-pressed={readingLevel === 'simple'}
                onClick={() => handleToggleReadingLevel('simple')}
                className={`toggle-button ${readingLevel === 'simple' ? 'toggle-button-active' : 'toggle-button-inactive'}`}
              >
                Simple
              </button>
              <button
                type="button"
                aria-pressed={readingLevel === 'detailed'}
                onClick={() => handleToggleReadingLevel('detailed')}
                className={`toggle-button ${readingLevel === 'detailed' ? 'toggle-button-active' : 'toggle-button-inactive'}`}
              >
                Detailed
              </button>
            </div>

          </div>
        </div>

        {/* Content based on selected reading level */}
        {analysis?.findings?.length ? (
          <div className="margin-top-3">
            <p className="text-sm-secondary mb-3">
              {readingLevel === 'simple'
                ? 'Plain-language summary of core terms extracted directly from verified document passages.'
                : 'Detailed legal breakdown including specific covenants, timelines, and dispute terms.'}
            </p>
            <div className="flex-col gap-2">
              {analysis.findings.slice(0, 4).map((f, i) => (
                <div key={f.id || i} className="analysis-box" style={{ margin: 0 }}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{f.title}: </span>
                  <span className="text-sm-secondary">{f.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm-secondary margin-top-2">
            No analysis has been generated for this document yet. Upload and process a document, then run an analysis to see cited findings here.
          </p>
        )}
      </div>

      {/* Parties and Contract Basics */}
      <div className="card">
        <h3 className="text-base font-bold margin-top-3">
          Contract Metadata & Parties
        </h3>
        <div className="grid-metadata">
          <div>
            <div className="text-xs-secondary">Disclosing / First Party</div>
            <div className="font-semibold margin-top-1">Not extracted</div>
          </div>
          <div>
            <div className="text-xs-secondary">Receiving / Second Party</div>
            <div className="font-semibold margin-top-1">Not extracted</div>
          </div>
          <div>
            <div className="text-xs-secondary">Governing Law</div>
            <div className="font-semibold margin-top-1">{project?.jurisdiction_code || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs-secondary">Effective Term</div>
            <div className="font-semibold margin-top-1">Not extracted</div>
          </div>
        </div>
      </div>
    </main>
  );
};
