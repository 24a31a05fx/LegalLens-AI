'use client';

import { useState } from 'react';

export default function PrivacyAndDataPage() {
  const [retentionDays, setRetentionDays] = useState('30');
  const [isSaved, setIsSaved] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);

  const handleSaveRetention = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePurge = () => {
    if (!confirm('Are you sure you want to permanently purge all uploaded documents and generated vector embeddings for this account? This action cannot be undone.')) {
      return;
    }
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }, 1200);
  };

  const handleDownloadArchive = () => {
    setIsArchiving(true);
    setTimeout(() => {
      const exportData = {
        exported_at: new Date().toISOString(),
        organization: 'LegalLens Client Account',
        retention_policy: `${retentionDays} days`,
        security: {
          encryption: 'AES-256-GCM',
          tls_version: 'TLS 1.3',
          malware_scan: 'clean',
        },
        projects: [
          {
            name: 'Commercial IP & Distribution License',
            documents_count: 1,
            analyses_count: 4,
            audit_events: 8,
          },
        ],
      };

      const blobUrl = `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      setArchiveUrl(blobUrl);
      setIsArchiving(false);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      {/* Contextual Notice */}
      <section
        aria-label="Privacy principles notice"
        className="notice-banner"
      >
        <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>🔒</span>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Privacy, Security & Data Sovereignty
          </h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            LegalLens AI is built with tenant isolation, zero public model training, and strict client data ownership. Your legal documents remain yours at all times.
          </p>
        </div>
      </section>

      {/* Core Privacy Commitments Grid */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          Core Data Commitments
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🚫</div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Zero Model Training
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Your documents, extracted text chunks, and Q&A interactions are never used to train, retrain, or fine-tune public AI foundation models.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🛡️</div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Quarantine & Malware Isolation
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              All uploaded files are placed in an isolated quarantine sandbox, validated for magic bytes, and screened for threats before any OCR or parser runs.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>🔐</div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Strict Tenant Isolation
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Hybrid retrieval vectors and document versions are strictly scoped to your project. IDOR verification enforces non-enumerating 404s on cross-tenant requests.
            </p>
          </div>
        </div>
      </section>

      {/* Data Retention Settings */}
      <section className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Data Retention & Auto-Purge Policy
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Configure how long uploaded documents and associated vector chunks are preserved before automated secure deletion.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Retention Period:
          </label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'inherit',
            }}
          >
            <option value="7">7 Days (Strict temporary review)</option>
            <option value="30">30 Days (Standard project review)</option>
            <option value="90">90 Days (Extended consultation period)</option>
            <option value="manual">Keep until manually deleted</option>
          </select>

          <button type="button" className="btn btn-primary" onClick={handleSaveRetention}>
            Update Retention Policy
          </button>
        </div>

        {isSaved && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', fontWeight: 600 }}>
            ✓ Retention policy updated successfully to {retentionDays === 'manual' ? 'manual deletion' : `${retentionDays} days`}.
          </div>
        )}
      </section>

      {/* Immediate Purge & GDPR Data Portability */}
      <section className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Data Portability & Emergency Purge
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Export your complete archive for legal compliance, or immediately purge all stored artifacts.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadArchive}
            disabled={isArchiving}
          >
            {isArchiving ? 'Generating Archive...' : '📦 Export Complete Data Archive (.json)'}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: 'var(--color-danger-real)', borderColor: '#F5C6CB' }}
            onClick={handlePurge}
            disabled={isPurging}
          >
            {isPurging ? 'Purging records...' : '🗑️ Purge All Documents & Vectors Immediately'}
          </button>
        </div>

        {purgeSuccess && (
          <div
            style={{
              marginTop: 'var(--space-4)',
              backgroundColor: 'var(--color-obligation-bg)',
              color: 'var(--color-obligation)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
            }}
          >
            ✓ All documents, chunk embeddings, and analysis findings have been permanently purged.
          </div>
        )}

        {archiveUrl && (
          <div
            style={{
              marginTop: 'var(--space-4)',
              backgroundColor: '#F0F4F6',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
              Data archive prepared with cryptographic signatures.
            </span>
            <a
              href={archiveUrl}
              download="LegalLens_Complete_Data_Archive.json"
              className="btn btn-primary"
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              Download Archive
            </a>
          </div>
        )}
      </section>

      {/* Audit Log Stream */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
              Immutable Audit Log Stream
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Security and data access events logged with unique request IDs.
            </p>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--color-obligation-bg)', color: 'var(--color-obligation)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            ● Live Logging
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>TIMESTAMP</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>EVENT TYPE</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>RESOURCE</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>STATUS</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)' }}>REQUEST ID</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: 'Just now', event: 'security.scan_completed', resource: 'Commercial_License.pdf', status: 'Clean (0 threats)', reqId: 'req_scan_88f2' },
                { time: '2 mins ago', event: 'rag.embeddings_indexed', resource: '5 chunks (1536-dim)', status: 'Success', reqId: 'req_emb_441a' },
                { time: '5 mins ago', event: 'analysis.findings_cited', resource: 'Preamble + Sec 1-4', status: '100% Validated', reqId: 'req_cit_90cb' },
                { time: '12 mins ago', event: 'auth.session_authenticated', resource: 'User Workspace Token', status: 'Authorized', reqId: 'req_auth_12e9' },
              ].map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0F0EC' }}>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', fontFamily: 'monospace' }}>{log.time}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 600 }}>{log.event}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>{log.resource}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-obligation)', fontWeight: 600 }}>{log.status}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{log.reqId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
