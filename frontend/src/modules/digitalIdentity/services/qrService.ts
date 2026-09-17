/**
 * FarmEase – QR Code API Service
 * Phase 2: Automatic QR Code Generation
 *
 * API wrappers for the Phase 2 QR endpoints.
 * All Phase 1 identity calls remain in services/index.ts.
 */

import { apiClient } from '../../../api/client';
import type { QRGenerationResult, BulkQRReport } from '../types/index';

// ─────────────────────────────────────────────────────────────────────────────
// POST: Generate QR for a cattle (idempotent — safe to call multiple times)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateQRForCattle(cattleId: string): Promise<QRGenerationResult> {
  const res = await apiClient.post<QRGenerationResult>(`/identity/${cattleId}/qr`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Admin — regenerate QR (increments version, same payload URL)
// ─────────────────────────────────────────────────────────────────────────────
export async function regenerateQRForCattle(cattleId: string): Promise<QRGenerationResult> {
  const res = await apiClient.post<QRGenerationResult>(`/identity/${cattleId}/qr/regenerate`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Admin — bulk generate QR codes for all cattle missing QRs
// ─────────────────────────────────────────────────────────────────────────────
export async function bulkGenerateQR(): Promise<BulkQRReport> {
  const res = await apiClient.post<BulkQRReport>('/identity/qr/bulk-generate');
  return res.data;
}
