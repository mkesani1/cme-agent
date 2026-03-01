// ─── Shared License Utilities ───
// Extracted from index.tsx and licenses/index.tsx to eliminate duplication.

export type UrgencyLevel = 'critical' | 'thisYear' | 'safe';

/** Classify how urgent a license renewal is based on its expiry date. */
export function getUrgencyLevel(expiryDate: string | null): UrgencyLevel {
  if (!expiryDate) return 'safe';
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 90) return 'critical';       // Within 3 months → RED
  if (expiry.getFullYear() === now.getFullYear()) return 'thisYear'; // This year → YELLOW
  return 'safe';
}

/** Return the number of days until a date, or null if no date provided. */
export function getDaysUntilExpiry(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/** Teal gradient used on hero cards and profile headers. */
export const TEAL_GRADIENT = ['#00B4D8', '#0077B6', '#0064A6', '#005A9C'] as const;
