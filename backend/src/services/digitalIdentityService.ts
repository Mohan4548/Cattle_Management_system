/**
 * FarmEase – Digital Identity Service
 * Phase 1: QR Digital Identity Foundation
 * Phase 2: Automatic QR Code Generation
 *
 * Central service responsible for:
 *  - Generating unique Digital Identity IDs (CAT-YYYY-NNNNNN)
 *  - Generating URL-safe public profile slugs
 *  - Checking for duplicate identity records
 *  - Validating identity IDs
 *  - Idempotent identity creation (safe to call multiple times)
 *  - Bulk migration of existing cattle (no duplicates, no data loss)
 *  - Identity lookup by cattle ID
 *  - Identity regeneration (resets timestamps only, ID is permanent)
 *  - [Phase 2] QR Code generation metadata management
 *  - [Phase 2] Bulk QR generation for existing cattle
 *  - [Phase 2] QR regeneration (admin only, increments version)
 *
 * Phase 3 hooks: getPublicProfileData()
 * Phase 4 hooks: getPrintableCardData()
 */

import { Cattle, DigitalIdentity, DigitalIdentityValidationResult, QRStatus } from '../types/index.js';
import { idGenerator, DIGITAL_ID_REGEX } from './digitalIdentityIdGenerator.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Convert a digital_identity_id to a URL-safe public slug.
 * CAT-2026-000001 → cat-2026-000001
 */
function toPublicSlug(digitalIdentityId: string): string {
  return digitalIdentityId.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generate a stable internal record ID for the identity record itself.
 */
function generateRecordId(cattleId: string): string {
  return `did-${cattleId}`;
}

/**
 * Build the QR payload URL that will be encoded in the QR code.
 * This is the only content encoded — no PII, just the stable profile slug.
 */
function buildQRPayload(slug: string): string {
  return `/farm/cattle/${slug}`;
}

/**
 * Build the logical image path for a QR code image.
 */
function buildImagePath(digitalIdentityId: string): string {
  return `qr-codes/${digitalIdentityId}.png`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DigitalIdentityService
// ─────────────────────────────────────────────────────────────────────────────

export class DigitalIdentityService {
  private static instance: DigitalIdentityService;
  /** In-memory store for digital identity records */
  private identities: Map<string, DigitalIdentity> = new Map(); // keyed by cattle_id

  private constructor() {}

  static getInstance(): DigitalIdentityService {
    if (!DigitalIdentityService.instance) {
      DigitalIdentityService.instance = new DigitalIdentityService();
    }
    return DigitalIdentityService.instance;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Boot-time initialization: sync the ID generator counter from any
   * existing identities already on the cattle records.
   * Must be called before any ID generation.
   */
  initialize(cattle: Cattle[]): void {
    // Gather all pre-existing digital_identity_ids
    const existingIds = cattle
      .filter(c => !!c.digital_identity_id)
      .map(c => c.digital_identity_id!);

    // Also gather from internal identity records (if store reloaded)
    for (const [, identity] of this.identities) {
      existingIds.push(identity.digital_identity_id);
    }

    // Sync the generator counter to avoid any collisions
    idGenerator.syncFromExisting(existingIds);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CORE OPERATIONS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Idempotently ensure a cattle record has a Digital Identity.
   * If one already exists → returns it untouched.
   * If missing → generates a new one and attaches it to the cattle object.
   *
   * This is the primary method to call for single cattle.
   */
  ensureIdentityForCattle(cattle: Cattle): DigitalIdentity {
    // Return existing identity if already set
    if (this.identities.has(cattle.id)) {
      return this.identities.get(cattle.id)!;
    }

    // Also check if the cattle object already has an identity_id assigned
    if (cattle.digital_identity_id && DIGITAL_ID_REGEX.test(cattle.digital_identity_id)) {
      const slug = cattle.public_profile_slug || toPublicSlug(cattle.digital_identity_id);
      const existingIdentity: DigitalIdentity = {
        id: generateRecordId(cattle.id),
        cattle_id: cattle.id,
        digital_identity_id: cattle.digital_identity_id,
        public_profile_slug: slug,
        qr_status: cattle.qr_status || 'pending',
        qr_created_at: cattle.qr_created_at || nowISO(),
        qr_updated_at: cattle.qr_updated_at || nowISO(),
        last_qr_generated: cattle.last_qr_generated || null,
        created_at: cattle.created_at || nowISO(),
        // Phase 2 fields
        qr_generated: false,
        qr_version: 0,
        qr_payload: buildQRPayload(slug),
        qr_image_path: null,
        qr_storage_location: 'browser',
      };
      this.identities.set(cattle.id, existingIdentity);
      return existingIdentity;
    }

    // Generate a new identity
    return this.createIdentityForCattle(cattle);
  }

  /**
   * Create a brand-new Digital Identity for a cattle record.
   * Mutates the cattle object in place (adds identity fields).
   */
  private createIdentityForCattle(cattle: Cattle): DigitalIdentity {
    const year = new Date().getFullYear();
    const digital_identity_id = idGenerator.next(year);
    const public_profile_slug = toPublicSlug(digital_identity_id);
    const now = nowISO();

    const identity: DigitalIdentity = {
      id: generateRecordId(cattle.id),
      cattle_id: cattle.id,
      digital_identity_id,
      public_profile_slug,
      qr_status: 'pending',
      qr_created_at: now,
      qr_updated_at: now,
      last_qr_generated: null,
      created_at: now,
      // Phase 2 fields
      qr_generated: false,
      qr_version: 0,
      qr_payload: buildQRPayload(public_profile_slug),
      qr_image_path: null,
      qr_storage_location: 'browser',
    };

    // Attach identity fields to the cattle object (mutate in place)
    cattle.digital_identity_id = digital_identity_id;
    cattle.public_profile_slug = public_profile_slug;
    cattle.qr_status = 'pending';
    cattle.qr_created_at = now;
    cattle.qr_updated_at = now;
    cattle.last_qr_generated = null;

    this.identities.set(cattle.id, identity);
    return identity;
  }

  /**
   * Bulk migration: ensure every cattle in the array has a Digital Identity.
   * Idempotent — skips cattle that already have a valid identity.
   * Returns a summary report.
   */
  migrateAllCattle(cattle: Cattle[]): {
    total: number;
    migrated: number;
    skipped: number;
    errors: string[];
  } {
    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const cow of cattle) {
      try {
        const alreadyHad = !!cow.digital_identity_id && DIGITAL_ID_REGEX.test(cow.digital_identity_id);
        this.ensureIdentityForCattle(cow);
        if (alreadyHad) {
          skipped++;
        } else {
          migrated++;
        }
      } catch (err: any) {
        errors.push(`${cow.id} (${cow.name}): ${err.message}`);
      }
    }

    return { total: cattle.length, migrated, skipped, errors };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: QR CODE GENERATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Mark a cattle's QR code as generated.
   * Sets qr_generated=true, qr_status='active', sets last_qr_generated,
   * increments qr_version (from 0 to 1 on first generation),
   * and sets the logical qr_image_path.
   *
   * Idempotent — safe to call multiple times (will not duplicate).
   * Returns null if no identity exists for the cattle.
   */
  generateQR(cattleId: string, cattle: Cattle[]): DigitalIdentity | null {
    const identity = this.identities.get(cattleId);
    if (!identity) return null;

    // Already generated? Return as-is (idempotent)
    if (identity.qr_generated && identity.qr_status === 'active') {
      return identity;
    }

    const now = nowISO();
    identity.qr_generated = true;
    identity.qr_status = 'active';
    identity.last_qr_generated = now;
    identity.qr_updated_at = now;
    // First generation: version goes from 0 to 1
    if (identity.qr_version === 0) {
      identity.qr_version = 1;
    }
    identity.qr_image_path = buildImagePath(identity.digital_identity_id);
    identity.qr_storage_location = 'browser';

    // Sync back to cattle object
    const cow = cattle.find(c => c.id === cattleId);
    if (cow) {
      cow.qr_status = 'active';
      cow.last_qr_generated = now;
      cow.qr_updated_at = now;
    }

    this.identities.set(cattleId, identity);
    return identity;
  }

  /**
   * Admin-only QR regeneration.
   * Increments qr_version, resets last_qr_generated.
   * The Digital Identity ID and QR payload URL never change.
   * Returns null if no identity exists.
   */
  regenerateQR(cattleId: string, cattle: Cattle[]): DigitalIdentity | null {
    const identity = this.identities.get(cattleId);
    if (!identity) return null;

    const now = nowISO();
    identity.qr_version += 1;
    identity.last_qr_generated = now;
    identity.qr_updated_at = now;
    identity.qr_generated = true;
    identity.qr_status = 'active';
    identity.qr_image_path = buildImagePath(identity.digital_identity_id);
    identity.qr_storage_location = 'browser';

    // Sync to cattle object
    const cow = cattle.find(c => c.id === cattleId);
    if (cow) {
      cow.qr_status = 'active';
      cow.qr_updated_at = now;
      cow.last_qr_generated = now;
    }

    this.identities.set(cattleId, identity);
    return identity;
  }

  /**
   * Bulk generate QR metadata for all cattle that don't yet have a QR.
   * Skips cattle that already have qr_generated=true.
   * Returns a detailed report.
   */
  bulkGenerateMissingQR(cattle: Cattle[]): {
    total: number;
    generated: number;
    skipped: number;
    errors: string[];
  } {
    // First ensure all cattle have a digital identity
    this.migrateAllCattle(cattle);

    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const cow of cattle) {
      const identity = this.identities.get(cow.id);
      if (!identity) {
        errors.push(`${cow.id} (${cow.name}): No identity found after migration`);
        continue;
      }

      try {
        if (identity.qr_generated && identity.qr_status === 'active') {
          skipped++;
        } else {
          this.generateQR(cow.id, cattle);
          generated++;
        }
      } catch (err: any) {
        errors.push(`${cow.id} (${cow.name}): ${err.message}`);
      }
    }

    return { total: cattle.length, generated, skipped, errors };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LOOKUP
  // ──────────────────────────────────────────────────────────────────────────

  /** Get the Digital Identity record for a cattle ID */
  getIdentityByCattleId(cattleId: string): DigitalIdentity | null {
    return this.identities.get(cattleId) ?? null;
  }

  /** Get all Digital Identity records */
  getAllIdentities(): DigitalIdentity[] {
    return Array.from(this.identities.values());
  }

  /** Find cattle identity by its Digital Identity ID string (e.g. CAT-2026-000001) */
  getIdentityByDigitalId(digitalIdentityId: string): DigitalIdentity | null {
    for (const [, identity] of this.identities) {
      if (identity.digital_identity_id === digitalIdentityId) {
        return identity;
      }
    }
    return null;
  }

  /** Find cattle identity by its public profile slug */
  getIdentityBySlug(slug: string): DigitalIdentity | null {
    for (const [, identity] of this.identities) {
      if (identity.public_profile_slug === slug) {
        return identity;
      }
    }
    return null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Validate a Digital Identity ID string.
   * Checks format and optionally checks for existence in the store.
   */
  validateIdentityId(
    digitalIdentityId: string,
    cattle: Cattle[]
  ): DigitalIdentityValidationResult {
    const errors: string[] = [];

    // Format check
    if (!DIGITAL_ID_REGEX.test(digitalIdentityId)) {
      errors.push(
        `Invalid format. Expected CAT-YYYY-NNNNNN (e.g. CAT-2026-000001), got: "${digitalIdentityId}"`
      );
    }

    if (errors.length > 0) {
      return { valid: false, digital_identity_id: digitalIdentityId, errors };
    }

    // Existence check
    const identity = this.getIdentityByDigitalId(digitalIdentityId);
    if (!identity) {
      errors.push(`Digital Identity ID "${digitalIdentityId}" does not exist in the system.`);
      return { valid: false, digital_identity_id: digitalIdentityId, errors };
    }

    // Cross-reference with cattle store
    const cow = cattle.find(c => c.id === identity.cattle_id);
    if (!cow) {
      errors.push(
        `Digital Identity "${digitalIdentityId}" references cattle_id "${identity.cattle_id}" which does not exist.`
      );
      return { valid: false, digital_identity_id: digitalIdentityId, errors };
    }

    return {
      valid: true,
      digital_identity_id: digitalIdentityId,
      cattle_id: cow.id,
      cattle_name: cow.name,
      cattle_tag: cow.tag_id || cow.tag_number,
      errors: [],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REGENERATION (Phase 1 — resets identity metadata, keeps Digital ID)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Regenerate an identity: resets timestamps but KEEPS the same Digital ID.
   * The Digital Identity ID is permanent and never changes once assigned.
   * This is intended for administrative corrections only.
   */
  regenerateIdentity(cattleId: string, cattle: Cattle[]): DigitalIdentity | null {
    const identity = this.identities.get(cattleId);
    if (!identity) return null;

    const now = nowISO();
    identity.qr_updated_at = now;
    identity.last_qr_generated = null;
    identity.qr_status = 'pending';
    identity.qr_generated = false;
    identity.qr_version = 0;

    // Sync back to cattle object
    const cow = cattle.find(c => c.id === cattleId);
    if (cow) {
      cow.qr_updated_at = now;
      cow.last_qr_generated = null;
      cow.qr_status = 'pending';
    }

    this.identities.set(cattleId, identity);
    return identity;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC URL HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /** Build the public profile URL for a cattle's Digital Identity */
  buildPublicProfileUrl(slug: string, baseUrl = ''): string {
    return `${baseUrl}/farm/cattle/${slug}`;
  }

  /**
   * Get the QR payload for a given identity.
   * This is the string that the QR code actually encodes.
   * Only the stable public slug is used — no PII.
   */
  getQRPayloadPreview(identity: DigitalIdentity, baseUrl = ''): string {
    return identity.qr_payload || this.buildPublicProfileUrl(identity.public_profile_slug, baseUrl);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STATUS MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────

  /** Update QR status (e.g., 'pending' → 'active') */
  updateQRStatus(cattleId: string, status: QRStatus, cattle: Cattle[]): DigitalIdentity | null {
    const identity = this.identities.get(cattleId);
    if (!identity) return null;

    const now = nowISO();
    identity.qr_status = status;
    identity.qr_updated_at = now;

    const cow = cattle.find(c => c.id === cattleId);
    if (cow) {
      cow.qr_status = status;
      cow.qr_updated_at = now;
    }

    this.identities.set(cattleId, identity);
    return identity;
  }
}

/** Shared singleton instance */
export const digitalIdentityService = DigitalIdentityService.getInstance();
