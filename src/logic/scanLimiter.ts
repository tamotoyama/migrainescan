// Pure logic layer — no React, no Firebase, no side effects.
import type { UserProfileDoc } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const FREE_SCAN_LIMIT = 1;

// ─── Main helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if the user is allowed to perform a scan right now.
 * Premium users always can. Free users can only scan if they have not
 * yet used their single lifetime free scan.
 */
export function canScan(userDoc: UserProfileDoc | null, isPremium: boolean): boolean {
  if (isPremium) return true;
  if (userDoc === null) return false;
  return isFreeScanAvailable(userDoc);
}

/**
 * Returns true if the user still has their free scan available.
 * Free scan is consumed once freeScanUsed is incremented in Firestore.
 */
export function isFreeScanAvailable(userDoc: UserProfileDoc): boolean {
  return (userDoc.freeScanCount ?? 0) < FREE_SCAN_LIMIT;
}

/**
 * Returns how many free scans remain (0 or 1).
 */
export function getFreeScanRemaining(userDoc: UserProfileDoc | null): number {
  if (userDoc === null) return 0;
  const used = userDoc.freeScanCount ?? 0;
  return Math.max(0, FREE_SCAN_LIMIT - used);
}

/**
 * Returns a human-readable description of the user's scan access.
 */
export function getScanAccessLabel(
  userDoc: UserProfileDoc | null,
  isPremium: boolean,
): string {
  if (isPremium) return 'Unlimited scans';
  const remaining = getFreeScanRemaining(userDoc);
  if (remaining === 1) return '1 free scan available';
  return 'Free scan used — upgrade to scan more';
}
