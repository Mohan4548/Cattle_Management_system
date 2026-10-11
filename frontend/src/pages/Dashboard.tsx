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

  // Only show if there are actual cattle requiring attention or high/medium risk alerts
  if (!summary || ((summary.cattleRequiringAttention?.length ?? 0) === 0 && (summary.highRiskCount ?? 0) === 0 && (summary.mediumRiskCount ?? 0) === 0)) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Health Attention Required
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 rounded">
              {summary.highRiskCount} High Risk
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
            {summary.cattleRequiringAttention?.length || 0} cattle require clinical review ({summary.highRiskCount || 0} High, {summary.mediumRiskCount || 0} Medium risk)
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/ai-insights')}
        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
      >
        Review Alerts →
      </button>
    </div>
  );
};
// ─── AI Breeding Summary Widget ────────────────────────────────────────────────
const AIBreedingSummaryWidget: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<any>(null);

  React.useEffect(() => {
    apiClient.get('/farm/breeding-insights')
      .then(res => setSummary(res.data))
      .catch(() => {});
  }, []);

  if (!summary || !summary.summary?.hasData) return null;

  return (
    <div className="glass-card p-4 rounded-2xl border border-rose-500/20 dark:border-rose-800/40 bg-gradient-to-r from-rose-500/5 via-pink-500/5 to-purple-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-500/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              AI BREEDING OVERVIEW
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 rounded border border-rose-200 dark:border-rose-800">
              {summary.summary.confirmedPregnancies} Confirmed Pregnancies
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {summary.summary.upcomingDeliveries} upcoming estimated deliveries • {summary.attentionRequired?.length || 0} attention items
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/ai-insights?tab=breeding')}
        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
      >
        View AI Breeding Insights →
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

  const getGreetingName = () => {
    if (!user?.full_name) return 'Farmer';
    const parts = user.full_name.trim().split(/\s+/);
    if (parts[0].toLowerCase().startsWith('dr') && parts.length > 1) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  };

  const kpi = (data as any)?.kpi || (data ? {
    totalCattle: (data as any).totalCattle ?? 0,
    healthyCattle: (data as any).healthyCattle ?? 0,
    pregnantCattle: (data as any).pregnantCattle ?? 0,
    milkToday: (data as any).milkToday ?? 0,
    milkThisMonth: (data as any).milkThisMonth ?? 0,
    feedCost: (data as any).feedCost ?? 0,
    profit: (data as any).profit ?? 0,
    expenses: (data as any).expenses ?? 0,
    vaccinationsDue: (data as any).vaccinationsDue ?? 0,
    todaysTasks: (data as any).todaysTasks ?? 0,
    upcomingDeliveries: (data as any).upcomingDeliveries ?? 0,
  } : {
    totalCattle: 0,
    healthyCattle: 0,
    pregnantCattle: 0,
    milkToday: 0,
    milkThisMonth: 0,
    feedCost: 0,
    profit: 0,
    expenses: 0,
    vaccinationsDue: 0,
    todaysTasks: 0,
    upcomingDeliveries: 0,
  });

  const breedData = data?.charts?.breedDistribution || [
    { name: 'Holstein Friesian', value: 2, color: '#3b82f6' },
    { name: 'Jersey', value: 1, color: '#0ea5e9' },
    { name: 'Brown Swiss', value: 1, color: '#f59e0b' },
    { name: 'Angus', value: 1, color: '#6366f1' },
  ];

  const filteredActivities = (data?.recentActivities || []).filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* ── Modern Human Header ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Live Farm Operations
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Good morning, {getGreetingName()} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time cattle diagnostics, milk collection, and livestock financials.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time range switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveModal('cattle')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Cattle
          </button>
          <button
            onClick={() => navigate('/qr-scanner')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Scan QR
          </button>
        </div>
      </div>

      {/* AI Health Summary Widget */}
      <AIHealthSummaryWidget />

      {/* AI Breeding Overview Widget */}
      <AIBreedingSummaryWidget />

      {/* ── Core KPI Command Cards (High-Impact 4-Card Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Herd */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cattle</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Beef className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={kpi.totalCattle} />
              </span>
              <span className="text-xs text-slate-400 font-medium">registered head</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                {kpi.healthyCattle} Healthy
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                {kpi.pregnantCattle} Pregnant
              </span>
            </div>
            <Link to="/cattle" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Herd →
            </Link>
          </div>
        </div>

        {/* Card 2: Milk Yield */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Milk Yield</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Droplet className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={kpi.milkToday} decimals={1} suffix=" L" />
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                Today
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Month: <strong className="text-slate-800 dark:text-slate-200 font-bold">{kpi.milkThisMonth.toLocaleString()} L</strong>
            </span>
            <Link to="/milk" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
              Log Yield →
            </Link>
          </div>
        </div>

        {/* Card 3: Financial Net Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={kpi.profit} prefix="₹" decimals={0} />
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Expenses: ₹{kpi.expenses.toLocaleString('en-IN')}
            </span>
            <Link to="/financials" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              Ledger →
            </Link>
          </div>
        </div>

        {/* Card 4: Action Items & Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Actions</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bell className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={kpi.vaccinationsDue + kpi.todaysTasks} />
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">items to review</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {kpi.vaccinationsDue} Vax Due · {kpi.todaysTasks} Tasks
            </span>
            <Link to="/tasks" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
              Task Board →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Operations Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Quick Farm Operations
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Daily management shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Register Cattle', icon: Beef, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50', action: () => setActiveModal('cattle') },
            { label: 'Record Milk', icon: Milk, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50', action: () => setActiveModal('milk') },
            { label: 'Scan Cattle QR', icon: ScanLine, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50', action: () => navigate('/qr-scanner') },
            { label: 'Schedule Vaccine', icon: Syringe, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50', action: () => setActiveModal('vaccine') },
            { label: 'Update Feed Stock', icon: Boxes, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50', action: () => setActiveModal('feed') },
          ].map(({ label, icon: Icon, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all duration-150 text-left group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white leading-tight">
                {label}
              </span>
            </button>
          ))}
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
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
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
