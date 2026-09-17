/**
 * FarmEase – Digital Identity Client-side Validators
 * Phase 1: QR Digital Identity Foundation
 */

const DIGITAL_ID_REGEX = /^CAT-\d{4}-\d{6}$/;
const SLUG_REGEX = /^cat-\d{4}-\d{6}$/;

export interface ValidationError {
  field: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ID Validators
// ─────────────────────────────────────────────────────────────────────────────

/** Validate Digital Identity ID format */
export function validateDigitalIdentityId(id: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!id || id.trim() === '') {
    errors.push({ field: 'digital_identity_id', message: 'Digital Identity ID is required' });
    return errors;
  }

  if (!DIGITAL_ID_REGEX.test(id)) {
    errors.push({
      field: 'digital_identity_id',
      message: `Invalid format. Expected "CAT-YYYY-NNNNNN" (e.g. CAT-2026-000001), got "${id}"`,
    });
  }

  const parts = id.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[1], 10);
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > currentYear + 5) {
      errors.push({
        field: 'digital_identity_id',
        message: `Year ${year} is out of valid range (2020–${currentYear + 5})`,
      });
    }

    const seq = parseInt(parts[2], 10);
    if (seq <= 0) {
      errors.push({
        field: 'digital_identity_id',
        message: 'Sequence number must be greater than 0',
      });
    }
  }

  return errors;
}

/** Validate public profile slug format */
export function validatePublicSlug(slug: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!slug || slug.trim() === '') {
    errors.push({ field: 'public_profile_slug', message: 'Public profile slug is required' });
    return errors;
  }

  if (!SLUG_REGEX.test(slug)) {
    errors.push({
      field: 'public_profile_slug',
      message: `Invalid slug format. Expected "cat-yyyy-nnnnnn", got "${slug}"`,
    });
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cattle Status Validators (for identity eligibility)
// ─────────────────────────────────────────────────────────────────────────────

/** Check whether a cattle is eligible for a Digital Identity */
export function validateCattleEligibility(cattle: {
  id?: string;
  name?: string;
  health_status?: string;
  status?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!cattle.id) {
    errors.push({ field: 'cattle_id', message: 'Cattle ID is missing' });
  }

  if (!cattle.name) {
    errors.push({ field: 'cattle_name', message: 'Cattle name is missing' });
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// QR Status Validator
// ─────────────────────────────────────────────────────────────────────────────

const VALID_QR_STATUSES = ['pending', 'active', 'inactive'] as const;

export function validateQRStatus(status: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!VALID_QR_STATUSES.includes(status as any)) {
    errors.push({
      field: 'qr_status',
      message: `Invalid QR status "${status}". Must be one of: ${VALID_QR_STATUSES.join(', ')}`,
    });
  }
  return errors;
}

/** Helper: is the validation errors array empty? */
export function isValid(errors: ValidationError[]): boolean {
  return errors.length === 0;
}
