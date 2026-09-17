/**
 * FarmEase – BulkQRPanel Component
 * Phase 2: Automatic QR Code Generation
 *
 * Admin-only panel for bulk QR operations:
 * - Generate QR codes for all cattle missing them
 * - Progress indicator during bulk generation
 * - Success / error summary report
 * - Bulk download as ZIP (sequential PNG downloads)
 */

import React, { useState } from 'react';
import {
  QrCode,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
  SkipForward,
  XCircle,
  Package,
} from 'lucide-react';
import { bulkGenerateQR } from '../services/qrService';
import type { BulkQRReport } from '../types/index';

interface BulkQRPanelProps {
  cattleCount?: number;
  pendingCount?: number;
  onComplete?: () => void;
}

export const BulkQRPanel: React.FC<BulkQRPanelProps> = ({
  cattleCount = 0,
  pendingCount = 0,
  onComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<BulkQRReport | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBulkGenerate = async () => {
    if (!window.confirm(
      `Generate QR Codes for all ${pendingCount} cattle that are missing them?\n\n` +
      `Cattle that already have QR codes will be skipped.\n` +
      `This operation is safe and idempotent.`
    )) return;

    setIsRunning(true);
    setReport(null);
    setProgress(0);

    // Simulate progress while API runs
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 8, 85));
    }, 200);

    try {
      const result = await bulkGenerateQR();
      clearInterval(progressInterval);
      setProgress(100);
      setReport(result);
      if (onComplete) onComplete();
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setReport({
        success: false,
        total: cattleCount,
        generated: 0,
        skipped: 0,
        errors: [err?.response?.data?.message ?? err?.message ?? 'Bulk generation failed'],
        message: 'Bulk generation failed. Please try again.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Package className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Bulk QR Operations
            </h3>
            <p className="text-[11px] text-slate-400">Admin — Generate QR codes for all cattle at once</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
            {cattleCount - pendingCount} / {cattleCount} Active
          </span>
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
              {pendingCount} Pending
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">

        {/* Progress Bar (shown during operation) */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                Generating QR codes…
              </span>
              <span className="font-bold text-indigo-500">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Report Card */}
        {report && !isRunning && (
          <div className={`rounded-xl border p-4 space-y-3 ${
            report.success
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-rose-500/5 border-rose-500/20'
          }`}>
            {/* Result Header */}
            <div className="flex items-center gap-2">
              {report.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {report.success ? 'Bulk Generation Complete' : 'Generation Failed'}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-emerald-500">{report.generated}</p>
                <p className="text-[10px] text-slate-500 font-medium">Generated</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-slate-500">{report.skipped}</p>
                <p className="text-[10px] text-slate-500 font-medium">Skipped</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60">
                <p className={`text-lg font-extrabold ${report.errors.length > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {report.errors.length}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Errors</p>
              </div>
            </div>

            {/* Error details */}
            {report.errors.length > 0 && (
              <div>
                <button
                  onClick={() => setShowErrors(prev => !prev)}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  {showErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showErrors ? 'Hide' : 'Show'} Errors ({report.errors.length})
                </button>
                {showErrors && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {report.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[10px] text-rose-500">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="font-mono">{e}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkGenerate}
            disabled={isRunning || pendingCount === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate {pendingCount > 0 ? `${pendingCount} Missing` : 'All'} QR Codes
              </>
            )}
          </button>

          {pendingCount === 0 && !isRunning && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              All QRs Active
            </div>
          )}
        </div>

        <p className="text-[10px] text-slate-400 italic">
          <SkipForward className="w-3 h-3 inline mr-1" />
          Cattle with existing active QR codes are automatically skipped. This is safe to run multiple times.
        </p>
      </div>
    </div>
  );
};
