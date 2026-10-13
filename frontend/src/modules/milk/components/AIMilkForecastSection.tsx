import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import {
  TrendingUp,
  Milk,
  Sparkles,
  RefreshCw,
  Scale,
  Award,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Droplet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface MilkForecastData {
  currentDailyAverage: number;
  thirtyDayProjectedTotal: number;
  projectedDailyTrajectory: 'RISING' | 'STABLE' | 'DECLINING';
  forecastChartData: Array<{
    date: string;
    predictedLiters: number;
    upperConfidenceBound: number;
    lowerConfidenceBound: number;
  }>;
  cowBenchmarks: Array<{
    cattleId: string;
    tagNumber: string;
    name: string;
    breed: string;
    actualDailyAvg: number;
    aiPotentialDaily: number;
    efficiencyPercentage: number;
    status: 'STAR_PRODUCER' | 'OPTIMAL' | 'UNDERPERFORMING';
    optimizationTip: string;
  }>;
  recommendedFeedRation: {
    bodyWeightKg: number;
    dailyMilkTargetLiters: number;
    dryMatterIntakeKg: number;
    greenFodderKg: number;
    dryFodderKg: number;
    concentrateFeedKg: number;
    crudeProteinPercentage: number;
    mineralMixtureGrams: number;
    projectedYieldGainLiters: number;
  };
  executiveSummary: string;
}

export const AIMilkForecastSection: React.FC = () => {
  const [data, setData] = useState<MilkForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetYield, setTargetYield] = useState<number>(18);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecast = async (target?: number) => {
    try {
      if (!data) setLoading(true);
      else setRefreshing(true);

      const res = await apiClient.get('/ai/forecast/milk', {
        params: { target: target || targetYield }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load milk forecast:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">
          Generating 30-day lactation forecast & feed optimization matrix...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top AI Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              AI 30-Day Milk Yield Predictive Model
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 rounded border border-cyan-500/30">
                Mathematical Lactation Curve
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {data.executiveSummary}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchForecast()}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Recalculate'}
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Current Daily Average
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {data.currentDailyAverage} Liters
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Rolling herd performance</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            30-Day Projected Output
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
            {data.thirtyDayProjectedTotal.toLocaleString()} Liters
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total forecasted collection</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Expected Trajectory
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono flex items-center gap-2">
            {data.projectedDailyTrajectory}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Based on lactation curve stage</div>
        </div>
      </div>

      {/* 30-Day Forecast Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Milk className="w-4 h-4 text-cyan-500" />
              Daily Milk Harvest Forecast (Next 30 Days)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Includes 95% Confidence Interval upper & lower variance bands
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.forecastChartData}>
              <defs>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={val => val.slice(5)} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="upperConfidenceBound"
                stroke="#10b981"
                fill="url(#boundGrad)"
                name="Optimized Ceiling (Liters)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="predictedLiters"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#predictedGrad)"
                name="Predicted Baseline (Liters)"
              />
              <Area
                type="monotone"
                dataKey="lowerConfidenceBound"
                stroke="#f43f5e"
                fill="none"
                name="Floor Benchmark (Liters)"
                strokeDasharray="2 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Feed Ration Optimizer Interactive Tool */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-extrabold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              AI Feed Ration & Nutrition Formulation Optimizer
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your target daily milk yield to calculate optimal daily intake ratios
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold">Target Yield:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm border border-emerald-500/30">
              {targetYield} Liters / cow / day
            </span>
          </div>
        </div>

        {/* Target Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Maintenance (10 L)</span>
            <span>Balanced (18 L)</span>
            <span>Peak Lactation (30 L)</span>
          </div>
          <input
            type="range"
            min={10}
            max={30}
            step={1}
            value={targetYield}
            onChange={e => {
              const val = Number(e.target.value);
              setTargetYield(val);
              fetchForecast(val);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Feed Breakdown Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Green Fodder
            </div>
            <div className="text-xl font-extrabold font-mono mt-1">
              {data.recommendedFeedRation.greenFodderKg} kg
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Silage / Lucerne / Sorghum</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Dry Fodder
            </div>
            <div className="text-xl font-extrabold font-mono mt-1">
              {data.recommendedFeedRation.dryFodderKg} kg
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Paddy straw / Wheat hay</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Concentrate Pellets
            </div>
            <div className="text-xl font-extrabold font-mono mt-1">
              {data.recommendedFeedRation.concentrateFeedKg} kg
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">20% Crude Protein</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
              Chelated Minerals
            </div>
            <div className="text-xl font-extrabold font-mono mt-1">
              {data.recommendedFeedRation.mineralMixtureGrams} g
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Calcium + Phosphorus + Vit D</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Projected Daily Production Gain:
          </span>
          <span className="font-extrabold font-mono text-sm text-emerald-400">
            +{data.recommendedFeedRation.projectedYieldGainLiters} L per cow daily
          </span>
        </div>
      </div>

      {/* Individual Cow Genetic Potential Benchmarks */}
      {data.cowBenchmarks.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Individual Cow Genetic Potential vs Current Output
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.cowBenchmarks.map(cow => (
              <div
                key={cow.cattleId}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                        {cow.tagNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{cow.breed}</span>
                    </div>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {cow.name}
                    </h5>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      cow.status === 'STAR_PRODUCER'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : cow.status === 'OPTIMAL'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {cow.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Current Avg</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {cow.actualDailyAvg} L / day
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">AI Genetic Target</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {cow.aiPotentialDaily} L / day
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  💡 {cow.optimizationTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
