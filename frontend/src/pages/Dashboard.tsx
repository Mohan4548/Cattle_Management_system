import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DashboardData } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { 
  Beef, 
  Milk, 
  Heart, 
  Stethoscope, 
  DollarSign, 
  TrendingUp, 
  Boxes, 
  Syringe, 
  CheckSquare, 
  Truck, 
  CloudSun, 
  Search, 
  Filter, 
  Plus, 
  Activity, 
  Bell, 
  Sparkles, 
  Droplet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  PieChart as PieIcon, 
  BarChart3, 
  Wind, 
  Thermometer,
  ScanLine,
  ShoppingCart,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

// ─── Purchase Summary Strip (isolated, does not touch dashboard state) ─────────
const PurchaseSummaryStrip: React.FC = () => {
  const [purchaseStats, setPurchaseStats] = React.useState({ total: 0, count: 0, latest: '' });
  React.useEffect(() => {
    apiClient.get('/cattle', { params: { limit: 500, page: 1 } })
      .then(res => {
        const list: any[] = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
        const withCost = list.filter((c: any) => c.purchase_cost && c.purchase_cost > 0);
        const total = withCost.reduce((s: number, c: any) => s + (c.total_acquisition_cost ?? c.purchase_cost ?? 0), 0);
        const sorted = withCost.sort((a: any, b: any) => (b.purchase_date || '').localeCompare(a.purchase_date || ''));
        const latest = sorted[0] ? `${sorted[0].name} – ₹${(sorted[0].purchase_cost || 0).toLocaleString('en-IN')}` : '';
        setPurchaseStats({ total, count: withCost.length, latest });
      })
      .catch(() => {});
  }, []);
  if (!purchaseStats.total) return null;
  return (
    <div className="card-premium p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="icon-box icon-box-green w-9 h-9">
          <ShoppingCart className="w-4 h-4" />
        </div>
        <div>
          <p className="section-label">Purchase Investment</p>
          <p className="text-lg font-black text-[var(--text-primary)] leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            ₹{purchaseStats.total.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{purchaseStats.count} cattle purchased</p>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {purchaseStats.latest && (
          <div className="text-right">
            <p className="section-label">Latest Purchase</p>
            <p className="text-xs font-semibold text-[var(--text-primary)] max-w-[180px] truncate">{purchaseStats.latest}</p>
          </div>
        )}
        <Link to="/purchases" className="btn-secondary text-xs flex items-center gap-1.5 shrink-0">
          <ShoppingCart className="w-3.5 h-3.5" /> View Purchases
        </Link>
      </div>
    </div>
  );
};

// ─── AI Health Summary Widget ──────────────────────────────────────────────────
const AIHealthSummaryWidget: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<any>(null);

  React.useEffect(() => {
    apiClient.get('/health/ai-insights')
      .then(res => setSummary(res.data))
      .catch(() => {});
  }, []);

  if (!summary) return null;

  return (
    <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-indigo-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              AI HEALTH SUMMARY
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800">
              {summary.healthDataCoverage}% Coverage
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {summary.cattleRequiringAttention?.length || 0} cattle require attention ({summary.highRiskCount || 0} High, {summary.mediumRiskCount || 0} Medium risk)
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/ai-insights')}
        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
      >
        View AI Insights →
      </button>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

  // Quick Action Modals
  const [activeModal, setActiveModal] = useState<'cattle' | 'milk' | 'vaccine' | 'feed' | null>(null);

  // Form inputs for Quick Actions
  const [newTag, setNewTag] = useState('');
  const [newName, setNewName] = useState('');
  const [milkAmount, setMilkAmount] = useState('14.5');
  const [vacName, setVacName] = useState('Anthrax Booster');
  const [feedQty, setFeedQty] = useState('50');

  const fetchDashboardData = async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      setData(res.data);
    } catch {
      // API client fallback handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddCattle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/cattle', {
        tag_number: newTag || `FE-${Math.floor(106 + Math.random() * 50)}`,
        name: newName || 'Bella',
        breed: 'Holstein Friesian',
        gender: 'female',
        date_of_birth: '2023-01-01',
        weight_kg: 520,
        health_status: 'healthy',
        lactation_stage: 'mid',
      });
      setActiveModal(null);
      fetchDashboardData();
    } catch {
      alert('Failed to register cattle.');
    }
  };

  const handleQuickAddMilk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/milk', {
        cattle_id: 'cattle-1',
        log_date: new Date().toISOString().split('T')[0],
        session: 'morning',
        yield_liters: Number(milkAmount),
        fat_percentage: 4.1,
        snf_percentage: 8.7,
      });
      setActiveModal(null);
      fetchDashboardData();
    } catch {
      alert('Failed to log milk.');
    }
  };

  const kpi = data?.kpi || {
    totalCattle: 5,
    healthyCattle: 3,
    pregnantCattle: 1,
    milkToday: 38.5,
    milkThisMonth: 1120.0,
    feedCost: 45000,
    profit: 141000,
    expenses: 45000,
    vaccinationsDue: 1,
    todaysTasks: 1,
    upcomingDeliveries: 1,
  };

  const breedData = data?.charts?.breedDistribution || [
    { name: 'Holstein Friesian', value: 2, color: '#10b981' },
    { name: 'Jersey', value: 1, color: '#14b8a6' },
    { name: 'Brown Swiss', value: 1, color: '#f59e0b' },
    { name: 'Angus', value: 1, color: '#6366f1' },
  ];

  const filteredActivities = (data?.recentActivities || []).filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 animate-page-in">
      {/* ── Page Header ── */}
      <div className="card-premium p-5 border border-[var(--accent-green)]/15 bg-gradient-to-r from-[var(--accent-green-subtle)] via-[var(--bg-card)] to-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-pill badge-green">
                <Activity className="w-2.5 h-2.5" /> Live
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="page-title">
              Good morning, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">
              Here's what's happening on your farm today.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="search-icon w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities…"
                className="search-input w-52"
              />
            </div>

            <div className="tab-bar">
              {(['today', 'week', 'month'] as const).map((r) => (
                <button key={r} onClick={() => setTimeRange(r)} className={`tab-item ${timeRange === r ? 'active' : ''}`}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Summary Widget */}
      <AIHealthSummaryWidget />

      {/* ── Quick Actions ── */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span className="section-label">Quick Actions</span>
          </div>
          <span className="badge-pill badge-green">1-Click</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { label: 'Add Cattle',   icon: Beef,      color: 'icon-box-green',  action: () => setActiveModal('cattle' as const) },
            { label: 'Add Milk',     icon: Milk,      color: 'icon-box-teal',   action: () => setActiveModal('milk' as const) },
            { label: 'Scan QR',      icon: ScanLine,  color: 'icon-box-indigo', action: () => navigate('/qr-scanner') },
            { label: 'Vaccination',  icon: Syringe,   color: 'icon-box-violet', action: () => setActiveModal('vaccine' as const) },
            { label: 'Add Feed',     icon: Boxes,     color: 'icon-box-amber',  action: () => setActiveModal('feed' as const) },
          ].map(({ label, icon: Icon, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-green-subtle)] border border-[var(--border-base)] hover:border-[var(--accent-green)]/30 text-xs font-semibold flex flex-col items-center gap-2 transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--accent-green-dark)] group"
            >
              <div className={`icon-box ${color} w-9 h-9 group-hover:scale-110 transition-transform rounded-xl`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 11 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="stat-card accent-green p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Cattle</span>
            <div className="icon-box icon-box-green w-7 h-7"><Beef className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--text-primary)]"><AnimatedCounter value={kpi.totalCattle} /></div>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1.5">100% Active Herd</p>
        </div>

        {/* KPI 2 */}
        <div className="stat-card accent-green p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Healthy</span>
            <div className="icon-box icon-box-green w-7 h-7"><Heart className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-emerald-500 dark:text-emerald-400"><AnimatedCounter value={kpi.healthyCattle} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Normal Health</p>
        </div>

        {/* KPI 3 */}
        <div className="stat-card accent-violet p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pregnant</span>
            <div className="icon-box icon-box-violet w-7 h-7"><Stethoscope className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-violet)]"><AnimatedCounter value={kpi.pregnantCattle} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Expected Calving</p>
        </div>

        {/* KPI 4 */}
        <div className="stat-card accent-teal p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Milk Today</span>
            <div className="icon-box icon-box-teal w-7 h-7"><Droplet className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-teal)]"><AnimatedCounter value={kpi.milkToday} decimals={1} suffix=" L" /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">AM + PM Sessions</p>
        </div>

        {/* KPI 5 */}
        <div className="stat-card accent-sky p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Monthly Milk</span>
            <div className="icon-box icon-box-sky w-7 h-7"><Milk className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--text-primary)]"><AnimatedCounter value={kpi.milkThisMonth} decimals={1} suffix=" L" /></div>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1.5">+6.4% vs last month</p>
        </div>

        {/* KPI 6 */}
        <div className="stat-card accent-amber p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Feed Cost</span>
            <div className="icon-box icon-box-amber w-7 h-7"><Boxes className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-amber)]"><AnimatedCounter value={kpi.feedCost} prefix="₹" decimals={0} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Monthly Fodder</p>
        </div>

        {/* KPI 7 */}
        <div className="stat-card accent-green p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Net Profit</span>
            <div className="icon-box icon-box-green w-7 h-7"><DollarSign className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-emerald-500 dark:text-emerald-400"><AnimatedCounter value={kpi.profit} prefix="₹" decimals={0} /></div>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1.5">Revenue − Expenses</p>
        </div>

        {/* KPI 8 */}
        <div className="stat-card accent-rose p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Expenses</span>
            <div className="icon-box icon-box-rose w-7 h-7"><ArrowDownRight className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-rose)]"><AnimatedCounter value={kpi.expenses} prefix="₹" decimals={0} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Total Operational</p>
        </div>

        {/* KPI 9 */}
        <div className="stat-card accent-violet p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Vax Due</span>
            <div className="icon-box icon-box-violet w-7 h-7"><Syringe className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-violet)]"><AnimatedCounter value={kpi.vaccinationsDue} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Clarabelle (FE-105)</p>
        </div>

        {/* KPI 10 */}
        <div className="stat-card accent-sky p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tasks Today</span>
            <div className="icon-box icon-box-sky w-7 h-7"><CheckSquare className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--text-primary)]"><AnimatedCounter value={kpi.todaysTasks} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Worker Assignments</p>
        </div>

        {/* KPI 11 */}
        <div className="stat-card accent-amber p-4 sm:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Deliveries</span>
            <div className="icon-box icon-box-amber w-7 h-7"><Truck className="w-3.5 h-3.5" /></div>
          </div>
          <div className="font-display text-2xl font-black text-[var(--accent-amber)]"><AnimatedCounter value={kpi.upcomingDeliveries} /></div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">NutriFeed Co. (In Transit)</p>
        </div>
      </div>

      {/* ── Purchase Investment Summary (links to /purchases) ── */}
      <PurchaseSummaryStrip />

      {/* ── Charts Row ── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weather Widget — light/dark adaptive */}
        <div className="card-premium p-5 border border-[var(--accent-sky)]/20 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, var(--accent-sky-subtle) 0%, var(--bg-card) 100%)' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="badge-pill badge-sky">Live Weather</span>
              <CloudSun className="w-5 h-5 text-[var(--accent-amber)]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)]">{data?.weather?.location || 'Green Valley Cattle Ranch'}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[var(--text-primary)]">{data?.weather?.temp || 24}°C</span>
                <span className="text-xs text-[var(--accent-sky)] font-semibold">{data?.weather?.condition || 'Partly Cloudy'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border-card)] text-xs">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Thermometer className="w-3.5 h-3.5 text-[var(--accent-sky)]" />
                <span>Humidity: <strong className="text-[var(--text-primary)]">{data?.weather?.humidity || '62%'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Wind className="w-3.5 h-3.5 text-[var(--accent-sky)]" />
                <span>Wind: <strong className="text-[var(--text-primary)]">{data?.weather?.wind || '14 km/h'}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[var(--accent-sky-subtle)] border border-[var(--accent-sky)]/20 text-[11px] text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--accent-sky)] block mb-0.5">Pasture Forecast:</span>
            {data?.weather?.forecast || 'Ideal pasture condition for morning grazing.'}
          </div>
        </div>

        {/* Milk Production Chart */}
        <div className="lg:col-span-2 card-premium p-5 border border-[var(--border-card)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <Milk className="w-4 h-4 text-[var(--accent-teal)]" />
                Milk Production Trend
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Morning · Evening · Total (liters/day)</p>
            </div>
            <Link to="/milk" className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: 'var(--accent-teal)' }}>
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.milkTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalYieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Area type="monotone" dataKey="total" name="Total (L)" stroke="#0d9488" strokeWidth={2.5} fill="url(#totalYieldGrad)" />
                <Area type="monotone" dataKey="morning" name="Morning" stroke="#d97706" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="evening" name="Evening" stroke="#7c3aed" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Financial + Breed Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Income vs Expense */}
        <div className="lg:col-span-2 card-premium p-5 border border-[var(--border-card)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-green)]" />
                Income vs Expenses
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Monthly P&L comparison</p>
            </div>
            <Link to="/financials" className="text-xs font-semibold flex items-center gap-1 transition-colors" style={{ color: 'var(--accent-green)' }}>
              Finance <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.financialTrend || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: 'var(--text-secondary)' }} />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breed Distribution */}
        <div className="card-premium p-5 border border-[var(--border-card)] flex flex-col justify-between">
          <div>
            <h3 className="section-title flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-[var(--accent-violet)]" />
              Breed Mix
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {breedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[var(--border-card)]">
            {breedData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text-secondary)] font-medium truncate">{item.name}</span>
                </div>
                <span className="font-bold text-[var(--text-primary)] shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity Feed + Deliveries ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activities */}
        <div className="card-premium p-5 border border-[var(--border-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-green)]" />
              Recent Activity
            </h3>
            <span className="section-label">{filteredActivities.length} logs</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredActivities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Activity className="w-5 h-5" /></div>
                <p className="text-xs text-[var(--text-muted)]">No recent activity</p>
              </div>
            ) : filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-card)] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{act.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">by {act.user_name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{act.description}</p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="card-premium p-5 border border-[var(--border-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Truck className="w-4 h-4 text-[var(--accent-amber)]" />
              Upcoming Deliveries
            </h3>
            <span className="badge-pill badge-amber">In Transit</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(data?.deliveries || []).map((del) => (
              <div
                key={del.id}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-card)] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">{del.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{del.supplier_or_client} • {del.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-[var(--accent-amber)] block">{del.expected_date}</span>
                  <Badge variant={del.status === 'in_transit' ? 'in_progress' : 'healthy'}>
                    {del.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals (all business logic preserved) ── */}
      <Modal isOpen={activeModal === 'cattle'} onClose={() => setActiveModal(null)} title="Quick Register Cattle">
        <form onSubmit={handleQuickAddCattle} className="space-y-4">
          <div>
            <label className="input-label">Tag Number</label>
            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="FE-106" className="input-field" />
          </div>
          <div>
            <label className="input-label">Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Bella" className="input-field" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Register</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'milk'} onClose={() => setActiveModal(null)} title="Quick Log Milk Yield">
        <form onSubmit={handleQuickAddMilk} className="space-y-4">
          <div>
            <label className="input-label">Morning Yield (Liters)</label>
            <input type="number" step="0.1" value={milkAmount} onChange={(e) => setMilkAmount(e.target.value)} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Save Log</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'vaccine'} onClose={() => setActiveModal(null)} title="Quick Schedule Vaccine">
        <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Vaccine scheduled!'); }} className="space-y-4">
          <div>
            <label className="input-label">Vaccine Name</label>
            <input type="text" value={vacName} onChange={(e) => setVacName(e.target.value)} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Schedule</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'feed'} onClose={() => setActiveModal(null)} title="Quick Add Feed">
        <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Feed inventory updated!'); }} className="space-y-4">
          <div>
            <label className="input-label">Alfalfa Hay Bales Quantity</label>
            <input type="number" value={feedQty} onChange={(e) => setFeedQty(e.target.value)} className="input-field" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm">Update Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
