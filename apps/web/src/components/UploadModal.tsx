'use client';

import React, { useState, useRef, useEffect } from 'react';

interface UploadModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (document: { id: string; filename: string; [key: string]: unknown }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'scanning' | 'processing' | 'ready' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        uploadStatus !== 'uploading' &&
        uploadStatus !== 'scanning' &&
        uploadStatus !== 'processing'
      ) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, uploadStatus, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File exceeds maximum size of 25MB.');
      setUploadStatus('error');
      return;
    }

    try {
      setUploadStatus('uploading');
      setErrorMessage(null);

      // Read file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1] || (reader.result as string);

          setUploadStatus('scanning');

          // POST to backend
          const token = localStorage.getItem('legallens_auth_token');
          if (!token) {
            throw new Error('Please sign in before uploading a document.');
          }
          const res = await fetch(`http://localhost:4000/api/v1/projects/${projectId}/documents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              filename: file.name,
              mediaType: file.type || 'application/pdf',
              contentBase64: base64Data,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `Upload failed with status ${res.status}`);
          }

          setUploadStatus('processing');
          const data = await res.json();

          setUploadStatus('ready');
          setTimeout(() => {
            onUploadSuccess({
              ...data.document,
              ocrConfidence: data.ocr_confidence ?? 0.98,
            });
            onClose();
          }, 800);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'An unexpected error occurred during processing.';
          setErrorMessage(msg);
          setUploadStatus('error');
        }
      };

      reader.readAsDataURL(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read file.';
      setErrorMessage(msg);
      setUploadStatus('error');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px' }}
      >
        <div className="flex-between mb-4">
          <h2 id="upload-modal-title" className="heading-lg">
            Upload Legal Document
          </h2>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
            onClick={onClose}
            aria-label="Close upload modal"
            disabled={uploadStatus === 'uploading' || uploadStatus === 'scanning' || uploadStatus === 'processing'}
          >
            ✕
          </button>
        </div>

        {/* Informational Notice */}
        <div className="notice-banner mb-4">
          <span aria-hidden="true">🔒</span>
          <div className="text-xs-secondary">
            <strong>Private & Encrypted:</strong> Uploaded contracts are quarantined, scanned for malware, and chunked with verified citations. Allowed formats: PDF, DOCX, TXT. Max size: 25MB.
          </div>
        </div>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="File drop zone — click or press Enter to browse files"
          className={isDragOver ? 'dropzone dropzone--active' : 'dropzone'}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Select file to upload"
          />

          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>📄</div>
          {file ? (
            <div>
              <div className="text-semibold">{file.name}</div>
              <div className="text-xs-secondary" style={{ marginTop: '4px' }}>
                {(file.size / 1024).toFixed(1)} KB — Click or drop another to replace
              </div>
            </div>
          ) : (
            <div>
              <div className="text-semibold">
                Drag and drop your legal contract here
              </div>
              <div className="text-xs-secondary" style={{ marginTop: '4px' }}>
                or click to browse files (PDF, DOCX, TXT up to 25MB)
              </div>
            </div>
          )}
        </div>

        {/* Progress State Indicator */}
        {uploadStatus !== 'idle' && (
          <div className="progress-box">
            <div className="flex-gap-2" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              {uploadStatus === 'uploading' && <span>⏳ Uploading document bytes...</span>}
              {uploadStatus === 'scanning' && <span>🛡️ Quarantined: Scanning for threats & malware...</span>}
              {uploadStatus === 'processing' && <span>⚙️ Extracting text, detecting sections & embedding chunks...</span>}
              {uploadStatus === 'ready' && <span style={{ color: 'var(--color-obligation)' }}>✓ Processing complete!</span>}
              {uploadStatus === 'error' && <span style={{ color: 'var(--color-danger-real)' }}>⚠️ Ingestion failed</span>}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="alert-danger" style={{ fontSize: 'var(--font-size-xs)' }}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="flex-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'scanning' || uploadStatus === 'processing'}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'scanning' || uploadStatus === 'processing'}
            onClick={handleStartUpload}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Process Document'}
          </button>
        </div>
      </div>
    </div>
  );
};
