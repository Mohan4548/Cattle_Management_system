import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Thermometer,
  Heart,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Activity,
  Milk,
  RotateCcw,
} from 'lucide-react';
import axios from 'axios';

interface DiseaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  cattleId?: string;
  cattleName?: string;
  tagNumber?: string;
  breed?: string;
}

export const DiseaseDiagnosticModal: React.FC<DiseaseDiagnosticModalProps> = ({
  isOpen,
  onClose,
  cattleId,
  cattleName,
  tagNumber,
  breed,
}) => {
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bodyTemp, setBodyTemp] = useState<string>('38.5');
  const [heartRate, setHeartRate] = useState<string>('65');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      fetchSymptoms();
    }
  }, [isOpen]);

  const fetchSymptoms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/health/symptoms-list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.symptoms) {
        setSymptoms(res.data.symptoms);
      }
    } catch (e) {
      console.error('Failed to load symptoms list:', e);
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunDiagnosis = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsLoading(true);
    setDiagnosisResult(null);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        cattleId: cattleId || 'cattle-1',
        symptoms: selectedSymptoms,
        vitals: {
          bodyTempC: bodyTemp ? parseFloat(bodyTemp) : undefined,
          heartRateBpm: heartRate ? parseInt(heartRate) : undefined,
        },
      };

      const res = await axios.post('/api/health/diagnose', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDiagnosisResult(res.data);
    } catch (e) {
      console.error('Failed to diagnose symptoms:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setDiagnosisResult(null);
  };

  if (!isOpen) return null;

  const categories = ['All', 'Udder & Milk', 'Mobility & Legs', 'Digestion & Appetite', 'Respiratory & Head', 'General & Vitals'];

  const filteredSymptoms = symptoms.filter((s) => {
    if (activeCategory === 'All') return true;
    return s.category === activeCategory;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white dark:bg-[#121E17] text-slate-900 dark:text-slate-100 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#15231B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>AI Bovine Disease Symptom Checker & Triage</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Clinical Decision Support
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tagNumber ? `Screening for ${cattleName || 'Cattle'} (${tagNumber}) • ${breed || 'Indigenous'}` : 'Select observed clinical signs to compute instant differential diagnosis.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Step 1: Vitals & Category Bar */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-[#16251D] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    Rectal Body Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyTemp}
                    onChange={(e) => setBodyTemp(e.target.value)}
                    placeholder="38.5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2C22] text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">Normal range: 38.0°C – 39.0°C</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Resting Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="65"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2C22] text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">Normal range: 50 – 80 BPM</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-[#17271E] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Symptom Tags Multi-select Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Observed Clinical Signs ({selectedSymptoms.length} selected)
                </span>
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Selection
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15231B] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white leading-tight">
                          {symptom.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {symptom.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Action Button */}
            <div className="pt-2">
              <button
                onClick={handleRunDiagnosis}
                disabled={selectedSymptoms.length === 0 || isLoading}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                  selectedSymptoms.length === 0 || isLoading
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-emerald-500/25 hover:shadow-lg active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Analyzing Clinical Signals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Run AI Diagnostic Inference ({selectedSymptoms.length} Symptoms)</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 3: Diagnostic Results Card */}
            {diagnosisResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800"
              >
                {/* Result Hero Banner */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm ${
                    diagnosisResult.overallUrgency === 'EMERGENCY'
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                      : diagnosisResult.overallUrgency === 'HIGH'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-black/40 inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        Triage Urgency: {diagnosisResult.overallUrgency}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black">
                        {diagnosisResult.primaryDiagnosis.diseaseName}
                      </h3>
                      <p className="text-xs font-mono opacity-80">
                        {diagnosisResult.primaryDiagnosis.scientificName}
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-black/50 px-5 py-3 rounded-2xl text-right shrink-0">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                        {diagnosisResult.primaryDiagnosis.confidenceScore}%
                      </div>
                      <div className="text-[10px] font-semibold opacity-75">Confidence Score</div>
                    </div>
                  </div>

                  {/* Immediate First Aid Steps */}
                  <div className="pt-4 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      Immediate First Aid & Stabilization Protocols
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {diagnosisResult.primaryDiagnosis.firstAidProtocols.map((protocol: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/60 dark:bg-black/30 p-2.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{protocol}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Veterinary Interventions */}
                  <div className="pt-4 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" />
                      Licensed Veterinary Interventions
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {diagnosisResult.primaryDiagnosis.veterinaryInterventions.map((vet: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/60 dark:bg-black/30 p-2.5 rounded-xl">
                          <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{vet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags: Isolation & Milk Withdrawal */}
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-4 text-xs font-semibold">
                    <div>
                      Isolation Needed:{' '}
                      <strong className={diagnosisResult.primaryDiagnosis.isolationRequired ? 'text-rose-600' : 'text-emerald-600'}>
                        {diagnosisResult.primaryDiagnosis.isolationRequired ? 'Yes (Strict Shed Quarantine)' : 'No'}
                      </strong>
                    </div>
                    <div>
                      Milk Withdrawal Period:{' '}
                      <strong>
                        {diagnosisResult.primaryDiagnosis.dairyMilkWithdrawalDays > 0
                          ? `${diagnosisResult.primaryDiagnosis.dairyMilkWithdrawalDays} Days Discard Period`
                          : 'None'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Differential Diagnoses */}
                {diagnosisResult.differentialDiagnoses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Differential Diagnoses to Rule Out
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {diagnosisResult.differentialDiagnoses.map((diff: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50 dark:bg-[#16251D] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                        >
                          <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                            <span>{diff.diseaseName}</span>
                            <span className="text-emerald-600 font-mono">{diff.confidenceScore}%</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Matched: {diff.matchedSymptoms.join(', ') || 'General signs'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                  ⚠️ <strong>Veterinary Notice:</strong> {diagnosisResult.safetyDisclaimer}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
