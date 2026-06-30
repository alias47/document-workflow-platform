/**
 * Format an ISO date string for display.
 * Example: "2026-06-15T10:30:00Z" → "15 Jun 2026"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string as a relative time label.
 * Example: "2 hours ago", "Yesterday", "15 Jun 2026"
 */
export function formatRelativeDate(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
}

/**
 * Check whether a date string represents a past date.
 */
export function isPast(dateString: string): boolean {
  return new Date(dateString).getTime() < Date.now();
}
