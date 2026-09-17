/**
 * FarmEase – QR Scanner Service
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Resolves a raw QR code payload to cattle information.
 * Phase 2 QR codes encode:  /farm/cattle/{public_profile_slug}
 * e.g.                       /farm/cattle/cat-2026-000001
 */

import { apiClient } from '../../../api/client';
import type { QRResolveResult, ScannedCattleInfo, ScanError } from '../types/index';

/** Expected QR payload pattern — only match FarmEase cattle QRs */
const FARMEASE_QR_PATTERN = /^(?:https?:\/\/[^/]+)?\/farm\/cattle\/([a-z0-9-]+)$/i;

/**
 * Parse the raw QR payload string and extract the public_profile_slug.
 * Returns null if the payload is not a valid FarmEase cattle QR.
 */
function extractSlug(rawPayload: string): string | null {
  const trimmed = rawPayload?.trim();
  if (!trimmed) return null;

  const match = trimmed.match(FARMEASE_QR_PATTERN);
  if (!match) return null;

  return match[1].toLowerCase();
}

/**
 * Convert a public_profile_slug back to a Digital Identity ID format.
 * cat-2026-000001 → CAT-2026-000001
 */
function slugToDigitalId(slug: string): string {
  return slug.toUpperCase();
}

/**
 * Resolve a raw QR code payload to a ScannedCattleInfo.
 * This is the primary function called when a QR code is detected.
 */
export async function resolveQRPayload(rawPayload: string): Promise<QRResolveResult> {
  // 1. Check network
  if (!navigator.onLine) {
    return {
      success: false,
      error: {
        code: 'OFFLINE',
        message: 'No Internet Connection',
        detail: 'Please check your connection and try again.',
      },
    };
  }

  // 2. Parse payload
  const slug = extractSlug(rawPayload);
  if (!slug) {
    return {
      success: false,
      error: {
        code: 'INVALID_QR',
        message: 'Invalid QR Code',
        detail: `This QR code is not a FarmEase cattle identifier. Scanned: "${rawPayload?.slice(0, 80)}"`,
      },
    };
  }

  // 3. Resolve slug via API
  try {
    const res = await apiClient.get(`/identity/slug/${encodeURIComponent(slug)}`);
    const data = res.data;

    if (!data?.cattle_id) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_CATTLE',
          message: 'Cattle Not Found',
          detail: `No cattle record matches this QR code (slug: ${slug}).`,
        },
      };
    }

    const info: ScannedCattleInfo = {
      cattle_id: data.cattle_id,
      cattle_name: data.cattle_name ?? 'Unknown',
      cattle_tag: data.cattle_tag ?? 'N/A',
      breed: data.breed ?? 'Unknown',
      age: data.age,
      health_status: data.health_status ?? 'healthy',
      lactation_stage: data.lactation_stage ?? 'mid',
      image_url: data.image_url ?? '',
      digital_identity_id: data.digital_identity_id ?? slugToDigitalId(slug),
      public_profile_slug: slug,
      qr_status: data.qr_status ?? 'active',
    };

    return { success: true, cattle: info };

  } catch (err: any) {
    const status = err?.response?.status;

    if (status === 404) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_CATTLE',
          message: 'Cattle Record Not Found',
          detail: 'This QR code references a cattle that no longer exists in the system.',
        },
      };
    }

    if (status === 401 || status === 403) {
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Access Denied',
          detail: 'You do not have permission to view this cattle profile.',
        },
      };
    }

    if (!navigator.onLine) {
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'No Internet Connection',
          detail: 'Please check your connection and try again.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server Error',
        detail: err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.',
      },
    };
  }
}
