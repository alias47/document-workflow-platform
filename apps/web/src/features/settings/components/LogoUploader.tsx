'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { useRemoveLogo, useUploadLogo } from '../hooks/use-settings';

import { useToast } from '@/components/ui/toast';

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

interface LogoUploaderProps {
  currentLogoKey: string | null;
}

export function LogoUploader({ currentLogoKey }: LogoUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useUploadLogo();
  const removeMutation = useRemoveLogo();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast({ type: 'error', title: 'Invalid file type', message: 'Use JPEG, PNG, WebP, or SVG.' });
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      toast({ type: 'error', title: 'File too large', message: 'Logo must be under 5 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast({ type: 'success', title: 'Logo uploaded', message: 'Consultancy logo updated.' });
        setPreview(null);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Logo upload failed.';
        toast({ type: 'error', title: 'Upload failed', message: msg });
        setPreview(null);
      },
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleRemove() {
    removeMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ type: 'success', title: 'Logo removed', message: 'Consultancy logo cleared.' });
        setPreview(null);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to remove logo.';
        toast({ type: 'error', title: 'Remove failed', message: msg });
      },
    });
  }

  const isPending = uploadMutation.isPending || removeMutation.isPending;
  const displaySrc = preview ?? (currentLogoKey ? `/api/settings/logo` : null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      {/* Preview */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {displaySrc ? (
          <Image
            src={displaySrc}
            alt="Consultancy logo"
            width={80}
            height={80}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            unoptimized={displaySrc.startsWith('data:')}
          />
        ) : (
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>No logo</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_LOGO_TYPES.join(',')}
          style={{ display: 'none' }}
          aria-label="Upload logo"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
        >
          {currentLogoKey ? 'Replace logo' : 'Upload logo'}
        </button>
        {currentLogoKey && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: '#EF4444' }}
            onClick={handleRemove}
            disabled={isPending}
          >
            Remove
          </button>
        )}
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
          JPEG, PNG, WebP or SVG · max 5 MB
        </span>
      </div>
    </div>
  );
}
