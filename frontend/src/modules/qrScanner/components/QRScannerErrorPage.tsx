/**
 * FarmEase – QRScannerErrorPage Component
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Professional error display for all scanner failure states.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  WifiOff,
  QrCode,
  Camera,
  CameraOff,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import type { ScanError, ScanErrorCode } from '../types/index';

interface QRScannerErrorPageProps {
  error: ScanError;
  onRetry: () => void;
  onCancel: () => void;
}

const ERROR_CONFIG: Record<ScanErrorCode, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  retryLabel: string;
  instructions: string[];
}> = {
  INVALID_QR: {
    icon: <QrCode className="w-10 h-10" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    retryLabel: 'Scan Again',
    instructions: [
      'Make sure you are scanning a FarmEase cattle QR code',
      'The QR code should be on the cattle ear tag or profile card',
      'Ensure the QR code is clean and undamaged',
    ],
  },
  UNKNOWN_CATTLE: {
    icon: <AlertTriangle className="w-10 h-10" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    retryLabel: 'Scan Another',
    instructions: [
      'The scanned QR code is not registered in this system',
      'The cattle record may have been deleted',
      'Contact your farm administrator for assistance',
    ],
  },
  INACTIVE_QR: {
    icon: <ShieldAlert className="w-10 h-10" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    retryLabel: 'Scan Another',
    instructions: [
      'This QR code is currently inactive',
      'Contact your administrator to reactivate it',
      'You may need a new QR code for this cattle',
    ],
  },
  CAMERA_DENIED: {
    icon: <CameraOff className="w-10 h-10" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    retryLabel: 'Try Again',
    instructions: [
      'Click the camera icon (🔒) in your browser address bar',
      'Select "Allow" for camera permissions',
      'Refresh the page if the permission does not update',
      'On mobile: Settings → Browser → Camera → Allow',
    ],
  },
  NO_CAMERA: {
    icon: <Camera className="w-10 h-10" />,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    retryLabel: 'Try Again',
    instructions: [
      'Ensure your device has a working camera',
      'Check if another application is using the camera',
      'Try connecting an external webcam',
      'Restart your browser and try again',
    ],
  },
  BROWSER_UNSUPPORTED: {
    icon: <Globe className="w-10 h-10" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    retryLabel: 'Try Again',
    instructions: [
      'Use Google Chrome, Safari, Firefox, or Microsoft Edge',
      'Ensure your browser is up to date',
      'Camera access requires HTTPS (secure connection)',
    ],
  },
  OFFLINE: {
    icon: <WifiOff className="w-10 h-10" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    retryLabel: 'Retry Connection',
    instructions: [
      'Check your Wi-Fi or mobile data connection',
      'Move to an area with better signal',
      'Try turning your connection off and on again',
    ],
  },
  CORRUPTED: {
    icon: <QrCode className="w-10 h-10" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    retryLabel: 'Scan Again',
    instructions: [
      'The QR code may be damaged or partially obscured',
      'Clean the QR code surface',
      'Try scanning from a different angle or distance',
    ],
  },
  SERVER_ERROR: {
    icon: <AlertTriangle className="w-10 h-10" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    retryLabel: 'Try Again',
    instructions: [
      'The server encountered an unexpected error',
      'Please try again in a moment',
      'Contact support if the problem persists',
    ],
  },
};

export const QRScannerErrorPage: React.FC<QRScannerErrorPageProps> = ({ error, onRetry, onCancel }) => {
  const config = ERROR_CONFIG[error.code] ?? ERROR_CONFIG.SERVER_ERROR;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 text-center"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className={`w-20 h-20 rounded-3xl ${config.bg} border-2 ${config.border} flex items-center justify-center mb-5 ${config.color}`}
      >
        {config.icon}
      </motion.div>

      {/* Error Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2 mb-6"
      >
        <h2 className="text-xl font-black text-slate-900 dark:text-white">{error.message}</h2>
        {error.detail && (
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            {error.detail}
          </p>
        )}
      </motion.div>

      {/* Instructions */}
      {config.instructions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`w-full max-w-sm p-4 rounded-2xl ${config.bg} border ${config.border} text-left mb-6`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            How to fix this:
          </p>
          <ul className="space-y-2">
            {config.instructions.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className={`w-5 h-5 rounded-full ${config.bg} border ${config.border} flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${config.color} mt-0.5`}>
                  {idx + 1}
                </span>
                {inst}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-3 w-full max-w-sm"
      >
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/30"
        >
          <RefreshCw className="w-4 h-4" />
          {config.retryLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};
