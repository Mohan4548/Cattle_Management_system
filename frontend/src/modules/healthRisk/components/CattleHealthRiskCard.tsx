import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { HealthRiskResult, ExplainableFactor, SmartNotification } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  RefreshCw,
  Stethoscope,
  Info,
  CheckCircle2,
  Thermometer,
  Heart,
  Scale,
  Calendar,
  BarChart3,
  Check,
  Bell
} from 'lucide-react';

interface CattleHealthRiskCardProps {
  cattleId: string;
  cattleName?: string;
}

export const CattleHealthRiskCard: React.FC<CattleHealthRiskCardProps> = ({
  cattleId,
  cattleName
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'no_data' | 'error'>('idle');
  const [result, setResult] = useState<HealthRiskResult | null>(null);
  const [alerts, setAlerts] = useState<SmartNotification[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCattleAlerts = async () => {
    if (!cattleId) return;
    try {
      const res = await apiClient.get(`/cattle/${cattleId}/alerts`);
      setAlerts(res.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCattleAlerts();
  }, [cattleId]);

  const handleAnalyzeHealth = async () => {
    if (!cattleId) return;
    setStatus('loading');
    setErrorMessage(null);

    try {
      const [res] = await Promise.all([
        apiClient.get(`/cattle/${cattleId}/health-risk`),
        fetchCattleAlerts()
      ]);
      if (res.data && res.data.riskLevel) {
        setResult(res.data);
        setStatus('success');
      } else {
        setStatus('no_data');
      }
    } catch (err: any) {
      console.error('Error analyzing cattle health risk:', err);
      if (err?.response?.status === 404) {
        setStatus('no_data');
      } else {
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || 'Unable to analyze health data. Please try again.');
      }
    }
  };

  const renderBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <Badge variant="urgent" className="gap-1.5 px-3 py-1 text-sm font-bold tracking-wide">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            HIGH RISK
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge variant="high" className="gap-1.5 px-3 py-1 text-sm font-bold tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            MEDIUM RISK
          </Badge>
        );
      case 'LOW':
      default:
        return (
          <Badge variant="healthy" className="gap-1.5 px-3 py-1 text-sm font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            LOW RISK
          </Badge>
        );
    }
  };

  const renderConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            HIGH CONFIDENCE
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            MEDIUM CONFIDENCE
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            LOW CONFIDENCE
          </span>
        );
    }
  };

  const renderImpactTag = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">High Impact</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">Medium Impact</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Low Impact</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'bg-rose-500 text-rose-600';
    if (score >= 30) return 'bg-amber-500 text-amber-600';
    return 'bg-emerald-500 text-emerald-600';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Health Risk Prediction
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                Phase 2 Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic health risk scoring, confidence rating & decision support
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyzeHealth}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {status === 'loading' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Analyzing health data...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 text-emerald-100" />
              {status === 'idle' ? 'Analyze Health' : 'Re-analyze Health'}
            </>
          )}
        </button>
      </div>

      {/* Main Body States */}
      <div className="mt-5">
        {/* State 1: IDLE / Unanalyzed */}
        {status === 'idle' && (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Stethoscope className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Health analysis not available yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Click &quot;Analyze Health&quot; to compute the health-risk score, explainable risk factors, and recommended next actions based on recorded farm data.
            </p>
          </div>
        )}

        {/* State 2: LOADING */}
        {status === 'loading' && (
          <div className="text-center py-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Analyzing health data...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Evaluating vitals, active health records, and vaccination history for {cattleName || 'cattle'}
            </p>
          </div>
        )}

        {/* State 3: INSUFFICIENT DATA */}
        {status === 'no_data' && (
          <div className="text-center py-8 px-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <Info className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Insufficient health data for a reliable analysis
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-md mx-auto">
              No medical logs or active cattle records found for this cattle to perform health risk evaluation.
            </p>
          </div>
        )}

        {/* State 4: ERROR */}
        {status === 'error' && (
          <div className="text-center py-8 px-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Unable to analyze health data. Please try again.
            </h4>
            {errorMessage && (
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 mb-3">
                {errorMessage}
              </p>
            )}
            <button
              onClick={handleAnalyzeHealth}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State 5: SUCCESS RESULT */}
        {status === 'success' && result && (
          <div className="space-y-5">
            {/* Risk Score & Overview Header Card */}
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Risk Assessment & Data Quality
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {renderBadge(result.riskLevel)}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Data Confidence:</span>
                      {renderConfidenceBadge(result.confidence)}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Risk Score
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {result.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Score Meter Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${getScoreColor(result.riskScore).split(' ')[0]}`}
                    style={{ width: `${Math.min(Math.max(result.riskScore, 5), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>0 (Low Risk)</span>
                  <span>30 (Medium)</span>
                  <span>60+ (High)</span>
                  <span>100</span>
                </div>
              </div>

              {result.analyzedAt && (
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Analysis Date: {new Date(result.analyzedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {/* Input Summary Chips */}
            {result.inputSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Health Status</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                    {result.inputSummary.health_status || 'Healthy'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-rose-500" /> Temperature
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {result.inputSummary.recent_vitals?.body_temp_c ? `${result.inputSummary.recent_vitals.body_temp_c}°C` : 'Not recorded'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-purple-500" /> Heart Rate
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {result.inputSummary.recent_vitals?.heart_rate_bpm ? `${result.inputSummary.recent_vitals.heart_rate_bpm} BPM` : 'Not recorded'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-500" /> Weight
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {result.inputSummary.weight_kg ? `${result.inputSummary.weight_kg} kg` : 'Not recorded'}
                  </div>
                </div>
              </div>
            )}

            {/* Explainable Key Factors List */}
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Key Explainable Risk Factors
              </h4>
              <div className="space-y-2.5">
                {result.keyFactors && result.keyFactors.length > 0 ? (
                  result.keyFactors.map((f: ExplainableFactor | any, idx) => {
                    const factorName = typeof f === 'string' ? f : f.factor;
                    const impact = typeof f === 'string' ? 'Low' : f.impact;
                    const desc = typeof f === 'string' ? f : f.description;
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {factorName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {desc}
                          </div>
                        </div>
                        {renderImpactTag(impact)}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No risk factors identified.</p>
                )}
              </div>
            </div>

            {/* Active Smart Alerts Section */}
            {alerts.length > 0 && (
              <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
                  Active AI Health Notifications ({alerts.length})
                </h4>
                <div className="space-y-2">
                  {alerts.map((a) => (
                    <div key={a.id} className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-500/20">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.message}</p>
                      {a.trigger_reason && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          Trigger: {a.trigger_reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action Plan */}
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Recommended Next Actions
              </h4>
              <ul className="space-y-2">
                {result.recommendations && result.recommendations.length > 0 ? (
                  result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="mt-0.5 font-medium">{rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400 italic">No specific action required.</li>
                )}
              </ul>
            </div>

            {/* Safety & Medical Disclaimer */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>
                <strong>Safety Disclaimer:</strong> {result.safetyNotice || 'Decision-support tool only. Recommended Veterinary Review for concerning observations.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
