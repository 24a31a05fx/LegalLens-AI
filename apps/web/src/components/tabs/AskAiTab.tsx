'use client';

import React, { useState } from 'react';
import { CitationPill } from '../CitationViewer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reframedNotice?: string;
  abstained?: boolean;
  citations?: Array<{
    chunkId: string;
    page: number;
    snippet: string;
  }>;
  followUpSuggestions?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: 'Hello! I am your LegalLens AI Assistant. I can help answer questions about your uploaded agreement. All responses are strictly grounded in verified document text with source citations.',
  },
];

export const AskAiTab: React.FC<{ projectId: string; documentId?: string }> = ({
  projectId,
  documentId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('legallens_auth_token');
      if (!token) {
        throw new Error('Please sign in before asking a question.');
      }

      // Send to backend API
      const res = await fetch(`http://localhost:4000/api/v1/projects/${projectId}/conversations/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: textToSend, documentId }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error?.message || `Request failed with status ${res.status}.`);
      }

      const data = await res.json();
      const asstMsg: ChatMessage = {
        id: data.message?.id || `a_${Date.now()}`,
        role: 'assistant',
        content: data.message?.content || 'The service returned no answer.',
        reframedNotice: data.reframedNotice,
        abstained: data.abstained,
        citations: data.citations || [],
        followUpSuggestions: data.followUpSuggestions || data.follow_up_suggestions || [],
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to contact the legal analysis service.';
      setMessages((prev) => [
        ...prev,
        { id: `e_${Date.now()}`, role: 'assistant', content: `Unable to answer: ${message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-col" style={{ height: '620px' }}>
      <div className="mb-4">
        <h2 className="heading-xl">Ask AI (Grounded Q&A)</h2>
        <p className="text-sm-secondary">
          Ask questions about this agreement. Responses are strictly grounded in document text with source citations.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex-gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <span className="text-xs-secondary-center">
          Suggested:
        </span>
        {[
          'What is the cure period for a breach?',
          'What are the royalty terms and rate?',
          'Should I sign this agreement?',
          'What is the penalty for late delivery?',
        ].map((q) => (
          <button
            key={q}
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)' }}
            onClick={() => handleSend(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="chat-messages-container">
        {messages.map((m) => (
          <div key={m.id} className="chat-message-row">
            {m.role === 'user' ? (
              <div className="chat-user">
                <div style={{ fontSize: 'var(--font-size-sm)' }}>{m.content}</div>
              </div>
            ) : (
              <div className="chat-assistant">
                {/* Reframing Notice Banner if High Stakes */}
                {m.reframedNotice && (
                  <div className="notice-reframed">
                    {m.reframedNotice}
                  </div>
                )}

                {/* Abstention Notice if Evidence Insufficient */}
                {m.abstained && (
                  <div className="notice-abstention">
                    ℹ️ <strong>Evidence Abstention:</strong> The document does not contain sufficient information to answer this query.
                  </div>
                )}

                <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {m.content}
                </div>

                {/* Citations Attached to Assistant Message */}
                {m.citations && m.citations.length > 0 && (
                  <div className="citations-row">
                    <span className="text-xs-secondary" style={{ fontWeight: 600 }}>
                      Sources Cited:
                    </span>
                    {m.citations.map((c, i) => (
                      <CitationPill key={i} chunkId={c.chunkId} page={c.page} snippet={c.snippet} />
                    ))}
                  </div>
                )}

                {/* Grounded Follow-Up Suggestions (01_PRD.md FR-23) */}
                {m.followUpSuggestions && m.followUpSuggestions.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
                    <div className="text-xs-secondary" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      💡 Follow-Up Suggestions:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {m.followUpSuggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          onClick={() => handleSend(suggestion)}
                        >
                          💬 {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-assistant" style={{ width: '180px' }}>
            <span className="text-sm-secondary">
              ⚡ Grounding evidence...
            </span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex-gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this contract..."
          aria-label="Ask a question about the document"
          className="input-flex"
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
          Ask Question
        </button>
      </form>
    </main>
  );
};
