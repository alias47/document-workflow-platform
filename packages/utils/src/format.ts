/**
 * Extract initials from a full name.
 * Example: "Sarah Mitchell" → "SM"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Combine first and last name into a full display name.
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Capitalize the first letter of each word.
 * Example: "under_review" → "Under Review"
 */
export function toTitleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
