/**
 * FarmEase – Digital Identity Controller
 * Phase 1: QR Digital Identity Foundation
 * Phase 2: Automatic QR Code Generation
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Endpoints:
 *   GET  /identity/all                        → Admin: all identities
 *   GET  /identity/validate/:id               → Validate a Digital Identity ID
 *   GET  /identity/slug/:slug                 → [Phase 3] Resolve a public_profile_slug to identity
 *   GET  /identity/:cattleId                  → Get identity for a cattle
 *   POST /identity/:cattleId                  → Create/ensure identity (idempotent)
 *   PUT  /identity/:cattleId                  → Update identity metadata
 *   POST /identity/:cattleId/regenerate       → Regenerate (reset timestamps, keep ID)
 *   POST /identity/migrate                    → Admin: bulk migrate all cattle
 *
 *   [Phase 2]
 *   POST /identity/:cattleId/qr               → Generate QR for a cattle (idempotent)
 *   POST /identity/:cattleId/qr/regenerate    → Admin: regenerate QR (increments version)
 *   POST /identity/qr/bulk-generate           → Admin: bulk generate all missing QRs
 */

import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { digitalIdentityService } from '../services/digitalIdentityService.js';
import { DIGITAL_ID_REGEX } from '../services/digitalIdentityIdGenerator.js';
import { QRStatus } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /identity/all — Admin: retrieve all digital identities
// ─────────────────────────────────────────────────────────────────────────────
export const getAllIdentities = async (_req: Request, res: Response) => {
  try {
    const identities = digitalIdentityService.getAllIdentities();

    // Enrich with cattle display names for admin convenience
    const enriched = identities.map(identity => {
      const cattle = store.cattle.find((c: any) => c.id === identity.cattle_id);
      return {
        ...identity,
        cattle_name: cattle?.name ?? 'Unknown',
        cattle_tag: cattle?.tag_id ?? cattle?.tag_number ?? 'N/A',
        breed: cattle?.breed ?? 'N/A',
        public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
      };
    });

    return res.json({
      data: enriched,
      total: enriched.length,
      summary: {
        pending: enriched.filter(i => i.qr_status === 'pending').length,
        active: enriched.filter(i => i.qr_status === 'active').length,
        inactive: enriched.filter(i => i.qr_status === 'inactive').length,
        qr_generated: enriched.filter(i => i.qr_generated).length,
        qr_missing: enriched.filter(i => !i.qr_generated).length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve digital identities', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /identity/validate/:digitalIdentityId — Validate an ID string
// ─────────────────────────────────────────────────────────────────────────────
export const validateIdentity = async (req: Request, res: Response) => {
  const { digitalIdentityId } = req.params;

  if (!digitalIdentityId) {
    return res.status(400).json({ valid: false, errors: ['digitalIdentityId parameter is required'] });
  }

  try {
    const result = digitalIdentityService.validateIdentityId(digitalIdentityId, store.cattle);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ valid: false, errors: [err.message] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /identity/slug/:slug — [Phase 3] Resolve a public_profile_slug to identity
// Used by the QR Scanner to look up a cattle from a scanned QR code payload.
// The QR payload format is: /farm/cattle/{slug}  e.g. /farm/cattle/cat-2026-000001
// ─────────────────────────────────────────────────────────────────────────────
export const getIdentityBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: 'slug parameter is required' });
  }

  try {
    const identity = digitalIdentityService.getIdentityBySlug(slug.toLowerCase());
    if (!identity) {
      return res.status(404).json({
        message: `No Digital Identity found for slug "${slug}". The QR code may be invalid or the cattle may have been removed.`,
        slug,
      });
    }

    // Enrich with cattle details for the Quick Info Card
    const cattle = store.cattle.find((c: any) => c.id === identity.cattle_id);
    if (!cattle) {
      return res.status(404).json({
        message: `Digital Identity found but corresponding cattle record no longer exists.`,
        slug,
      });
    }

    return res.json({
      ...identity,
      cattle_id: cattle.id,
      cattle_name: cattle.name,
      cattle_tag: cattle.tag_id ?? cattle.tag_number,
      breed: cattle.breed,
      age: cattle.age,
      health_status: cattle.health_status,
      lactation_stage: cattle.lactation_stage,
      image_url: cattle.image_url,
      public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
      qr_payload_preview: digitalIdentityService.getQRPayloadPreview(identity),
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to resolve slug', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /identity/:cattleId — Get the Digital Identity for a specific cattle
// ─────────────────────────────────────────────────────────────────────────────
export const getIdentityByCattleId = async (req: Request, res: Response) => {
  const { cattleId } = req.params;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  const identity = digitalIdentityService.getIdentityByCattleId(cattle.id);
  if (!identity) {
    return res.status(404).json({
      message: `No Digital Identity found for cattle "${cattle.name}" (${cattle.id}). ` +
               `Call POST /identity/${cattleId} to create one.`,
    });
  }

  return res.json({
    ...identity,
    cattle_name: cattle.name,
    cattle_tag: cattle.tag_id ?? cattle.tag_number,
    breed: cattle.breed,
    public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
    qr_payload_preview: digitalIdentityService.getQRPayloadPreview(identity),
    // Phase 2 — fully populated
    qr_code_url: identity.qr_image_path ? `/qr-codes/${identity.digital_identity_id}.png` : null,
    qr_code_data: identity.qr_payload,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /identity/:cattleId — Create/ensure identity (idempotent)
// ─────────────────────────────────────────────────────────────────────────────
export const createOrEnsureIdentity = async (req: Request, res: Response) => {
  const { cattleId } = req.params;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  try {
    const identity = digitalIdentityService.ensureIdentityForCattle(cattle);
    // Sync store digitalIdentities array
    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.status(201).json({
      ...identity,
      cattle_name: cattle.name,
      cattle_tag: cattle.tag_id ?? cattle.tag_number,
      public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
      qr_payload_preview: digitalIdentityService.getQRPayloadPreview(identity),
      message: `Digital Identity ensured for ${cattle.name}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create Digital Identity', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /identity/:cattleId — Update identity metadata (qr_status etc.)
// ─────────────────────────────────────────────────────────────────────────────
export const updateIdentity = async (req: AuthenticatedRequest, res: Response) => {
  const { cattleId } = req.params;
  const { qr_status } = req.body;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  // Validate qr_status if provided
  if (qr_status && !['pending', 'active', 'inactive'].includes(qr_status)) {
    return res.status(400).json({
      message: `Invalid qr_status "${qr_status}". Must be one of: pending, active, inactive`,
    });
  }

  try {
    let identity = digitalIdentityService.getIdentityByCattleId(cattle.id);
    if (!identity) {
      return res.status(404).json({
        message: `No Digital Identity found for cattle "${cattle.name}". Create one first.`,
      });
    }

    if (qr_status) {
      identity = digitalIdentityService.updateQRStatus(cattle.id, qr_status as QRStatus, store.cattle) ?? identity;
    }

    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.json({
      ...identity,
      cattle_name: cattle.name,
      public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
      message: 'Digital Identity updated successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update Digital Identity', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /identity/:cattleId/regenerate — Regenerate identity (resets metadata, KEEPS ID)
// ─────────────────────────────────────────────────────────────────────────────
export const regenerateIdentity = async (req: AuthenticatedRequest, res: Response) => {
  const { cattleId } = req.params;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  try {
    const identity = digitalIdentityService.regenerateIdentity(cattle.id, store.cattle);
    if (!identity) {
      return res.status(404).json({
        message: `No Digital Identity found for cattle "${cattle.name}". Create one first.`,
      });
    }

    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.json({
      ...identity,
      cattle_name: cattle.name,
      public_profile_url: `/farm/cattle/${identity.public_profile_slug}`,
      message: `Digital Identity regenerated for ${cattle.name}. The Digital ID "${identity.digital_identity_id}" is permanent and unchanged.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to regenerate Digital Identity', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /identity/migrate — Admin: bulk migrate all cattle
// ─────────────────────────────────────────────────────────────────────────────
export const migrateAllIdentities = async (_req: Request, res: Response) => {
  try {
    const report = digitalIdentityService.migrateAllCattle(store.cattle);
    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.json({
      success: true,
      ...report,
      message: `Migration complete. ${report.migrated} cattle received new Digital Identities. ${report.skipped} already had identities.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Migration failed', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [Phase 2] POST /identity/:cattleId/qr — Generate QR for a cattle (idempotent)
// ─────────────────────────────────────────────────────────────────────────────
export const generateQR = async (req: AuthenticatedRequest, res: Response) => {
  const { cattleId } = req.params;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  try {
    // Ensure identity exists first
    const identity = digitalIdentityService.ensureIdentityForCattle(cattle);

    // Generate QR metadata (idempotent)
    const updated = digitalIdentityService.generateQR(cattle.id, store.cattle);
    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.status(201).json({
      ...(updated ?? identity),
      cattle_name: cattle.name,
      cattle_tag: cattle.tag_id ?? cattle.tag_number,
      public_profile_url: `/farm/cattle/${(updated ?? identity).public_profile_slug}`,
      qr_payload_preview: digitalIdentityService.getQRPayloadPreview(updated ?? identity),
      message: `QR Code generated for ${cattle.name}. Version: ${(updated ?? identity).qr_version}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to generate QR Code', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [Phase 2] POST /identity/:cattleId/qr/regenerate — Admin: regenerate QR (increments version)
// ─────────────────────────────────────────────────────────────────────────────
export const regenerateQR = async (req: AuthenticatedRequest, res: Response) => {
  const { cattleId } = req.params;

  const cattle = store.cattle.find((c: any) => c.id === cattleId || c.tag_id === cattleId);
  if (!cattle) {
    return res.status(404).json({ message: `Cattle with id "${cattleId}" not found` });
  }

  try {
    let identity = digitalIdentityService.getIdentityByCattleId(cattle.id);
    if (!identity) {
      // Auto-create identity if missing
      identity = digitalIdentityService.ensureIdentityForCattle(cattle);
    }

    const updated = digitalIdentityService.regenerateQR(cattle.id, store.cattle);
    if (!updated) {
      return res.status(500).json({ message: 'Failed to regenerate QR: identity disappeared' });
    }

    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.json({
      ...updated,
      cattle_name: cattle.name,
      cattle_tag: cattle.tag_id ?? cattle.tag_number,
      public_profile_url: `/farm/cattle/${updated.public_profile_slug}`,
      qr_payload_preview: digitalIdentityService.getQRPayloadPreview(updated),
      message: `QR Code regenerated for ${cattle.name}. New version: ${updated.qr_version}. The Digital ID "${updated.digital_identity_id}" and QR payload are unchanged.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to regenerate QR Code', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// [Phase 2] POST /identity/qr/bulk-generate — Admin: bulk generate all missing QRs
// ─────────────────────────────────────────────────────────────────────────────
export const bulkGenerateQR = async (_req: Request, res: Response) => {
  try {
    const report = digitalIdentityService.bulkGenerateMissingQR(store.cattle);
    store.digitalIdentities = digitalIdentityService.getAllIdentities();

    return res.json({
      success: true,
      ...report,
      message: `Bulk QR generation complete. Generated: ${report.generated}. Skipped (already had QR): ${report.skipped}. Errors: ${report.errors.length}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Bulk QR generation failed', error: err.message });
  }
};
