/**
 * FarmEase – Digital Identity API Service
 * Phase 1: QR Digital Identity Foundation
 *
 * Thin API wrapper around the backend /identity/* routes.
 * All calls go through the shared apiClient (handles auth headers automatically).
 */

import { apiClient } from '../../../api/client';
import type {
  DigitalIdentity,
  DigitalIdentityValidationResult,
  IdentityMigrationReport,
  AllIdentitiesResponse,
} from '../types/index';

// ─────────────────────────────────────────────────────────────────────────────
// GET: Retrieve identity for a specific cattle
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchIdentityByCattleId(cattleId: string): Promise<DigitalIdentity> {
  const res = await apiClient.get<DigitalIdentity>(`/identity/${cattleId}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Retrieve all identities (admin view)
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAllIdentities(): Promise<AllIdentitiesResponse> {
  const res = await apiClient.get<AllIdentitiesResponse>('/identity/all');
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Create / ensure a Digital Identity (idempotent)
// ─────────────────────────────────────────────────────────────────────────────
export async function createOrEnsureIdentity(cattleId: string): Promise<DigitalIdentity> {
  const res = await apiClient.post<DigitalIdentity>(`/identity/${cattleId}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT: Update identity metadata (e.g., qr_status)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateIdentity(
  cattleId: string,
  payload: { qr_status?: 'pending' | 'active' | 'inactive' }
): Promise<DigitalIdentity> {
  const res = await apiClient.put<DigitalIdentity>(`/identity/${cattleId}`, payload);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Validate a Digital Identity ID string
// ─────────────────────────────────────────────────────────────────────────────
export async function validateIdentityId(
  digitalIdentityId: string
): Promise<DigitalIdentityValidationResult> {
  const res = await apiClient.get<DigitalIdentityValidationResult>(
    `/identity/validate/${encodeURIComponent(digitalIdentityId)}`
  );
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Regenerate identity (resets timestamps, keeps permanent Digital ID)
// ─────────────────────────────────────────────────────────────────────────────
export async function regenerateIdentity(cattleId: string): Promise<DigitalIdentity> {
  const res = await apiClient.post<DigitalIdentity>(`/identity/${cattleId}/regenerate`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Admin bulk migration — ensure all cattle have Digital Identities
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateAllIdentities(): Promise<IdentityMigrationReport> {
  const res = await apiClient.post<IdentityMigrationReport>('/identity/migrate');
  return res.data;
}
