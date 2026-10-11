/**
 * FarmEase – QRScannerPage
 * Smart QR Scanner & Digital Profile Access
 * Full-page QR Scanner wrapped in the DashboardLayout.
 * Accessible via /qr-scanner route.
 * UI redesigned — functionality fully preserved.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ScanLine, Smartphone, Monitor, Tablet, Info, Lightbulb } from 'lucide-react';
import { QRScanner } from '../modules/qrScanner/components/QRScanner';

export const QRScannerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-blue-500" />
              QR Scanner
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scan a cattle QR code tag to instantly open its digital passport & history
            </p>
          </div>
        </div>

        {/* Device support badges */}
        <div className="hidden sm:flex items-center gap-2">
          {[
            { icon: <Monitor className="w-3.5 h-3.5 text-blue-500" />, label: 'Desktop' },
            { icon: <Tablet className="w-3.5 h-3.5 text-blue-500" />,  label: 'Tablet' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-blue-500" />, label: 'Mobile' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-sm"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scanner + Info Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Scanner Panel */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <div
            className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl relative w-full"
            style={{ height: '540px' }}
          >
            <QRScanner onClose={() => navigate(-1)} embedded />
          </div>
        </div>

        {/* Help Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 flex flex-col justify-between">

          {/* Instructions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <ScanLine className="w-3.5 h-3.5" />
              </div>
              How to Scan
            </h3>
            <ol className="space-y-3">
              {[
                'Allow camera access when prompted by your browser',
                'Hold the cattle QR code tag in front of your camera',
                'Align it within the scanning reticle frame',
                'The digital cattle profile opens automatically!',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-blue-500 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              Scanning Tips
            </h3>
            <ul className="space-y-2">
              {[
                'Keep the QR code steady and well-lit',
                'Distance of 10–25 cm works best',
                'Clean the QR code ear tag if dusty or stained',
                'Use the flash toggle in low-light barns',
                'Switch camera to toggle between front and rear lenses',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-blue-500 mt-0.5 shrink-0 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Info note */}
          <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">FarmEase Digital QR Codes</p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              This scanner works with all QR codes generated by FarmEase. Each code encodes a cryptographic permanent livestock identity with lineage, pedigree, and health ledger.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
