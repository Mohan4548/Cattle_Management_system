/**
 * FarmEase – Digital Identity Module Types
 * Phase 1: QR Digital Identity Foundation
 * Phase 2: Automatic QR Code Generation
 */

export type QRStatus = 'pending' | 'active' | 'inactive';

export interface DigitalIdentity {
  id: string;
  cattle_id: string;
  digital_identity_id: string;       // e.g. CAT-2026-000001
  public_profile_slug: string;       // e.g. cat-2026-000001
  qr_status: QRStatus;
  qr_created_at: string;
  qr_updated_at: string;
  last_qr_generated: string | null;
  created_at: string;
  // Phase 2 QR fields
  qr_generated: boolean;
  qr_version: number;
  qr_payload: string;                // the URL encoded in the QR code
  qr_image_path: string | null;
  qr_storage_location: string;
  // Enriched fields from API
  cattle_name?: string;
  cattle_tag?: string;
  breed?: string;
  public_profile_url?: string;
  qr_payload_preview?: string;
  qr_code_url?: string | null;
  qr_code_data?: string | null;
}

export interface DigitalIdentityValidationResult {
  valid: boolean;
  digital_identity_id: string;
  cattle_id?: string;
  cattle_name?: string;
  cattle_tag?: string;
  errors: string[];
}

export interface IdentityMigrationReport {
  success: boolean;
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
  message: string;
}

export interface AllIdentitiesResponse {
  data: DigitalIdentity[];
  total: number;
  summary: {
    pending: number;
    active: number;
    inactive: number;
    qr_generated: number;
    qr_missing: number;
  };
}

/** Phase 2: QR generation result from POST /identity/:cattleId/qr */
export interface QRGenerationResult extends DigitalIdentity {
  message: string;
}

/** Phase 2: Bulk QR generation report */
export interface BulkQRReport {
  success: boolean;
  total: number;
  generated: number;
  skipped: number;
  errors: string[];
  message: string;
}
