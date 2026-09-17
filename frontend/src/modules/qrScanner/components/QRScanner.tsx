/**
 * FarmEase – QRScanner Component
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Full-featured camera QR scanner UI:
 * - Real camera viewfinder (html5-qrcode)
 * - Animated corner brackets + scanning line
 * - Flashlight toggle, camera switch
 * - Permission & error states
 * - Framer Motion animations
 * - Dark mode support
 */

import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { useQRScanner, QR_SCANNER_ELEMENT_ID } from '../hooks/useQRScanner';
import { QRScannerErrorPage } from './QRScannerErrorPage';
import { CattleQuickCard } from './CattleQuickCard';

interface QRScannerProps {
  onClose?: () => void;
  /** If true, renders as an embedded widget (no close button) */
  embedded?: boolean;
}

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
  } = useQRScanner();

  // Auto-start on mount
  useEffect(() => {
    // Small delay so the DOM element is rendered before scanner init
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

  const otherCameras = cameras.filter(c => c.id !== activeCameraId);

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">

      {/* === Top Bar === */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white leading-none">Smart QR Scanner</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {scanState === 'active'   ? 'Point camera at cattle QR code' :
               scanState === 'requesting' ? 'Requesting camera access…' :
               scanState === 'processing' ? 'Reading QR code…' :
               scanState === 'success'  ? 'QR detected!' :
               scanState === 'error'    ? 'Scan failed' : 'Initializing…'}
            </p>
          </div>
        </div>
        {!embedded && (
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* === Main Scanner Area === */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Camera viewport — html5-qrcode mounts its <video> element here */}
        <div
          id={QR_SCANNER_ELEMENT_ID}
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ background: '#0a0a0a' }}
        />

        {/* === Scanning Overlay (shown only when active) === */}
        <AnimatePresence>
          {scanState === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              {/* Dark vignette mask */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(
                    ellipse 280px 280px at 50% 45%,
                    transparent 40%,
                    rgba(0,0,0,0.75) 100%
                  )`,
                }}
              />

              {/* Scan frame */}
              <div className="relative w-64 h-64">
                {/* Corner brackets */}
                {[
                  'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
                ].map((cls, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    className={`absolute w-8 h-8 border-emerald-400 ${cls}`}
                  />
                ))}

                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-2 rounded-full shadow-lg"
                  style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }}
                  animate={{ top: ['8%', '88%', '8%'] }}
                  transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
                />

                {/* Center crosshair dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-emerald-400 opacity-60"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Hint text */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center">
                <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm">
                  <p className="text-xs text-slate-300 text-center">
                    Align QR code within the frame
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
                className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mb-4"
              />
              <p className="text-sm font-bold text-white">
                {scanState === 'idle' ? 'Preparing Camera…' : 'Requesting Permission…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Please allow camera access when prompted</p>
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
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/90"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mb-4"
              >
                <QrCode className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <p className="text-sm font-bold text-white">QR Code Detected!</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Resolving cattle profile…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Success State (brief flash before quick card) === */}
        <AnimatePresence>
          {scanState === 'success' && !scannedCattle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-emerald-950/90"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
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

      {/* === Bottom Controls (shown only when active) === */}
      <AnimatePresence>
        {scanState === 'active' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-20 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between"
          >
            {/* Flash toggle */}
            <button
              onClick={toggleFlash}
              disabled={!hasFlash}
              title={hasFlash ? (flashOn ? 'Turn off flash' : 'Turn on flash') : 'Flash not available'}
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
                className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Scanning</span>
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

      {/* === Retry bar on error (compact) === */}
      <AnimatePresence>
        {scanState === 'error' && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="relative z-20 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-center gap-3"
          >
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            {!embedded && (
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 font-bold text-xs transition-all"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Quick Info Card Popup === */}
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
