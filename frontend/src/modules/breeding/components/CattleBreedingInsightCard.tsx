import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { BreedingInsightResult, BreedingTimelineStage } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import {
  Sparkles,
  Dna,
  Calendar,
  Baby,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  HeartHandshake,
  Stethoscope,
  Activity,
  CheckCircle,
  Milk
} from 'lucide-react';

interface CattleBreedingInsightCardProps {
  cattleId: string;
  cattleName?: string;
}

export const CattleBreedingInsightCard: React.FC<CattleBreedingInsightCardProps> = ({
  cattleId,
  cattleName
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'no_data' | 'incomplete' | 'error'>('idle');
  const [insight, setInsight] = useState<BreedingInsightResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBreedingInsight = async () => {
    if (!cattleId) return;
    setStatus('loading');
    setErrorMessage(null);

    try {
      const res = await apiClient.get(`/cattle/${cattleId}/breeding-insights`);
      if (res.data) {
        setInsight(res.data);
        if (res.data.breedingStatus === 'NOT_BRED' && res.data.breedingHistory?.totalBreedingEvents === 0) {
          setStatus('no_data');
        } else if (res.data.missingData && res.data.missingData.length > 2) {
          setStatus('incomplete');
        } else {
          setStatus('success');
        }
      } else {
        setStatus('no_data');
      }
    } catch (err: any) {
      console.error('Error fetching breeding insight:', err);
      if (err?.response?.status === 404) {
        setStatus('no_data');
      } else {
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || 'Unable to load breeding insights. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchBreedingInsight();
  }, [cattleId]);

  const renderStatusBadge = (breedingStatus: string) => {
    switch (breedingStatus) {
      case 'PREGNANT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5 text-purple-500" />
            CONFIRMED PREGNANT
          </span>
        );
      case 'INSEMINATED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            INSEMINATED / SERVICE LOGGED
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            CALVING COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            BREEDING ATTEMPT UNCHECKED
          </span>
        );
      case 'NOT_BRED':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-slate-400" />
            NO ACTIVE BREEDING LOG
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold">
            <Dna className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Breeding & Pregnancy Insights
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
                Phase 10B Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pregnancy timeline, estimated delivery window & trimester care intelligence
            </p>
          </div>
        </div>

        <button
          onClick={fetchBreedingInsight}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          {status === 'loading' ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Main Body States */}
      <div>
        {/* State 1: LOADING */}
        {status === 'loading' && (
          <div className="text-center py-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Analyzing breeding information...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Processing insemination logs, pregnancy checks, and calving timeline for {cattleName || 'cattle'}
            </p>
          </div>
        )}

        {/* State 2: NO DATA */}
        {status === 'no_data' && (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Dna className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No breeding information recorded
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No active insemination or pregnancy records logged for this animal. Log a breeding event to generate timeline insights.
            </p>
          </div>
        )}

        {/* State 3: INCOMPLETE DATA */}
        {status === 'incomplete' && insight && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Breeding information is incomplete</h4>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Additional breeding dates or pregnancy confirmation logs are required for full timeline analysis.
            </p>
            {insight.missingData && insight.missingData.length > 0 && (
              <ul className="text-[11px] text-amber-700 dark:text-amber-300 space-y-1 pl-4 list-disc">
                {insight.missingData.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* State 4: ERROR */}
        {status === 'error' && (
          <div className="text-center py-8 px-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Unable to load breeding insights. Please try again.
            </h4>
            {errorMessage && (
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 mb-3">
                {errorMessage}
              </p>
            )}
            <button
              onClick={fetchBreedingInsight}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* State 5: SUCCESS RESULT */}
        {(status === 'success' || (status === 'incomplete' && insight)) && insight && (
          <div className="space-y-6">
            {/* Status & Summary Cards Row */}
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Breeding & Gestation Status
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderStatusBadge(insight.breedingStatus)}
                    {insight.pregnancyStatus === 'UNCONFIRMED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Pregnancy confirmation not recorded
                      </span>
                    )}
                  </div>
                </div>

                {insight.pregnancyDetails?.isPregnant && (
                  <div className="sm:text-right">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Gestation Trimester
                    </div>
                    <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                      {insight.pregnancyDetails.trimester || '2nd Trimester (Mid)'}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar if Confirmed Pregnant */}
              {insight.pregnancyDetails?.isPregnant && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      Days Pregnant: <strong className="font-mono text-purple-600">{insight.pregnancyDetails.daysPregnant || 0} days</strong>
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {insight.pregnancyDetails.progressPercentage || 0}% Progress (~283d total)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(insight.pregnancyDetails.progressPercentage || 0, 4), 100)}%` }}
                    />
                  </div>
                  {insight.pregnancyDetails.daysRemaining !== undefined && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono text-right">
                      ~{insight.pregnancyDetails.daysRemaining} days remaining to delivery
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Step-Node Pregnancy Timeline */}
            <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-500" />
                Visual Pregnancy & Gestation Timeline
              </h4>

              {/* Horizontal Node Track */}
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center justify-between min-w-[580px] px-2 py-3 relative">
                  {/* Background connecting line */}
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

                  {/* 6 Stage Nodes */}
                  {insight.timeline && insight.timeline.map((stg, idx) => {
                    const isCompleted = stg.status === 'completed';
                    const isCurrent = stg.status === 'current';
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center group text-center max-w-[90px]">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                            isCurrent
                              ? 'bg-purple-600 text-white border-purple-400 ring-4 ring-purple-500/30 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-2 line-clamp-2 leading-snug">
                          {stg.stage}
                        </span>
                        {stg.date && (
                          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                            {stg.date}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Estimated Delivery Window & Key Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estimated Delivery Window Card */}
              {insight.estimatedDeliveryDate ? (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Estimated Delivery Date
                      </div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                        {insight.estimatedDeliveryDate}
                      </div>
                    </div>
                  </div>
                  {insight.estimatedDeliveryWindow && (
                    <div className="text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-500/20 font-mono text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold mb-0.5">Expected Window</span>
                      {insight.estimatedDeliveryWindow.start} → {insight.estimatedDeliveryWindow.end}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Delivery</div>
                  <p className="text-xs text-slate-500 mt-1">Log insemination date to generate delivery date estimation.</p>
                </div>
              )}

              {/* Dry Off Date & Milestones */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Milk className="w-3.5 h-3.5 text-indigo-500" /> Key Gestation Milestones
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Insemination Date:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{insight.latestBreedingDate || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Pregnancy Check:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{insight.pregnancyConfirmationDate || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Dry Off Target (Day 223):</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{insight.dryOffDate || insight.pregnancyDetails?.dryOffDate || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trimester Care & Nutritional Recommendations Box */}
            {insight.pregnancyDetails?.careRecommendations && insight.pregnancyDetails.careRecommendations.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-500" />
                  Trimester Care & Nutritional Guidelines ({insight.pregnancyDetails.trimester || 'Current'})
                </h4>
                <ul className="space-y-1.5">
                  {insight.pregnancyDetails.careRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-purple-950 dark:text-purple-100">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                      <span className="font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Factual AI Insights List */}
            {insight.insights && insight.insights.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Breeding & Pregnancy Summary
                </h4>
                <ul className="space-y-1.5">
                  {insight.insights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>
                <strong>Disclaimer:</strong> {insight.disclaimer}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
