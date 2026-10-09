import crypto from 'crypto';

/**
 * Generate a random formatted license key, e.g. FBX-94A2-7E19-84BC
 */
export function generateLicenseKey(): string {
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `FBX-${segment1}-${segment2}-${segment3}`;
}

/**
 * Format date nicely for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate remaining days until expiration
 */
export function getRemainingDays(expiresAt: string | Date): { days: number; isExpired: boolean } {
  const target = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return {
    days: Math.max(0, days),
    isExpired: days <= 0,
  };
}
