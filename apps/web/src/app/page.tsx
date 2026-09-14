'use client';

import { useState, useEffect } from 'react';
import { OverviewTab, AnalysisOverview } from '../components/tabs/OverviewTab';
import { ClausesTab } from '../components/tabs/ClausesTab';
import { ReviewPointsTab } from '../components/tabs/ReviewPointsTab';
import { KeyDatesTab } from '../components/tabs/KeyDatesTab';
import { AskAiTab } from '../components/tabs/AskAiTab';
import { CompareTab } from '../components/tabs/CompareTab';
import { LawyerPrepTab } from '../components/tabs/LawyerPrepTab';
import { UploadModal } from '../components/UploadModal';
import { ExportModal } from '../components/ExportModal';

export type WorkspaceTab =
  | 'overview'
  | 'clauses'
  | 'review_points'
  | 'dates'
  | 'ask_ai'
  | 'compare'
  | 'lawyer_prep';

interface UploadedDocPayload {
  id: string;
  filename: string;
  [key: string]: unknown;
}

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Active project & documents state
  const [project, setProject] = useState({
    id: 'proj_commercial_license',
    name: 'Commercial IP & Distribution License',
    jurisdiction_code: 'California, US',
    document_type: 'License Agreement',
  });

  const [document, setDocument] = useState<{
    id: string;
    filename: string;
    status: string;
    ocrConfidence?: number;
  }>({
    id: 'doc_license_v1',
    filename: 'Commercial_Software_License.pdf',
    status: 'READY',
    ocrConfidence: 0.98,
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
    if (!token) return;

    const params = new URLSearchParams(window.location.search);
    const queryProjId = params.get('projectId');

    fetch('http://localhost:4000/api/v1/projects', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.projects && data.projects.length > 0) {
          const selectedProj = queryProjId
            ? data.projects.find((p: { id: string }) => p.id === queryProjId) || data.projects[0]
            : data.projects[0];

          setProject({
            id: selectedProj.id,
            name: selectedProj.name,
            jurisdiction_code: selectedProj.jurisdiction_code || 'California, US',
            document_type: selectedProj.document_type || 'Commercial Agreement',
          });

          fetch(`http://localhost:4000/api/v1/projects/${selectedProj.id}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((dRes) => (dRes.ok ? dRes.json() : null))
            .then((docData) => {
              if (docData?.documents && docData.documents.length > 0) {
                const latestDoc = docData.documents[docData.documents.length - 1];
                setDocument({
                  id: latestDoc.id,
                  filename: latestDoc.filename,
                  status: latestDoc.status,
                  ocrConfidence: 0.98,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const [analysis, setAnalysis] = useState<AnalysisOverview | null>(null);
  const [readingLevel, setReadingLevel] = useState<'simple' | 'detailed'>('simple');

  const handleReadingLevelChange = async (newLevel: 'simple' | 'detailed') => {
    setReadingLevel(newLevel);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
      if (!token) return;
      const res = await fetch(`http://localhost:4000/api/v1/projects/${project.id}/documents/${document.id}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisType: 'summary',
          readingLevel: newLevel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis({
          id: data.analysis?.id,
          findings: data.findings || [],
        });
      }
    } catch {
      // Handled gracefully in client
    }
  };

  const handleDocumentUploaded = (newDoc: UploadedDocPayload) => {
    setDocument({
      id: newDoc.id,
      filename: newDoc.filename,
      status: 'READY',
      ocrConfidence: typeof newDoc.ocrConfidence === 'number' ? newDoc.ocrConfidence : 0.98,
    });
    setAnalysis(null);
    setActiveTab('overview');
  };

  const tabsList: Array<{ id: WorkspaceTab; label: string; icon: string; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'clauses', label: 'Clauses', icon: '📑', count: 4 },
    { id: 'review_points', label: 'Review Points', icon: '🔍', count: 3 },
    { id: 'dates', label: 'Key Dates', icon: '📅', count: 4 },
    { id: 'ask_ai', label: 'Ask AI', icon: '💬' },
    { id: 'compare', label: 'Compare', icon: '⚖️' },
    { id: 'lawyer_prep', label: 'Lawyer Prep', icon: '📝' },
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabsList.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabsList.length) % tabsList.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabsList.length - 1;
    } else {
      return;
    }
    const nextTab = tabsList[nextIndex];
    setActiveTab(nextTab.id);
    const btn = typeof window !== 'undefined' ? window.document.getElementById(`tab-${nextTab.id}`) : null;
    btn?.focus();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Contextual Legal Disclaimer Banner (03_UIUX_Design.md §11) */}
      <section
        aria-label="Contextual legal disclaimer banner"
        className="notice-banner"
      >
        <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>⚖️</span>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Legal Information Notice
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            LegalLens AI is an automated information tool and does not provide legal advice, legal strategy, or outcome predictions. All outputs are grounded in your uploaded documents and include verified source citations.
          </p>
        </div>
      </section>

      {/* Project Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-primary)' }}>
              Project:
            </span>
            <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>
              {project.name}
            </h1>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Active Document: <strong>{document.filename}</strong> · OCR Confidence: <strong>{((document.ocrConfidence ?? 0.98) * 100).toFixed(0)}%</strong> · Jurisdiction: {project.jurisdiction_code}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsUploadOpen(true)}
          >
            📤 Upload Document
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsExportOpen(true)}
          >
            📦 Export Package
          </button>
        </div>
      </div>

      {/* Tab Navigation (04_App_Flow.md §13) */}
      <nav aria-label="Workspace document analysis navigation" role="tablist" className="tabs-container">
        {tabsList.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              className={`tab-button ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className="tab-badge"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab Content Panes */}
      <main id="main-tab-content">
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            document={document}
            analysis={analysis}
            readingLevel={readingLevel}
            onReadingLevelChange={handleReadingLevelChange}
            onNavigateTab={(tab: string) => setActiveTab(tab as WorkspaceTab)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'clauses' && <ClausesTab />}

        {activeTab === 'review_points' && <ReviewPointsTab />}

        {activeTab === 'dates' && (
          <KeyDatesTab
            projectId={project.id}
            documentId={document.id}
            onExportIcs={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'ask_ai' && (
          <AskAiTab projectId={project.id} documentId={document.id} />
        )}

        {activeTab === 'compare' && (
          <CompareTab projectId={project.id} />
        )}

        {activeTab === 'lawyer_prep' && (
          <LawyerPrepTab
            projectId={project.id}
            onExportBriefing={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <UploadModal
        projectId={project.id}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleDocumentUploaded}
      />

      <ExportModal
        projectId={project.id}
        projectName={project.name}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
