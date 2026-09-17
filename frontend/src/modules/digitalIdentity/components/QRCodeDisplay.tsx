/**
 * FarmEase – QRCodeDisplay Component
 * Phase 2: Automatic QR Code Generation
 *
 * Reusable component that renders a real, scannable QR code image.
 * Uses the useQRCode hook which generates via the `qrcode` npm library.
 * Supports multiple sizes, dark mode, and loading/error states.
 */

import React from 'react';
import { QrCode, Loader2, AlertCircle } from 'lucide-react';
import { useQRCode } from '../hooks/useQRCode';
import type { DigitalIdentity } from '../types/index';

interface QRCodeDisplayProps {
  identity: DigitalIdentity | null | undefined;
  size?: number;
  className?: string;
  /** Show the digital identity ID label below the QR */
  showLabel?: boolean;
  /** Show a subtle border/card wrapper */
  card?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  identity,
  size = 160,
  className = '',
  showLabel = false,
  card = true,
}) => {
  const { qrDataUrl, isGenerating, error } = useQRCode(identity);

  const containerClass = card
    ? `flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`
    : `flex flex-col items-center justify-center ${className}`;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isGenerating || (!qrDataUrl && !error && identity)) {
    return (
      <div className={containerClass} style={{ width: size + 24, height: size + 24 }}>
        <div
          className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900"
          style={{ width: size, height: size }}
        >
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        {showLabel && (
          <span className="text-[10px] font-mono text-slate-400 mt-2">Generating QR…</span>
        )}
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={containerClass} style={{ width: size + 24, height: size + 24 }}>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl bg-rose-500/5 border border-rose-500/20"
          style={{ width: size, height: size }}
        >
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <p className="text-[10px] text-rose-400 text-center px-2">QR Error</p>
        </div>
        {showLabel && identity && (
          <span className="text-[10px] font-mono text-slate-400 mt-2">
            {identity.digital_identity_id}
          </span>
        )}
      </div>
    );
  }

  // ─── No identity ──────────────────────────────────────────────────────────
  if (!identity || !qrDataUrl) {
    return (
      <div className={containerClass} style={{ width: size + 24, height: size + 24 }}>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900"
          style={{ width: size, height: size }}
        >
          <QrCode className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <p className="text-[10px] text-slate-400 text-center px-2">No QR</p>
        </div>
      </div>
    );
  }

  // ─── QR Image ─────────────────────────────────────────────────────────────
  return (
    <div className={containerClass}>
      <img
        src={qrDataUrl}
        alt={`QR Code for ${identity.digital_identity_id}`}
        style={{ width: size, height: size }}
        className="rounded-xl object-contain"
        draggable={false}
      />
      {showLabel && (
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-2 tracking-wider">
          {identity.digital_identity_id}
        </span>
      )}
    </div>
  );
};
