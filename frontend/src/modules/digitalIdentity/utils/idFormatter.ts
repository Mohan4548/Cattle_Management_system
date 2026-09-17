/**
 * FarmEase – Digital Identity Utilities
 * Phase 1: QR Digital Identity Foundation
 */

const DIGITAL_ID_REGEX = /^CAT-\d{4}-\d{6}$/;

// ─────────────────────────────────────────────────────────────────────────────
// ID Formatting & Validation
// ─────────────────────────────────────────────────────────────────────────────

/** Validate the format of a Digital Identity ID */
export function isValidDigitalId(id: string): boolean {
  return DIGITAL_ID_REGEX.test(id);
}

/** Format a Digital Identity ID for display (already formatted) */
export function formatDigitalId(id: string): string {
  return id?.toUpperCase() ?? 'N/A';
}

/** Convert a Digital Identity ID to a public profile slug */
export function toPublicSlug(digitalIdentityId: string): string {
  return digitalIdentityId?.toLowerCase() ?? '';
}

// ─────────────────────────────────────────────────────────────────────────────
// URL Builders
// ─────────────────────────────────────────────────────────────────────────────

/** Build the public profile URL for display */
export function buildPublicProfileUrl(slug: string): string {
  return `/farm/cattle/${slug}`;
}

/** Build the full absolute public profile URL */
export function buildAbsoluteProfileUrl(slug: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/farm/cattle/${slug}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Format an ISO timestamp to a human-readable date */
export function formatIdentityDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Not set';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/** Format an ISO timestamp to a short date */
export function formatShortDate(isoString: string | null | undefined): string {
  if (!isoString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy to Clipboard
// ─────────────────────────────────────────────────────────────────────────────

/** Copy a string to clipboard, returns true on success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
