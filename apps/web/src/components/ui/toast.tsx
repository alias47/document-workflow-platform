'use client';

import { CheckCircle, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Visual config ──────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string }> = {
  success: {
    icon: <CheckCircle size={16} className="text-[#16A34A] shrink-0" />,
    bar: 'bg-[#16A34A]',
    bg: 'bg-white',
  },
  error: {
    icon: <XCircle size={16} className="text-[#DC2626] shrink-0" />,
    bar: 'bg-[#DC2626]',
    bg: 'bg-white',
  },
  warning: {
    icon: <TriangleAlert size={16} className="text-[#D97706] shrink-0" />,
    bar: 'bg-[#D97706]',
    bg: 'bg-white',
  },
  info: {
    icon: <Info size={16} className="text-[#2563EB] shrink-0" />,
    bar: 'bg-[#2563EB]',
    bg: 'bg-white',
  },
};

// ── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<Toast, 'id'>) => {
      const id = String(++nextId.current);
      setToasts((prev) => [...prev, { ...opts, id }]);
      setTimeout(() => dismiss(id), opts.type === 'error' ? 6000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-32px)] pointer-events-none"
      >
        {toasts.map((t) => {
          const config = TOAST_CONFIG[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-[10px] border border-[#E2E8F0] shadow-lg overflow-hidden',
                'animate-in slide-in-from-right-4 fade-in duration-200',
                config.bg,
              )}
            >
              {/* Left colour bar */}
              <div className={cn('w-1 self-stretch shrink-0 rounded-l-[10px]', config.bar)} />

              {/* Content */}
              <div className="flex items-start gap-2.5 flex-1 py-3 pr-2">
                {config.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A]">{t.title}</p>
                  {t.message && (
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{t.message}</p>
                  )}
                </div>
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="mt-2.5 mr-2.5 text-[#94A3B8] hover:text-[#64748B] transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
