import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../api/client';
import {
  Camera,
  Upload,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Syringe,
  Clock,
  Ban,
  X,
  RefreshCw,
  Search,
  Eye,
  FileText
} from 'lucide-react';

interface DiagnosticResult {
  analysisId: string;
  analyzedAt: string;
  primaryDiagnosis: {
    detectedRegion: string;
    suspectedCondition: string;
    confidenceScore: number;
    urgency: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
    visualFeaturesDetected: string[];
    clinicalDescription: string;
    immediateActions: string[];
    veterinaryTreatments: string[];
    isolationRequired: boolean;
    milkWithdrawalDays: number;
  };
  differentialDiagnoses: Array<{
    suspectedCondition: string;
    confidenceScore: number;
    urgency: string;
  }>;
  safetyNotice: string;
}

const SAMPLE_CASES = [
  {
    id: 'udder_mastitis',
    title: 'Udder & Teat Swelling',
    subtitle: 'Mastitis / Acute inflammation',
    icon: '🥛',
    badge: 'Udder',
    color: 'from-amber-500/20 to-rose-500/20'
  },
  {
    id: 'skin_lsd',
    title: 'Skin Nodules & Papules',
    subtitle: 'Lumpy Skin Disease (LSD)',
    icon: '🐄',
    badge: 'Skin',
    color: 'from-rose-500/20 to-orange-500/20'
  },
  {
    id: 'hoof_rot',
    title: 'Interdigital Hoof Lesions',
    subtitle: 'Foot Rot / Lameness',
    icon: '🦶',
    badge: 'Hoof',
    color: 'from-amber-500/20 to-yellow-500/20'
  },
  {
    id: 'eye_pinkeye',
    title: 'Corneal Cloudiness & Tearing',
    subtitle: 'Infectious Pink Eye (IBK)',
    icon: '👁️',
    badge: 'Eyes',
    color: 'from-cyan-500/20 to-blue-500/20'
  }
];

export const AIImageDiagnosticModal: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose
}) => {
  const [selectedCase, setSelectedCase] = useState<string>('udder_mastitis');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleRunDiagnosis = async (presetId?: string) => {
    const targetPreset = presetId || selectedCase;
    setAnalyzing(true);
    setResult(null);

    try {
      const res = await apiClient.post('/ai/diagnostic/image', {
        preset: targetPreset,
        imageBase64: previewImage
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to run AI diagnostic:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        handleRunDiagnosis();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-emerald-600/10 border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              AI Visual Health & Disease Image Scanner
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded border border-violet-500/30">
                Vision Model v2.4
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a clinical sample symptom case or upload a live cattle photo for instant AI pathology detection
            </p>
          </div>
        </div>
      </div>

      {/* Case Presets Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SAMPLE_CASES.map(c => {
          const isSelected = selectedCase === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCase(c.id);
                handleRunDiagnosis(c.id);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {c.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.subtitle}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Run Scan</span>
                <span>&rarr;</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-900/50 text-center transition">
        <label className="cursor-pointer block">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Click to upload your own cattle image
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Supports JPG, PNG up to 10 MB (Clear photos of skin lesions, hooves, eyes or udder)
          </span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Scanning Animation */}
      {analyzing && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            AI Neural Network Processing Visual Signatures...
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Extracting lesion dimensions, vascular erythema, morphological patterns and differential diagnoses
          </p>
        </div>
      )}

      {/* Result Display Card */}
      {result && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
        >
          {/* Top Diagnosis Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    result.primaryDiagnosis.urgency === 'EMERGENCY'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : result.primaryDiagnosis.urgency === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {result.primaryDiagnosis.urgency} URGENCY
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Analysis ID: {result.analysisId}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {result.primaryDiagnosis.suspectedCondition}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {result.primaryDiagnosis.clinicalDescription}
              </p>
            </div>

            {/* Confidence Gauge */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Confidence Match
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {result.primaryDiagnosis.confidenceScore}%
              </div>
              <div className="w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.primaryDiagnosis.confidenceScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bio-security & Quarantine notice badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              result.primaryDiagnosis.isolationRequired
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            }`}>
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold">
                  {result.primaryDiagnosis.isolationRequired ? 'Quarantine & Herd Isolation Required' : 'Individual In-Shed Treatment Permitted'}
                </div>
                <div className="text-[11px] opacity-80">
                  {result.primaryDiagnosis.isolationRequired ? 'Keep 10 meters distance from main herd.' : 'No contagious airborne transmission identified.'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-3">
              <Ban className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold">
                  Milk Withdrawal: {result.primaryDiagnosis.milkWithdrawalDays} Days
                </div>
                <div className="text-[11px] opacity-80">
                  {result.primaryDiagnosis.milkWithdrawalDays > 0 ? 'Do NOT deliver milk to commercial cooperative during treatment.' : 'Milk consumption safe after routine pasteurization.'}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Features Detected */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Visual Features Flagged by Neural Net
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.primaryDiagnosis.visualFeaturesDetected.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Eye className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate First Aid Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Immediate On-Farm First-Aid Protocol
            </h4>
            <div className="space-y-1.5">
              {result.primaryDiagnosis.immediateActions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Veterinary Interventions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Syringe className="w-4 h-4" />
              Prescribed Veterinary Interventions (Doctor Review)
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              {result.primaryDiagnosis.veterinaryTreatments.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
            ⚠️ {result.safetyNotice}
          </div>
        </motion.div>
      )}
    </div>
  );
};
