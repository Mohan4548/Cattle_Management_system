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
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-icon"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-[var(--accent-green)]" />
              QR Scanner
            </h1>
            <p className="page-subtitle">
              Scan a cattle QR code to instantly open its digital profile
            </p>
          </div>
        </div>

        {/* Device support badges */}
        <div className="hidden sm:flex items-center gap-2">
          {[
            { icon: <Monitor className="w-3 h-3" />, label: 'Desktop' },
            { icon: <Tablet className="w-3 h-3" />,  label: 'Tablet' },
            { icon: <Smartphone className="w-3 h-3" />, label: 'Mobile' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="badge-pill badge-green"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scanner + Info Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Scanner Panel (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl overflow-hidden border border-[var(--border-card)] shadow-[var(--shadow-md)]"
            style={{ height: '520px' }}
          >
            <QRScanner onClose={() => navigate(-1)} embedded />
          </div>
        </div>

        {/* Help Sidebar */}
        <div className="space-y-4">

          {/* Instructions */}
          <div className="card-premium p-5">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <div className="icon-box icon-box-green w-7 h-7">
                <ScanLine className="w-3.5 h-3.5" />
              </div>
              How to Scan
            </h3>
            <ol className="space-y-3">
              {[
                'Allow camera access when prompted by your browser',
                'Hold the cattle QR code tag in front of your camera',
                'Align it within the green scanning frame',
                'The profile opens automatically after detection!',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-green-subtle)] border border-[var(--accent-green)]/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[var(--accent-green-dark)]">
                    {i + 1}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div className="card-premium p-5">
            <h3 className="section-title flex items-center gap-2 mb-3">
              <div className="icon-box icon-box-amber w-7 h-7">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              Scanning Tips
            </h3>
            <ul className="space-y-2">
              {[
                'Keep the QR code steady and well-lit',
                'Distance of 10–25 cm works best',
                'Clean the QR code tag if dirty',
                'Use the flash button in low light',
                'Switch camera for front/rear toggle',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-green)] mt-0.5 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Info note */}
          <div className="p-4 rounded-xl bg-[var(--accent-sky-subtle)] border border-[var(--accent-sky)]/20">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-[var(--accent-sky)]" />
              <p className="text-[11px] font-bold text-[var(--accent-sky)]">FarmEase QR Codes</p>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              This scanner works with all QR codes generated by FarmEase. Each QR code encodes a unique cattle digital identity.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
