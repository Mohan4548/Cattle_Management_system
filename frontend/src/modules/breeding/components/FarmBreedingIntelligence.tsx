import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import { FarmBreedingInsightsResult } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import {
  Heart,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  Baby,
  ShieldCheck,
  Clock,
  Info,
  ChevronRight,
  BarChart2,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const FarmBreedingIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FarmBreedingInsightsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [pregnancyFilter, setPregnancyFilter] = useState<string>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');

  const fetchFarmBreedingInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get('/farm/breeding-insights');
      setData(res.data);
    } catch (err: any) {
      console.error('Error fetching farm breeding insights:', err);
      setError('Unable to load farm breeding insights. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarmBreedingInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Analyzing farm breeding records...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 px-4 glass-card rounded-2xl border border-rose-200 dark:border-rose-900 max-w-lg mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {error || 'Failed to load Farm Breeding Insights'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Please check system connectivity or retry fetching farm breeding data.
        </p>
        <button
          onClick={() => fetchFarmBreedingInsights(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
        </button>
      </div>
    );
  }

  const {
    summary,
    pregnancyOverview,
    upcomingDeliveries,
    attentionRequired,
    breedingTrends,
    confirmationTrends,
    dataQuality,
    performanceMetrics,
    insights,
    disclaimer,
    analyzedAt
  } = data;

  // Filter upcoming deliveries
  const filteredUpcomingDeliveries = upcomingDeliveries.filter(item => {
    const matchesSearch =
      item.cattleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cattleTag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPregnancy = pregnancyFilter === 'all' || item.pregnancyStatus === pregnancyFilter;
    const matchesBreed = breedFilter === 'all' || item.breed.toLowerCase() === breedFilter.toLowerCase();
    return matchesSearch && matchesPregnancy && matchesBreed;
  });

  // Unique breeds for filter
  const availableBreeds = Array.from(new Set(upcomingDeliveries.map(u => u.breed))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            Farm Breeding & Pregnancy Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time farm-wide reproductive summary, estimated delivery schedule, and record quality metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Analyzed: {new Date(analyzedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => fetchFarmBreedingInsights(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Dynamic Farm Summary Box */}
      {insights.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 border border-rose-500/20 dark:border-rose-900/40">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                Dynamic Farm Breeding Summary
              </h3>
              {insights.map((insight, idx) => (
                <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  • {insight}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Records</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.hasData ? summary.totalBreedingRecords : <span className="text-xs text-slate-400 font-normal">No data available</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Breeding events logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Confirmed Pregnant</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {summary.hasData ? summary.confirmedPregnancies : <span className="text-xs text-slate-400 font-normal">No data available</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Active gestations</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Upcoming Deliveries</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {summary.hasData ? summary.upcomingDeliveries : <span className="text-xs text-slate-400 font-normal">No data available</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Est. calving schedule</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Delivered</span>
            <Baby className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.hasData ? summary.delivered : <span className="text-xs text-slate-400 font-normal">No data available</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Completed calvings</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Incomplete Records</span>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {summary.hasData ? summary.incompleteRecords : <span className="text-xs text-slate-400 font-normal">No data available</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Records needing update</span>
        </div>
      </div>

      {/* Pregnancy Overview & Data Quality Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pregnancy Status Breakdown Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Pregnancy Status Overview
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
              <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">Confirmed Pregnant</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                {pregnancyOverview.confirmed}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Unconfirmed (Service Logged)</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                {pregnancyOverview.unconfirmed}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Delivered</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {pregnancyOverview.delivered}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Not Pregnant / Open</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {pregnancyOverview.notPregnant}
              </span>
            </div>
          </div>
        </div>

        {/* Breeding Data Quality Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Breeding Data Quality
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {dataQuality.qualityScorePercentage}% Complete
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Cattle Analyzed:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dataQuality.totalCattleAnalyzed}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Incomplete Cattle Records:</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">{dataQuality.incompleteRecordsCount}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Missing Insemination Dates:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dataQuality.missingBreedingDateCount}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Pending Pregnancy Checks:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{dataQuality.missingPregnancyCheckCount}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Note: Quality score indicates data completeness, not biological fertility performance.
          </div>
        </div>

        {/* Breeding Performance Metrics Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Breeding Performance Metrics
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Pregnancy Confirmation Rate</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {performanceMetrics.hasSufficientData && performanceMetrics.pregnancyConfirmationRate !== null
                    ? `${performanceMetrics.pregnancyConfirmationRate}%`
                    : 'N/A'}
                </span>
              </div>
              {performanceMetrics.hasSufficientData && performanceMetrics.pregnancyConfirmationRate !== null ? (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${performanceMetrics.pregnancyConfirmationRate}%` }}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Insufficient historical records to calculate this metric.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[10px]">Breeding Events</span>
                <span className="font-bold text-slate-900 dark:text-white">{performanceMetrics.totalBreedingEvents}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[10px]">Recorded Calvings</span>
                <span className="font-bold text-slate-900 dark:text-white">{performanceMetrics.recordedDeliveries}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breeding Attention Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Cattle Requiring Breeding Attention
          </h3>
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${
            attentionRequired.length > 0
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            {attentionRequired.length} {attentionRequired.length === 1 ? 'Cattle' : 'Cattle'}
          </span>
        </div>

        {attentionRequired.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionRequired.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.cattleName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {item.cattleTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.issue}
                  </p>
                  {item.relevantDate && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Date: {item.relevantDate}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/cattle/${item.cattleId}`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Cattle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No breeding attention required
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All recorded cattle breeding events, pregnancy confirmation checks, and delivery dates are up to date.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Estimated Deliveries Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Upcoming Estimated Deliveries
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sorted by nearest projected calving date based on 283-day bovine gestation baseline.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cattle..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {availableBreeds.length > 0 && (
              <select
                value={breedFilter}
                onChange={e => setBreedFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Breeds</option>
                {availableBreeds.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {filteredUpcomingDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Cattle</th>
                  <th className="py-2.5 px-3">Breed</th>
                  <th className="py-2.5 px-3">Pregnancy Status</th>
                  <th className="py-2.5 px-3">Est. Delivery Date</th>
                  <th className="py-2.5 px-3">Days Remaining</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUpcomingDeliveries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.cattleName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.cattleTag}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{item.breed}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.estimatedDeliveryDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {item.daysRemaining} days
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cattle/${item.cattleId}`)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Cattle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No upcoming estimated deliveries available.
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cattle with confirmed pregnancy records and valid service dates will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Historical Breeding & Confirmation Trends Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Historical Breeding & Pregnancy Confirmation Trends
          </h3>
          <span className="text-xs text-slate-400 font-mono">Monthly Aggregates</span>
        </div>

        {breedingTrends.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breedingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Breeding Records" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              More historical data is required to display this trend.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Log multiple breeding events across different months to generate trend visualizer charts.
            </p>
          </div>
        )}
      </div>

      {/* Decision-Support Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
