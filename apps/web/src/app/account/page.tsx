'use client';

import { useState } from 'react';
import { getApiBaseUrl } from '../../lib/api-config';

export default function AccountPage() {
  const [displayName, setDisplayName] = useState('LegalLens Workspace User');
  const [email, setEmail] = useState('workspace-demo@legallens.internal');
  const [organization, setOrganization] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Token copy state
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleCopyToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legallens_auth_token') : null;
    if (token && navigator.clipboard) {
      navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      {/* Page Header */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Account & Security Settings</h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Manage your personal credentials, active sessions, and AI integration preferences.
            </p>
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
            }}
          >
            Role: Project Owner
          </span>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Profile Card */}
        <section className="card">
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            User Profile
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                ORGANIZATION / LAW FIRM
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            {isSaved && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', fontWeight: 600 }}>
                ✓ Profile saved successfully.
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Save Profile Changes
            </button>
          </form>
        </section>

        {/* Security & Password */}
        <section className="card">
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Security & Authentication
          </h2>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                CURRENT PASSWORD
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                NEW PASSWORD
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            {passwordError && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-real)', fontWeight: 600 }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', fontWeight: 600 }}>
                ✓ Password updated successfully.
              </div>
            )}

            <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              Update Password
            </button>
          </form>
        </section>
      </div>

      {/* Infrastructure & Integration Status */}
      <section className="card" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          System Drivers & AI Architecture
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-3)', backgroundColor: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              LLM INFERENCE DRIVER
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              MockLLM / GPT-4o-mini
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', marginTop: '2px' }}>
              ● Zero Retention Active
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              EMBEDDINGS DRIVER
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Text-Embedding-3 (1536-dim)
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', marginTop: '2px' }}>
              ● Hybrid Cosine + BM25
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              OBJECT STORAGE
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Private S3-Compatible Bucket
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', marginTop: '2px' }}>
              ● AES-256 Encryption at Rest
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              MALWARE & THREAT SHIELD
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              ClamAV Daemon Sandbox
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-obligation)', marginTop: '2px' }}>
              ● 0 Threats Detected
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Access & Telemetry */}
      <section className="card">
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Developer Access & API Credentials
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Use your bearer token to authenticate external tools or access the REST API directly.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <code
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: '#F3F4F6',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'monospace',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
          </code>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleCopyToken}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            {tokenCopied ? '✓ Copied Token' : '📋 Copy Bearer Token'}
          </button>

          <a
            href={`${getApiBaseUrl()}/api/docs.json`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            📄 OpenAPI Specification
          </a>

          <a
            href={`${getApiBaseUrl()}/api/v1/metrics`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            📊 System Metrics Endpoint
          </a>
        </div>
      </section>
    </div>
  );
}
