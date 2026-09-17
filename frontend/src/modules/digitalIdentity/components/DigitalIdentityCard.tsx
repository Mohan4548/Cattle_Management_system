/**
 * FarmEase – DigitalIdentityCard Component
 * Phase 1: QR Digital Identity Foundation
 * Phase 2: Automatic QR Code Generation (Phase 2 teaser REPLACED with real QR)
 *
 * Displays a cattle's full Digital Identity including:
 * - Digital Identity ID (permanent, CAT-YYYY-NNNNNN format)
 * - Public Profile URL (secure slug)
 * - [Phase 2] Real QR Code image (generated via qrcode library)
 * - [Phase 2] QR download buttons (PNG, SVG)
 * - [Phase 2] Copy Secure Profile Link
 * - [Phase 2] Admin: Regenerate QR (increments version)
 * - QR status badge and metadata timestamps
 */

import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  Clock,
  QrCode,
  ExternalLink,
  Shield,
  AlertCircle,
  Loader2,
  Download,
  Maximize2,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDigitalIdentity } from '../hooks/useDigitalIdentity';
import { useQRCode } from '../hooks/useQRCode';
import { IdentityStatusBadge } from './IdentityStatusBadge';
import { QRViewModal } from './QRViewModal';
import {
  formatShortDate,
  buildPublicProfileUrl,
  buildAbsoluteProfileUrl,
  copyToClipboard,
} from '../utils/idFormatter';
import type { Cattle } from '../../../types';

interface DigitalIdentityCardProps {
  cattle: Cattle;
}

export const DigitalIdentityCard: React.FC<DigitalIdentityCardProps> = ({ cattle }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    identity,
    loading,
    error,
    fetchIdentity,
    ensureIdentity,
    regenerateIdentity,
  } = useDigitalIdentity(cattle.id, { autoFetch: true });

  // Phase 2: QR code rendering
  const {
    qrDataUrl,
    isGenerating: isRenderingQR,
    downloadPNG,
    downloadSVG,
    triggerGenerate,
    triggerRegenerate,
  } = useQRCode(identity);

  // UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [ensuring, setEnsuring] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Auto-generate QR if identity exists but QR hasn't been generated yet
  useEffect(() => {
    if (identity && !identity.qr_generated && !generatingQR && !loading) {
      setGeneratingQR(true);
      triggerGenerate().then(() => setGeneratingQR(false));
    }
  }, [identity?.id, identity?.qr_generated]);

  const handleCopy = async (value: string, field: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleEnsureIdentity = async () => {
    setEnsuring(true);
    await ensureIdentity();
    setEnsuring(false);
  };

  const handleRegenerateIdentity = async () => {
    if (!window.confirm(
      `Regenerate the Digital Identity metadata for ${cattle.name}?\n\n` +
      `Note: The Digital Identity ID "${identity?.digital_identity_id}" is permanent and will NOT change. ` +
      `Only the timestamps and QR status will be reset.`
    )) return;
    setRegenerating(true);
    await regenerateIdentity();
    setRegenerating(false);
  };

  const handleRegenerateQR = async () => {
    if (!window.confirm(
      `Regenerate the QR Code for ${cattle.name}?\n\n` +
      `The Digital ID "${identity?.digital_identity_id}" and the QR payload URL remain unchanged.\n` +
      `Only the QR version number increments.\n\n` +
      `This is safe — existing printed QR codes continue to work.`
    )) return;
    setGeneratingQR(true);
    await triggerRegenerate();
    setGeneratingQR(false);
  };

  // Pull identity info — prefer API response, fall back to cattle object fields
  const digitalId = identity?.digital_identity_id ?? cattle.digital_identity_id;
  const slug = identity?.public_profile_slug ?? cattle.public_profile_slug;
  const qrStatus = identity?.qr_status ?? cattle.qr_status;
  const createdAt = identity?.qr_created_at ?? cattle.qr_created_at;
  const updatedAt = identity?.qr_updated_at ?? cattle.qr_updated_at;
  const profileUrl = slug ? buildPublicProfileUrl(slug) : null;
  const profileAbsUrl = slug ? buildAbsoluteProfileUrl(slug) : null;
  const qrVersion = identity?.qr_version ?? 0;
  const lastGenerated = identity?.last_qr_generated ?? null;

  const hasIdentity = !!(digitalId && slug);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading && !hasIdentity) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading Digital Identity…</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error && !hasIdentity) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Identity Error</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchIdentity}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  // ─── No Identity Yet ──────────────────────────────────────────────────────
  if (!hasIdentity) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Fingerprint className="w-7 h-7 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">No Digital Identity Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            This cattle doesn't have a Digital Identity. Click below to assign one permanently.
          </p>
        </div>
        {(isAdmin || user?.role === 'farmer') && (
          <button
            onClick={handleEnsureIdentity}
            disabled={ensuring}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60"
          >
            {ensuring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            {ensuring ? 'Assigning Identity…' : 'Assign Digital Identity'}
          </button>
        )}
      </div>
    );
  }

  // ─── Main Card ────────────────────────────────────────────────────────────
  return (
    <>
      {/* QR View Modal */}
      {showQRModal && identity && (
        <QRViewModal
          identity={identity}
          cattleName={cattle.name}
          onClose={() => setShowQRModal(false)}
        />
      )}

      <div className="space-y-5 pt-2">

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-indigo-500" />
            Digital Identity
          </h3>
          <IdentityStatusBadge status={qrStatus} size="md" />
        </div>

        {/* Primary Identity Card */}
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 dark:border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/5">
          {/* Decorative top accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          <div className="p-5 space-y-4">
            {/* Digital Identity ID */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
                <Shield className="w-3 h-3" /> Digital Identity ID
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-base font-extrabold tracking-[0.12em] border border-white/5 shadow-inner select-all">
                  {digitalId}
                </code>
                <button
                  onClick={() => handleCopy(digitalId!, 'id')}
                  title="Copy Identity ID"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-500 border border-slate-200 dark:border-slate-800 transition-all"
                >
                  {copiedField === 'id'
                    ? <Check className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

            {/* Public Profile URL */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Public Profile URL
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 min-w-0">
                  <span className="text-xs text-slate-400 shrink-0 font-medium">
                    {typeof window !== 'undefined' ? window.location.origin : ''}
                  </span>
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 truncate">
                    {profileUrl}
                  </span>
                </div>
                <button
                  onClick={() => profileAbsUrl && handleCopy(profileAbsUrl, 'url')}
                  title="Copy URL"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-500/10 hover:text-indigo-500 text-slate-500 border border-slate-200 dark:border-slate-800 transition-all shrink-0"
                >
                  {copiedField === 'url'
                    ? <Check className="w-4 h-4 text-indigo-500" />
                    : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={profileUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Public Profile (Phase 3)"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800 transition-all shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Phase 2: QR Code Section ─────────────────────────────────────── */}
        <div className="relative rounded-2xl border border-emerald-500/20 dark:border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/5 overflow-hidden">
          {/* Top accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          <div className="p-5">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-500" />
                QR Code
              </h4>
              {identity?.qr_generated && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Hash className="w-3 h-3" />
                  v{qrVersion}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {/* QR Image */}
              <div className="shrink-0">
                {(isRenderingQR || generatingQR) ? (
                  <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : qrDataUrl ? (
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setShowQRModal(true)}
                    title="Click to view full size"
                  >
                    <div className="w-28 h-28 rounded-2xl bg-white border-2 border-slate-100 dark:border-slate-700 shadow-inner overflow-hidden">
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${digitalId}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>

              {/* QR Info & Actions */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="font-medium">Generated:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {lastGenerated ? formatShortDate(lastGenerated) : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="font-medium">Updated:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatShortDate(updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {/* View QR */}
                  <button
                    onClick={() => setShowQRModal(true)}
                    disabled={!qrDataUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold transition-colors border border-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Maximize2 className="w-3 h-3" /> View QR
                  </button>

                  {/* Download PNG */}
                  <button
                    onClick={() => downloadPNG()}
                    disabled={!qrDataUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" /> PNG
                  </button>

                  {/* Download SVG */}
                  <button
                    onClick={() => downloadSVG()}
                    disabled={!qrDataUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" /> SVG
                  </button>

                  {/* Copy link */}
                  <button
                    onClick={() => profileAbsUrl && handleCopy(profileAbsUrl, 'qr-link')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold transition-colors border border-indigo-500/20"
                  >
                    {copiedField === 'qr-link'
                      ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                      : <><Copy className="w-3 h-3" /> Copy Link</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Created Date */}
          <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-500" /> Created
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {formatShortDate(createdAt)}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {createdAt ? new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>

          {/* Last Updated */}
          <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-500" /> Last Updated
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {formatShortDate(updatedAt)}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {updatedAt ? new Date(updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* Regenerate QR (Phase 2) */}
            <button
              onClick={handleRegenerateQR}
              disabled={generatingQR || isRenderingQR}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-bold transition-all disabled:opacity-50"
            >
              {(generatingQR || isRenderingQR)
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              {(generatingQR || isRenderingQR) ? 'Regenerating…' : 'Regenerate QR'}
            </button>

            {/* Regenerate Identity Metadata (Phase 1) */}
            <button
              onClick={handleRegenerateIdentity}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              {regenerating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              {regenerating ? 'Regenerating…' : 'Reset Identity Metadata'}
            </button>

            <div className="text-[10px] text-slate-400 italic w-full mt-0.5">
              The Digital ID <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{digitalId}</span> is permanent and never changes.
            </div>
          </div>
        )}
      </div>
    </>
  );
};
