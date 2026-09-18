import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { AIHealthInsightsSummary, CattleAttentionItem, SmartNotification } from '../types';
import { Badge } from '../components/common/Badge';
import { FarmBreedingIntelligence } from '../modules/breeding/components/FarmBreedingIntelligence';
import {
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Search,
  Filter,
  Syringe,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Info,
  Calendar,
  Eye,
  BarChart2,
  PieChart as PieIcon,
  Check,
  Bell,
  CheckCheck,
  Heart
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const AIInsights: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'breeding' ? 'breeding' : 'health';
  const [activeTab, setActiveTab] = useState<'health' | 'breeding'>(initialTab);

  const [data, setData] = useState<AIHealthInsightsSummary | null>(null);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: 'health' | 'breeding') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH'>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [res, notifRes] = await Promise.all([
        apiClient.get('/health/ai-insights'),
        apiClient.get('/notifications').catch(() => ({ data: [] }))
      ]);
      setData(res.data);
      setNotifications(notifRes.data || []);
    } catch (err: any) {
      console.error('Error fetching AI health insights:', err);
      setError('Unable to load AI health insights. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Updating AI insights...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 px-4 glass-card rounded-2xl border border-rose-200 dark:border-rose-900 max-w-lg mx-auto mt-8">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {error || 'Failed to load AI Insights'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Please check system connectivity or retry fetching the health risk insights.
        </p>
        <button
          onClick={() => fetchInsights()}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Filter cattle requiring attention
  const filteredAttentionList = data.cattleRequiringAttention.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || item.riskLevel === riskFilter;
    const matchesBreed = breedFilter === 'all' || item.breed.toLowerCase() === breedFilter.toLowerCase();
    return matchesSearch && matchesRisk && matchesBreed;
  });

  // Extract unique breeds for filter dropdown
  const uniqueBreeds = Array.from(new Set(data.cattleRequiringAttention.map(i => i.breed)));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Health Insights
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
              Live Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time farm health distribution, high-risk flags, and vaccination intelligence
          </p>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating AI insights...' : 'Refresh AI Insights'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => handleTabChange('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'health'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Health Risk Intelligence
        </button>

        <button
          onClick={() => handleTabChange('breeding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'breeding'
              ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          Breeding & Pregnancy Intelligence
        </button>
      </div>

      {activeTab === 'breeding' ? (
        <FarmBreedingIntelligence />
      ) : (
        <>
          {/* Auto-generated AI Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-500/20 dark:border-emerald-800/40 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Executive Farm Health Summary
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {data.aiSummary}
          </p>
        </div>
      </div>

      {/* Overview KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Analyzed</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {data.totalAnalyzed}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cattle in system</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Low Risk</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {data.lowRiskCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Normal health status</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Medium Risk</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {data.mediumRiskCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Monitor closely</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">High Risk</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {data.highRiskCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Urgent care needed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Data Coverage</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
            {data.healthDataCoverage}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sufficient profile logs</div>
        </div>
      </div>

      {/* Visual Analytics Row: Risk Chart & Vaccination Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              Health Risk Level Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vaccination Insights */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Syringe className="w-4 h-4 text-violet-500" />
                Vaccination Insights
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Protective herd immunity and protocol tracking
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Vaccinations Due Soon (30 Days)
                </span>
                <span className="text-sm font-bold text-amber-600 font-mono">
                  {data.vaccinationInsights.dueSoonCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Vaccinations Overdue
                </span>
                <span className="text-sm font-bold text-rose-600 font-mono">
                  {data.vaccinationInsights.overdueCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Logged Protocols
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {data.vaccinationInsights.totalVaccinations}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/health"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            View Vaccination Records
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active AI Health Alerts & Smart Notifications */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500 animate-pulse" />
              Active AI Health Alerts & Smart Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated smart alerts derived from risk analysis, level transitions, and preventive health schedules
            </p>
          </div>
          {notifications.some((n) => n.status === 'UNREAD') && (
            <button
              onClick={async () => {
                await apiClient.post('/notifications/mark-all-read');
                setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' as const })));
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active health alerts</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All cattle are currently within baseline risk thresholds</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {notifications.slice(0, 6).map((n) => {
              const isCritical = n.priority === 'CRITICAL' || n.priority === 'HIGH';
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.status === 'UNREAD'
                      ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          n.priority === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : n.priority === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {n.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {n.message}
                  </p>

                  {n.trigger_reason && (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Trigger: </span>
                      {n.trigger_reason}
                    </div>
                  )}

                  {n.recommended_action && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                      💡 {n.recommended_action}
                    </p>
                  )}

                  {n.cattle_id && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {n.cattle_tag || n.cattle_name || n.cattle_id}
                      </span>
                      <button
                        onClick={() => navigate(n.action_url || `/cattle/${n.cattle_id}`)}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        View Cattle <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cattle Requiring Attention Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Cattle Requiring Attention
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cattle flagged with High or Medium risk parameters needing monitoring or vet review
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Box */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MEDIUM">Medium Risk Only</option>
              <option value="LOW">Low Risk Only</option>
            </select>

            {/* Breed Filter */}
            {uniqueBreeds.length > 0 && (
              <select
                value={breedFilter}
                onChange={e => setBreedFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Breeds</option>
                {uniqueBreeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Attention Cards List */}
        {filteredAttentionList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAttentionList.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                        {item.tag_number}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{item.breed}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {item.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    {item.riskLevel === 'HIGH' ? (
                      <Badge variant="urgent" className="px-2.5 py-0.5 text-xs font-bold">HIGH RISK</Badge>
                    ) : (
                      <Badge variant="high" className="px-2.5 py-0.5 text-xs font-bold">MEDIUM RISK</Badge>
                    )}
                    <div className="text-xs font-mono font-bold text-slate-500 mt-1">
                      Score: {item.riskScore} / 100
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Main Factor: {item.mainFactor}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {item.factorDescription}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Last Analyzed: {new Date(item.lastAnalysis).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  <button
                    onClick={() => navigate(`/cattle/${item.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No cattle matching attention criteria
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All analyzed cattle are currently in normal health status or match your search filter.
            </p>
          </div>
        )}
      </div>

      {/* Health Trends & Historical Analytics */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Historical Health & Vitals Trend
          </h3>
          <span className="text-xs text-slate-400 font-mono">Farm v1.0</span>
        </div>

        {data.hasHistoricalData && data.healthTrends.length > 0 ? (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.healthTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[35, 42]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Body Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              More health records are needed to display trends.
            </p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
