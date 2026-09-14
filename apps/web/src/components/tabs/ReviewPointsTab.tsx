'use client';

import React from 'react';
import { CitationPill } from '../CitationViewer';

export interface ReviewPointItem {
  id: string;
  topic: string;
  observation: string;
  whyItMatters: string;
  discussionPoint: string;
  chunkId: string;
  page: number;
}

export const ReviewPointsTab: React.FC<{ reviewPoints?: ReviewPointItem[] }> = ({
  reviewPoints = [],
}) => {
  return (
    <main>
      <div className="margin-top-6">
        <h2 className="heading-xl">Review Points</h2>
        <p className="text-sm-secondary margin-top-1">
          Notable clauses and terms requiring business or legal consideration before execution.
        </p>
      </div>

      <div className="notice-banner">
        <span aria-hidden="true">💡</span>
        <div className="text-xs-secondary">
          <strong>Objective Framing:</strong> Review points highlight clauses that commonly benefit from clarification or negotiation. They do not constitute a legal opinion on contract validity.
        </div>
      </div>

      <div className="flex-col gap-4">
        {reviewPoints.length === 0 && (
          <p className="text-sm-secondary">No cited review points are available yet. Run document analysis after processing an upload.</p>
        )}
        {reviewPoints.map((item, idx) => (
          <article
            key={item.id}
            className="card review-left-border"
          >
            <div className="flex-between margin-top-3">
              <div className="flex-gap-2">
                <span className="badge-review">
                  🔍 Review Point #{idx + 1}
                </span>
                <h3 className="text-base font-bold">
                  {item.topic}
                </h3>
              </div>
              <CitationPill chunkId={item.chunkId} page={item.page} snippet={item.observation} />
            </div>

            <div className="grid-review margin-top-3">
              <div>
                <div className="text-xs font-bold text-secondary margin-top-1">
                  CONTRACT OBSERVATION
                </div>
                <p className="text-sm text-primary" style={{ lineHeight: 1.5 }}>
                  {item.observation}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-secondary margin-top-1">
                  WHY THIS WARRANTS REVIEW
                </div>
                <p className="text-sm text-primary" style={{ lineHeight: 1.5 }}>
                  {item.whyItMatters}
                </p>
              </div>
            </div>

            <div className="consideration-box margin-top-4">
              <strong>Suggested Consideration:</strong> {item.discussionPoint}
            </div>

            {/* PRD FR-14 Mandatory Disclaimer Copy */}
            <div className="disclaimer-text margin-top-2">
              This is a review prompt generated from the document, not a legal conclusion.
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};
