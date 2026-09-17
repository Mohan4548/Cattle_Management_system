/**
 * FarmEase – useQRCode React Hook
 * Phase 2: Automatic QR Code Generation
 *
 * Generates real, scannable QR codes in the browser using the `qrcode` library.
 * Encodes the cattle's secure profile URL (/farm/cattle/<slug>).
 *
 * Features:
 * - High-resolution PNG generation (Canvas → data URL)
 * - SVG string generation for scalable download
 * - Download helpers for PNG and SVG
 * - In-memory cache keyed by identity ID (avoids redundant re-generation)
 * - Dark mode aware rendering
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import type { DigitalIdentity } from '../types/index';
import {
  generateQRForCattle,
  regenerateQRForCattle,
} from '../services/qrService';

interface UseQRCodeReturn {
  /** PNG data URL (base64) — use as <img src={...} /> */
  qrDataUrl: string | null;
  /** SVG string — use for SVG download */
  qrSvgString: string | null;
  /** True while generating the QR image */
  isGenerating: boolean;
  /** Any error that occurred during generation */
  error: string | null;
  /** Download QR as high-res PNG */
  downloadPNG: (filename?: string) => void;
  /** Download QR as SVG */
  downloadSVG: (filename?: string) => void;
  /** Call backend to generate QR metadata, then refresh QR image */
  triggerGenerate: () => Promise<DigitalIdentity | null>;
  /** Admin: call backend to regenerate QR (increments version) */
  triggerRegenerate: () => Promise<DigitalIdentity | null>;
}

// Module-level cache: identityId → { dataUrl, svg }
const qrCache = new Map<string, { dataUrl: string; svg: string }>();

const QR_OPTIONS_PNG = {
  width: 512,
  margin: 2,
  color: { dark: '#0f172a', light: '#ffffff' },
  errorCorrectionLevel: 'H' as const,
};

const QR_OPTIONS_SVG = {
  margin: 2,
  color: { dark: '#0f172a', light: '#ffffff' },
  errorCorrectionLevel: 'H' as const,
};

export function useQRCode(
  identity: DigitalIdentity | null | undefined,
  options: { autoGenerate?: boolean } = {}
): UseQRCodeReturn {
  const { autoGenerate = true } = options;

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which identity we last rendered to avoid duplicate renders
  const lastRenderedId = useRef<string | null>(null);

  /** Render the QR image from the identity's payload URL */
  const renderQR = useCallback(async (ident: DigitalIdentity) => {
    const cacheKey = `${ident.id}-v${ident.qr_version}`;

    // Serve from cache if available
    if (qrCache.has(cacheKey)) {
      const cached = qrCache.get(cacheKey)!;
      setQrDataUrl(cached.dataUrl);
      setQrSvgString(cached.svg);
      lastRenderedId.current = cacheKey;
      return;
    }

    const payload = ident.qr_payload || ident.qr_payload_preview || `/farm/cattle/${ident.public_profile_slug}`;
    if (!payload) return;

    setIsGenerating(true);
    setError(null);

    try {
      const [dataUrl, svg] = await Promise.all([
        QRCode.toDataURL(payload, QR_OPTIONS_PNG),
        QRCode.toString(payload, { ...QR_OPTIONS_SVG, type: 'svg' }),
      ]);

      qrCache.set(cacheKey, { dataUrl, svg });
      setQrDataUrl(dataUrl);
      setQrSvgString(svg);
      lastRenderedId.current = cacheKey;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Auto-render when identity changes
  useEffect(() => {
    if (!identity) return;
    const cacheKey = `${identity.id}-v${identity.qr_version}`;
    if (lastRenderedId.current === cacheKey) return; // Already rendered this version
    renderQR(identity);
  }, [identity, renderQR]);

  // ─── Download helpers ──────────────────────────────────────────────────────

  const downloadPNG = useCallback((filename?: string) => {
    if (!qrDataUrl || !identity) return;
    const slug = identity.digital_identity_id || 'qr-code';
    const name = filename || `QR-${slug}.png`;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = name;
    a.click();
  }, [qrDataUrl, identity]);

  const downloadSVG = useCallback((filename?: string) => {
    if (!qrSvgString || !identity) return;
    const slug = identity.digital_identity_id || 'qr-code';
    const name = filename || `QR-${slug}.svg`;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [qrSvgString, identity]);

  // ─── Backend triggers ──────────────────────────────────────────────────────

  const triggerGenerate = useCallback(async (): Promise<DigitalIdentity | null> => {
    if (!identity?.cattle_id) return null;
    setIsGenerating(true);
    setError(null);
    try {
      const updated = await generateQRForCattle(identity.cattle_id);
      // Re-render with updated identity
      await renderQR(updated);
      return updated;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to generate QR');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [identity, renderQR]);

  const triggerRegenerate = useCallback(async (): Promise<DigitalIdentity | null> => {
    if (!identity?.cattle_id) return null;
    setIsGenerating(true);
    setError(null);
    try {
      const updated = await regenerateQRForCattle(identity.cattle_id);
      // Invalidate cache for this identity (new version)
      const oldKey = `${identity.id}-v${identity.qr_version}`;
      qrCache.delete(oldKey);
      await renderQR(updated);
      return updated;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to regenerate QR');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [identity, renderQR]);

  return {
    qrDataUrl,
    qrSvgString,
    isGenerating,
    error,
    downloadPNG,
    downloadSVG,
    triggerGenerate,
    triggerRegenerate,
  };
}
