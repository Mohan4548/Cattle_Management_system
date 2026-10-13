/**
 * FarmEase – QR Scanner Service
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Resolves any QR code payload to cattle information.
 * Supports:
 * - FarmEase Public URLs: /farm/cattle/{slug}
 * - Direct Cattle Detail URLs: /cattle/{id}
 * - Digital Identity IDs: CAT-2026-000001
 * - Ear Tag IDs: FE-GIR-001, FE-HF-002, etc.
 * - Cattle IDs: cattle-1, cattle-2, etc.
 * - JSON encoded cattle payloads
 */

import { apiClient } from '../../../api/client';
import type { QRResolveResult, ScannedCattleInfo, ScanError } from '../types/index';

/**
 * Parse raw QR payload string and extract the most relevant identifier.
 * Extremely tolerant of URLs, full links, JSON tags, and raw codes.
 */
export function extractSlug(rawPayload: string): string | null {
  if (!rawPayload || typeof rawPayload !== 'string') return null;
  let text = rawPayload.trim();

  // 1. JSON payload check
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('%7B') && text.endsWith('%7D'))) {
    try {
      const decoded = text.startsWith('%7B') ? decodeURIComponent(text) : text;
      const parsed = JSON.parse(decoded);
      if (parsed.public_profile_slug) return String(parsed.public_profile_slug).trim().toLowerCase();
      if (parsed.slug) return String(parsed.slug).trim().toLowerCase();
      if (parsed.digital_identity_id) return String(parsed.digital_identity_id).trim().toLowerCase();
      if (parsed.cattle_id) return String(parsed.cattle_id).trim().toLowerCase();
      if (parsed.tag_id || parsed.tag_number || parsed.tag) return String(parsed.tag_id || parsed.tag_number || parsed.tag).trim().toLowerCase();
      if (parsed.id) return String(parsed.id).trim().toLowerCase();
    } catch {
      // not JSON, fallback to regex
    }
  }

  // 2. Strip surrounding quotes if present
  text = text.replace(/^["']|["']$/g, '');

  // 3. /farm/cattle/:slug (with or without domain, query params, trailing slash)
  const farmCattleMatch = text.match(/(?:^|\/)farm\/cattle\/([a-zA-Z0-9_-]+)/i);
  if (farmCattleMatch) {
    return farmCattleMatch[1].toLowerCase();
  }

  // 4. /cattle/:id
  const cattleRouteMatch = text.match(/(?:^|\/)cattle\/([a-zA-Z0-9_-]+)/i);
  if (cattleRouteMatch) {
    return cattleRouteMatch[1].toLowerCase();
  }

  // 5. Digital Identity format: CAT-2026-XXXXXX
  const digitalIdMatch = text.match(/\b(CAT-\d{4}-\d{6})\b/i);
  if (digitalIdMatch) {
    return digitalIdMatch[1].toLowerCase();
  }

  // 6. Ear Tag format: FE-XXX-NNN
  const earTagMatch = text.match(/\b(FE-[A-Z0-9]+-\d+)\b/i);
  if (earTagMatch) {
    return earTagMatch[1].toLowerCase();
  }

  // 7. Query parameters: ?tag=... or ?id=... or ?slug=...
  const queryMatch = text.match(/[?&](?:slug|cattle_id|tag_id|tag|id)=([a-zA-Z0-9_-]+)/i);
  if (queryMatch) {
    return queryMatch[1].toLowerCase();
  }

  // 8. Cattle ID pattern: cattle-1, cattle-2, etc.
  const cattleIdMatch = text.match(/\b(cattle-[a-zA-Z0-9_-]+)\b/i);
  if (cattleIdMatch) {
    return cattleIdMatch[1].toLowerCase();
  }

  // 9. Raw alphanumeric slug or tag token (length 2 to 64)
  if (/^[a-zA-Z0-9_-]{2,64}$/.test(text)) {
    return text.toLowerCase();
  }

  return null;
}

/**
 * Convert a public_profile_slug back to a Digital Identity ID format.
 * cat-2026-000001 → CAT-2026-000001
 */
function slugToDigitalId(slug: string): string {
  return slug.toUpperCase();
}

/**
 * Resolve a raw QR code payload to ScannedCattleInfo.
 * Tries the digital identity endpoint first, then falls back to direct cattle records.
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
        message: 'Unrecognized QR Code',
        detail: `The scanned QR code is not recognized as a FarmEase livestock identifier: "${rawPayload?.slice(0, 60)}"`,
      },
    };
  }

  // 3. Resolve via safe unified resolver (returns 200 with { found: boolean }, zero console errors)
  try {
    const res = await apiClient.get('/identity/resolve', {
      params: { code: slug }
    });

    if (res.data?.found && res.data?.data) {
      const data = res.data.data;
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
        public_profile_slug: data.public_profile_slug ?? slug,
        qr_status: data.qr_status ?? 'active',
      };
      return { success: true, cattle: info };
    }
  } catch (err: any) {
    const status = err?.response?.status;
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
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_CATTLE',
      message: 'Cattle Record Not Found',
      detail: `No active cattle record was found matching code "${slug}".`,
    },
  };
}
