'use client';

import { useState } from 'react';

import type { ExportFormat } from '../types';

import { useToast } from '@/components/ui/toast';

interface Props {
  onExport: (format: ExportFormat) => Promise<void>;
  disabled?: boolean;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  xlsx: 'Excel (.xlsx)',
  pdf: 'PDF',
};

export function ExportButton({ onExport, disabled }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoading(format);
    setOpen(false);
    try {
      await onExport(format);
    } catch {
      toast({
        type: 'error',
        title: 'Export failed',
        message: 'Could not generate the export. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled ?? loading !== null}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {loading ? 'Exporting…' : 'Export'}
        <span style={{ marginLeft: '4px' }}>▾</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              minWidth: '160px',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                role="menuitem"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#1E293B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                }
                onClick={() => void handleExport(fmt)}
              >
                {FORMAT_LABELS[fmt]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
