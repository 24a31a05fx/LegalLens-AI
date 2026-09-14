'use client';

import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../lib/api-config';

interface ExportModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
}) => {
  const [sourceType, setSourceType] = useState<'summary' | 'comparison' | 'lawyer_prep'>('summary');
  const [format, setFormat] = useState<'markdown' | 'pdf' | 'docx' | 'ics'>('markdown');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const token = localStorage.getItem('legallens_auth_token');
      if (!token) {
        throw new Error('Please sign in before generating an export.');
      }
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/v1/projects/${projectId}/exports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exportSourceType: sourceType,
          format: format,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error?.message || `Export failed with status ${res.status}.`);
      }

      const data = await res.json();
      if (typeof data.download_url !== 'string' || data.download_url.length === 0) {
        throw new Error('The export service did not return a download link.');
      }
      setDownloadUrl(data.download_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to generate the export.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="flex-between mb-4">
          <h2 id="export-modal-title" className="heading-lg">
            Export Document Package
          </h2>
          <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose} aria-label="Close export modal">
            ✕
          </button>
        </div>

        <div className="notice-banner mb-4">
          <span aria-hidden="true">⚖️</span>
          <div className="text-xs-secondary">
            All exports automatically include mandatory legal disclaimers, generation timestamps, and grounded source citations. Links expire after 1 hour.
          </div>
        </div>

        {/* Source Selection */}
        <div className="margin-top-4">
          <label className="text-sm font-semibold margin-top-2" style={{ display: 'block' }}>
            Export Source
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {(
              [
                { id: 'summary', label: 'Summary & Analysis' },
                { id: 'comparison', label: 'Comparison Diff' },
                { id: 'lawyer_prep', label: 'Lawyer Briefing' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                className={`btn ${sourceType === s.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-2)' }}
                onClick={() => setSourceType(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="margin-top-6">
          <label className="text-sm font-semibold margin-top-2" style={{ display: 'block' }}>
            File Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
            {(
              [
                { id: 'markdown', label: 'Markdown (.md)' },
                { id: 'pdf', label: 'PDF (.pdf)' },
                { id: 'docx', label: 'Word (.docx)' },
                { id: 'ics', label: 'Calendar (.ics)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn ${format === f.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-2)' }}
                onClick={() => setFormat(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert-danger" style={{ fontSize: 'var(--font-size-xs)' }}>
            {error}
          </div>
        )}

        {downloadUrl && (
          <div className="export-success">
            <div className="font-semibold" style={{ color: 'var(--color-obligation)', marginBottom: 'var(--space-2)' }}>
              ✓ Export generated successfully!
            </div>
            <a
              href={downloadUrl}
              download={`LegalLens_${sourceType}_${projectName.replace(/\s+/g, '_')}.${format}`}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              📥 Download {format.toUpperCase()}
            </a>
          </div>
        )}

        <div className="flex-end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Generating Artifact...' : 'Generate Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
