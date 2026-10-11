/**
 * FarmEase – QRScanner Component
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Full-featured high-definition camera QR scanner UI:
 * - Crystal clear camera feed without foggy vignettes or dimming
 * - Hardware-accelerated BarcodeDetector with instant detection
 * - High-tech reticle with animated corners and scanning beam
 * - Manual tag / cattle ID lookup fallback for testing & field flexibility
 * - Flashlight toggle and camera switch
 * - Modern dark glassmorphism SaaS aesthetic
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Zap,
  ZapOff,
  FlipHorizontal2,
  Camera,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Search,
  Tag,
} from 'lucide-react';
import { useQRScanner, QR_SCANNER_ELEMENT_ID } from '../hooks/useQRScanner';
import { QRScannerErrorPage } from './QRScannerErrorPage';
import { CattleQuickCard } from './CattleQuickCard';

interface QRScannerProps {
  onClose?: () => void;
  /** If true, renders as an embedded widget (no close button) */
  embedded?: boolean;
}

const SAMPLE_TAGS = [
  { tag: 'FE-GIR-001', name: 'Kamadhenu' },
  { tag: 'FE-HF-002', name: 'Lakshmi' },
  { tag: 'FE-JER-003', name: 'Gowri' },
  { tag: 'FE-SAH-004', name: 'Daisy' },
];

export const QRScanner: React.FC<QRScannerProps> = ({ onClose, embedded = false }) => {
  const {
    scanState,
    error,
    scannedCattle,
    hasFlash,
    flashOn,
    cameras,
    activeCameraId,
    startScanner,
    stopScanner,
    resetScanner,
    toggleFlash,
    switchCamera,
    resolveManualCode,
  } = useQRScanner();

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => startScanner(), 200);
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    resetScanner();
    setTimeout(() => startScanner(), 150);
  };

  const handleClose = () => {
    stopScanner();
    onClose?.();
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!manualCode.trim()) return;
    setShowManualInput(false);
    resolveManualCode(manualCode.trim());
  };

  const handleQuickTagClick = (tag: string) => {
    setShowManualInput(false);
    resolveManualCode(tag);
  };

  const otherCameras = cameras.filter(c => c.id !== activeCameraId);

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">

      {/* === Top Bar === */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 backdrop-blur-md z-20 relative shrink-0 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <Scan className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white leading-none">Smart QR Scanner</h2>
            <p className="text-[10px] text-slate-400 mt-1">
              {scanState === 'active'   ? 'Point camera at cattle QR tag' :
               scanState === 'requesting' ? 'Requesting camera access…' :
               scanState === 'processing' ? 'Reading QR code…' :
               scanState === 'success'  ? 'QR detected!' :
               scanState === 'error'    ? 'Scan failed' : 'Initializing…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Tag Lookup Toggle */}
          <button
            onClick={() => setShowManualInput(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all active:scale-95"
            title="Enter tag or test manually"
          >
            <Tag className="w-3 h-3" />
            <span>Manual Tag</span>
          </button>

          {!embedded && (
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* === Manual Tag Input Drawer / Overlay === */}
      <AnimatePresence>
        {showManualInput && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-0 right-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md p-4 shadow-2xl"
          >
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Enter Cattle Tag or ID</span>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. FE-GIR-001 or cat-2026-000001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Lookup
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400">Quick Test:</span>
                {SAMPLE_TAGS.map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleQuickTagClick(item.tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 text-[11px] font-mono text-slate-200 hover:text-blue-300 transition-all"
                  >
                    {item.tag} ({item.name})
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Main Scanner Area === */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden">
        {/* Camera viewport — mounts high-definition clean video stream */}
        <div
          id={QR_SCANNER_ELEMENT_ID}
          className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center"
          style={{ background: '#020617' }}
        />

        {/* === Scanning Overlay (shown only when active, crystal-clear with NO dark vignette) === */}
        <AnimatePresence>
          {scanState === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            >
              {/* Scan frame — sleek clean viewfinder reticle */}
              <div className="relative w-72 h-72 pointer-events-none shrink-0">
                {/* 4 Corner brackets with subtle glow */}
                {[
                  'top-0 left-0 border-t-[3.5px] border-l-[3.5px] rounded-tl-2xl',
                  'top-0 right-0 border-t-[3.5px] border-r-[3.5px] rounded-tr-2xl',
                  'bottom-0 left-0 border-b-[3.5px] border-l-[3.5px] rounded-bl-2xl',
                  'bottom-0 right-0 border-b-[3.5px] border-r-[3.5px] rounded-br-2xl',
                ].map((cls, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    className={`absolute w-10 h-10 border-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] ${cls}`}
                  />
                ))}

                {/* Smooth laser scanning bar */}
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"
                  style={{ boxShadow: '0 0 12px rgba(96, 165, 250, 0.95), 0 0 4px rgba(255, 255, 255, 0.8)' }}
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
                />

                {/* Subtle center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-blue-400/70"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Status pill badge */}
              <div className="mt-5 flex justify-center pointer-events-none">
                <div className="px-4 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/70 backdrop-blur-md shadow-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-200 text-center tracking-wide">
                    Hold QR code within camera view
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Requesting / Loading State === */}
        <AnimatePresence>
          {(scanState === 'idle' || scanState === 'requesting') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-4"
              />
              <p className="text-sm font-bold text-white">
                {scanState === 'idle' ? 'Preparing Camera…' : 'Requesting Camera Access…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Please allow camera permissions if prompted</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Processing State === */}
        <AnimatePresence>
          {scanState === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/90 backdrop-blur-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-16 h-16 rounded-3xl bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mb-4"
              >
                <QrCode className="w-8 h-8 text-blue-400" />
              </motion.div>
              <p className="text-sm font-bold text-white">QR Code Detected!</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                Resolving cattle digital passport…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Success State === */}
        <AnimatePresence>
          {scanState === 'success' && !scannedCattle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/95"
            >
              <CheckCircle2 className="w-16 h-16 text-blue-400" />
              <p className="text-sm font-bold text-white mt-3">Profile Found!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Error State === */}
        <AnimatePresence>
          {scanState === 'error' && error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-slate-950 overflow-y-auto"
            >
              <QRScannerErrorPage
                error={error}
                onRetry={handleRetry}
                onCancel={handleClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === Bottom Controls Bar === */}
      <AnimatePresence>
        {scanState === 'active' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-20 bg-slate-950/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shrink-0 border-t border-slate-800/80"
          >
            {/* Flash toggle */}
            <button
              onClick={toggleFlash}
              disabled={!hasFlash}
              title={hasFlash ? (flashOn ? 'Turn off flash' : 'Turn on flash') : 'Flash not available on this device'}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95
                ${hasFlash
                  ? flashOn
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
                  : 'opacity-30 cursor-not-allowed bg-white/5 border border-white/10 text-slate-500'
                }
              `}
            >
              {flashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              <span className="text-[9px] font-bold">{flashOn ? 'Flash On' : 'Flash'}</span>
            </button>

            {/* Center indicator */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Scanner</span>
            </div>

            {/* Camera switch */}
            <button
              onClick={() => otherCameras[0] && switchCamera(otherCameras[0].id)}
              disabled={otherCameras.length === 0}
              title={otherCameras.length > 0 ? 'Switch camera' : 'Only one camera available'}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95
                ${otherCameras.length > 0
                  ? 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
                  : 'opacity-30 cursor-not-allowed bg-white/5 border border-white/10 text-slate-500'
                }
              `}
            >
              <FlipHorizontal2 className="w-5 h-5" />
              <span className="text-[9px] font-bold">Switch</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Quick Info Card Popup on scan success === */}
      <AnimatePresence>
        {scanState === 'success' && scannedCattle && (
          <CattleQuickCard
            cattle={scannedCattle}
            onClose={() => {
              resetScanner();
              onClose?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
