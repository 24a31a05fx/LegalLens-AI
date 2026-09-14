import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderNav } from '../components/HeaderNav';
import '../styles/design-tokens.css';

export const metadata = {
  title: 'LegalLens AI — AI-Powered Legal Document Assistant',
  description: 'Understand, compare, and act on legal documents with cited, grounded explanations.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header Landmark */}
          <header
            style={{
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              padding: 'var(--space-3) var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                LegalLens AI
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                Information Assistant
              </span>
            </Link>

            <HeaderNav />
          </header>

          {/* Main Content Landmark */}
          <main id="main-content" style={{ flex: 1 }}>
            {children}
          </main>

          {/* Footer Landmark */}
          <footer
            style={{
              backgroundColor: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              padding: 'var(--space-6) var(--space-8)',
              textAlign: 'center',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <p style={{ maxWidth: '800px', margin: '0 auto' }}>
              <strong>Notice:</strong> LegalLens AI provides general legal information and document analysis. It does not provide legal advice, represent users, or predict legal outcomes. For critical decisions, consult a qualified legal professional.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
