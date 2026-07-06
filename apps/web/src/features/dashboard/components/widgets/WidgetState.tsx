import type { ReactNode } from 'react';

interface WidgetStateProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Card-scoped state wrapper so each dashboard widget loads and fails
 * independently — one broken widget never blanks the whole page (Sprint 11.5
 * §12/§20). Renders a skeleton while loading and an inline error with retry on
 * failure; otherwise renders the widget's own content.
 */
export function WidgetState({ title, isLoading, isError, onRetry, children }: WidgetStateProps) {
  if (isLoading) {
    return (
      <div className="card" aria-busy="true">
        <div className="card-header">
          <div className="card-title">{title}</div>
        </div>
        <div
          className="card-body"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '16px', borderRadius: 'var(--radius-sm)', background: '#E2E8F0' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">{title}</div>
        </div>
        <div
          className="card-body"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
          }}
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: '#DC2626' }}>
            Couldn&apos;t load this widget.
          </p>
          {onRetry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
