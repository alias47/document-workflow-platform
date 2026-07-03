'use client';

import { useRef, useState } from 'react';

import { useApplicantUploadDocument } from '../hooks/use-applicant-portal';

import { Button } from '@/components/ui/button';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

interface Props {
  requirementId: string;
  requirementName: string;
  onClose: () => void;
}

export function ApplicantUploadDialog({ requirementId, requirementName, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useApplicantUploadDocument();

  function validateFile(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Only PDF, JPEG, PNG and WebP files are allowed';
    }
    if (f.size > MAX_SIZE_BYTES) {
      return 'File size must be under 10 MB';
    }
    return null;
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    await upload.mutateAsync({ requirementId, file });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold">Upload Document</h2>
        <p className="mb-4 text-sm text-gray-500">{requirementName}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {file ? (
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Drag & drop or click to browse</p>
                <p className="mt-1 text-xs text-gray-400">PDF, JPEG, PNG, WebP — max 10 MB</p>
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {upload.isError && (
            <p className="text-sm text-red-600">Upload failed. Please try again.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || upload.isPending}>
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
