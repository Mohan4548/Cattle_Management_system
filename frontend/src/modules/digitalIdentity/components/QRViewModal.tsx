/**
 * FarmEase – QRViewModal Component
 * Phase 2: Automatic QR Code Generation
 *
 * Full-screen QR view modal with:
 * - Large QR code display (high resolution)
 * - Download PNG button
 * - Download SVG button
 * - Copy secure profile link button
 * - Identity metadata (Digital ID, version, generated date)
 * - Dark mode support
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Link2,
  Calendar,
  Hash,
  Shield,
  Loader2,
  QrCode,
} from 'lucide-react';
import { useQRCode } from '../hooks/useQRCode';
import { buildAbsoluteProfileUrl } from '../utils/idFormatter';
import { copyToClipboard } from '../utils/idFormatter';
import type { DigitalIdentity } from '../types/index';

interface QRViewModalProps {
  identity: DigitalIdentity;
  cattleName?: string;
  onClose: () => void;
}

export const QRViewModal: React.FC<QRViewModalProps> = ({
  identity,
  cattleName,
  onClose,
}) => {
  const { qrDataUrl, qrSvgString, isGenerating, error, downloadPNG, downloadSVG } =
    useQRCode(identity);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const profileUrl = buildAbsoluteProfileUrl(identity.public_profile_slug);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`QR Code for ${cattleName || identity.digital_identity_id}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                QR Code
              </h2>
              {cattleName && (
                <p className="text-[10px] text-slate-400">{cattleName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center px-6 py-8 gap-4">
          {isGenerating ? (
            <div className="w-56 h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="w-56 h-56 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center gap-3">
              <QrCode className="w-10 h-10 text-rose-400" />
              <p className="text-xs text-rose-400 text-center px-4">{error}</p>
            </div>
          ) : qrDataUrl ? (
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-100 dark:border-slate-700 shadow-inner">
              <img
                src={qrDataUrl}
                alt={`QR Code for ${identity.digital_identity_id}`}
                className="w-56 h-56 object-contain rounded-xl"
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-56 h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-300" />
            </div>
          )}

          {/* Digital ID label */}
          <div className="text-center">
            <code className="text-sm font-mono font-extrabold text-emerald-500 tracking-widest">
              {identity.digital_identity_id}
            </code>
            <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                v{identity.qr_version || 1}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {identity.last_qr_generated
                  ? new Date(identity.last_qr_generated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Pending'}
              </span>
              <span className={`flex items-center gap-1 font-bold ${identity.qr_generated ? 'text-emerald-500' : 'text-amber-500'}`}>
                <Shield className="w-3 h-3" />
                {identity.qr_status}
              </span>
            </div>
          </div>

          {/* Secure URL */}
          <div className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
            <Link2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="flex-1 font-mono text-indigo-500 dark:text-indigo-400 truncate text-[11px]">
              {identity.qr_payload || `/farm/cattle/${identity.public_profile_slug}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => downloadPNG()}
            disabled={!qrDataUrl || isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>

          <button
            onClick={() => downloadSVG()}
            disabled={!qrSvgString || isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </button>

          <button
            onClick={() => handleCopy(profileUrl, 'url')}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-500/20"
          >
            {copiedField === 'url' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Secure Profile Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
