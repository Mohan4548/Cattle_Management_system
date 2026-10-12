import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { DashboardData } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useToast } from '../context/ToastContext';
import { 
  Beef, 
  Milk, 
  TrendingUp, 
  Boxes, 
  Syringe, 
  Search, 
  Filter, 
  Plus, 
  Activity, 
  Bell, 
  Droplet, 
  ArrowUpRight, 
  PieChart as PieIcon, 
  BarChart3, 
  ScanLine,
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


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

  const { showToast } = useToast();
  const [cattleList, setCattleList] = useState<any[]>([]);

  // Quick Action Modals
  const [activeModal, setActiveModal] = useState<'cattle' | 'milk' | 'vaccine' | 'feed' | null>(null);

  // Form inputs for Quick Actions
  const [newTag, setNewTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('Gir');
  const [newGender, setNewGender] = useState<'female' | 'male'>('female');
  const [newWeight, setNewWeight] = useState('480');

  const [selectedCowId, setSelectedCowId] = useState('');
  const [milkSession, setMilkSession] = useState<'morning' | 'evening'>('morning');
  const [milkAmount, setMilkAmount] = useState('14.5');
  const [fatPct, setFatPct] = useState('4.2');

  const [vacCowId, setVacCowId] = useState('');
  const [vacName, setVacName] = useState('Foot & Mouth (FMD) Booster');
  const [vacDate, setVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [vacDueDate, setVacDueDate] = useState(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);

  const [feedCowId, setFeedCowId] = useState('');
  const [feedType, setFeedType] = useState('Alfalfa Hay Bales');
  const [feedQty, setFeedQty] = useState('50');

  const fetchDashboardData = async () => {
    try {
      const [res, cRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/cattle'),
      ]);
      setData(res.data);
      const list = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []);
      setCattleList(list);
      if (list.length > 0) {
        setSelectedCowId(prev => prev || list[0].id);
        setVacCowId(prev => prev || list[0].id);
        setFeedCowId(prev => prev || list[0].id);
      }
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
      const tag = newTag.trim() || `FE-CAT-${Math.floor(100 + Math.random() * 900)}`;
      const name = newName.trim() || 'Sundari';
      await apiClient.post('/cattle', {
        tag_number: tag,
        name,
        breed: newBreed,
        gender: newGender,
        date_of_birth: '2023-01-01',
        weight_kg: Number(newWeight) || 480,
        health_status: 'healthy',
        lactation_stage: newGender === 'female' ? 'mid' : 'dry',
      });
      setActiveModal(null);
      setNewTag('');
      setNewName('');
      showToast(`Livestock ${name} (${tag}) registered into Herd Directory!`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to register cattle.', 'error');
    }
  };

  const handleQuickAddMilk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cowId = selectedCowId || cattleList[0]?.id || 'cattle-1';
      await apiClient.post('/milk', {
        cattle_id: cowId,
        log_date: new Date().toISOString().split('T')[0],
        session: milkSession,
        yield_liters: Number(milkAmount) || 12,
        fat_percentage: Number(fatPct) || 4.2,
        snf_percentage: 8.7,
      });
      setActiveModal(null);
      showToast(`Logged ${milkAmount} L milk production for ${milkSession} session!`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to log milk production.', 'error');
    }
  };

  const handleQuickScheduleVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cowId = vacCowId || cattleList[0]?.id || 'cattle-1';
      await apiClient.post('/vaccinations', {
        cattle_id: cowId,
        vaccine_name: vacName,
        administered_date: vacDate,
        next_due_date: vacDueDate,
        administered_by: 'Dr. Marcus Vance',
        status: 'scheduled',
      });
      setActiveModal(null);
      showToast(`Vaccine ${vacName} scheduled successfully!`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to schedule vaccine.', 'error');
    }
  };

  const handleQuickAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cowId = feedCowId || cattleList[0]?.id || 'cattle-1';
      await apiClient.post('/feed', {
        cattle_id: cowId,
        feed_type: feedType,
        quantity_kg: Number(feedQty) || 50,
        cost: (Number(feedQty) || 50) * 22,
        feeding_time: 'Morning Shift',
      });
      setActiveModal(null);
      showToast(`Restocked ${feedQty} kg of ${feedType}!`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to update feed stock.', 'error');
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
      {/* ── Enterprise Command Header ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Operational Telemetry Active
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Farm Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cattle diagnostics, milk collection, and livestock financial records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time range switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveModal('cattle')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Cattle
          </button>
          <button
            onClick={() => navigate('/qr-scanner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            Scan QR Tag
          </button>
        </div>
      </div>

      {/* ── Enterprise KPI Command Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Herd */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Registered Herd
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Beef className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <AnimatedCounter value={kpi.totalCattle} />
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Head Total</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">{kpi.healthyCattle}</strong> Healthy · <strong className="text-slate-700 dark:text-slate-300 font-semibold">{kpi.pregnantCattle}</strong> Gestating
            </span>
            <Link to="/cattle" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-[11px]">
              Roster →
            </Link>
          </div>
        </div>

        {/* Card 2: Milk Yield */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Daily Harvest Volume
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <AnimatedCounter value={kpi.milkToday} decimals={1} suffix=" L" />
              </span>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                Today
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Month to Date: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{kpi.milkThisMonth.toLocaleString()} L</strong>
            </span>
            <Link to="/milk" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-[11px]">
              Logs →
            </Link>
          </div>
        </div>

        {/* Card 3: Financial Net Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Operating Net Margin
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <AnimatedCounter value={kpi.profit} prefix="₹" decimals={0} />
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Expenses: ₹{kpi.expenses.toLocaleString('en-IN')}
            </span>
            <Link to="/financials" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-[11px]">
              Ledger →
            </Link>
          </div>
        </div>

        {/* Card 4: Action Items & Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Operational Tasks Due
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <AnimatedCounter value={kpi.vaccinationsDue + kpi.todaysTasks} />
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Scheduled Actions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {kpi.vaccinationsDue} Vax Due · {kpi.todaysTasks} Routine Tasks
            </span>
            <Link to="/tasks" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline text-[11px]">
              Board →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Professional Operations Shortcut Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Quick Operations
          </span>
          <span className="text-[11px] text-slate-400">Standard operational logging</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { label: 'Register Cattle', icon: Beef, action: () => setActiveModal('cattle') },
            { label: 'Record Milk Batch', icon: Milk, action: () => setActiveModal('milk') },
            { label: 'Scan QR Ear Tag', icon: ScanLine, action: () => navigate('/qr-scanner') },
            { label: 'Schedule Vaccine', icon: Syringe, action: () => setActiveModal('vaccine') },
            { label: 'Update Feed Stock', icon: Boxes, action: () => setActiveModal('feed') },
          ].map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-200/70 dark:border-slate-600/60 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:border-emerald-200">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary Operational Charts (Milk Harvest & Genetics Mix) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Milk Production Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Milk className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Milk Production Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Morning · Evening · Total Daily Harvest (Liters)</p>
            </div>
            <Link to="/milk" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors">
              Milk Records <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.milkTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalYieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
                <Area type="monotone" dataKey="total" name="Total (L)" stroke="#047857" strokeWidth={2.2} fill="url(#totalYieldGrad)" />
                <Area type="monotone" dataKey="morning" name="Morning" stroke="#d97706" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="evening" name="Evening" stroke="#7c3aed" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breed Distribution (1 column) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <PieIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Herd Breed Mix
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
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
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {breedData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Financial Ledger & Operational Activity Log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Monthly Income vs Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Operating revenue vs cost breakdown</p>
            </div>
            <Link to="/financials" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors">
              Finance Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.financialTrend || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: 'var(--text-secondary)' }} />
                <Bar dataKey="income" name="Income" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Operational Audit Log */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Recent Operational Activity
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">{filteredActivities.length} logs recorded</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredActivities.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400">No operational activity recorded yet</p>
                </div>
              ) : filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{act.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">by {act.user_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals (all business logic preserved) ── */}
      {/* ── Quick Action Modals ── */}
      <Modal isOpen={activeModal === 'cattle'} onClose={() => setActiveModal(null)} title="Quick Register Cattle">
        <form onSubmit={handleQuickAddCattle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Tag Number / Ear Tag</label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g. FE-GIR-007"
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Livestock Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sundari"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="input-label">Breed</label>
              <select
                value={newBreed}
                onChange={(e) => setNewBreed(e.target.value)}
                className="input-field"
              >
                <option value="Gir">Gir</option>
                <option value="Holstein Friesian">Holstein Friesian</option>
                <option value="Jersey">Jersey</option>
                <option value="Sahiwal">Sahiwal</option>
                <option value="Red Sindhi">Red Sindhi</option>
                <option value="Tharparkar">Tharparkar</option>
              </select>
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as any)}
                className="input-field"
              >
                <option value="female">Cow (Female)</option>
                <option value="male">Bull (Male)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Weight (kg)</label>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="480"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Register Livestock
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'milk'} onClose={() => setActiveModal(null)} title="Quick Log Milk Yield">
        <form onSubmit={handleQuickAddMilk} className="space-y-4">
          <div>
            <label className="input-label">Select Cow</label>
            <select
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value)}
              className="input-field"
            >
              {cattleList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tag_number || c.tag_id}) — {c.breed}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="input-label">Milking Session</label>
              <select
                value={milkSession}
                onChange={(e) => setMilkSession(e.target.value as any)}
                className="input-field"
              >
                <option value="morning">Morning (06:00 AM)</option>
                <option value="evening">Evening (05:00 PM)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Yield (Liters)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                value={milkAmount}
                onChange={(e) => setMilkAmount(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Fat %</label>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="9.0"
                value={fatPct}
                onChange={(e) => setFatPct(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm flex items-center gap-1.5">
              <Droplet className="w-4 h-4" />
              Save Milk Log
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'vaccine'} onClose={() => setActiveModal(null)} title="Quick Schedule Vaccine">
        <form onSubmit={handleQuickScheduleVaccine} className="space-y-4">
          <div>
            <label className="input-label">Target Cattle</label>
            <select
              value={vacCowId}
              onChange={(e) => setVacCowId(e.target.value)}
              className="input-field"
            >
              {cattleList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tag_number || c.tag_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Vaccine / Biological</label>
            <select
              value={vacName}
              onChange={(e) => setVacName(e.target.value)}
              className="input-field"
            >
              <option value="Foot & Mouth (FMD) Booster">Foot & Mouth (FMD) Booster</option>
              <option value="Anthrax Spore Vaccine">Anthrax Spore Vaccine</option>
              <option value="Blackquarter (BQ) Vaccine">Blackquarter (BQ) Vaccine</option>
              <option value="Brucellosis S19 Strain">Brucellosis S19 Strain</option>
              <option value="Hemorrhagic Septicemia (HS)">Hemorrhagic Septicemia (HS)</option>
              <option value="Rabies Inactivated Booster">Rabies Inactivated Booster</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Administration Date</label>
              <input
                type="date"
                value={vacDate}
                onChange={(e) => setVacDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Next Booster Due</label>
              <input
                type="date"
                value={vacDueDate}
                onChange={(e) => setVacDueDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm flex items-center gap-1.5">
              <Syringe className="w-4 h-4" />
              Schedule Vaccine
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'feed'} onClose={() => setActiveModal(null)} title="Quick Add Feed / Restock">
        <form onSubmit={handleQuickAddFeed} className="space-y-4">
          <div>
            <label className="input-label">Feed Type / Fodder</label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              className="input-field"
            >
              <option value="Alfalfa Hay Bales">Alfalfa Hay Bales</option>
              <option value="Dairy Concentrate 18% Protein">Dairy Concentrate 18% Protein</option>
              <option value="Green Maize Fresh Fodder">Green Maize Fresh Fodder</option>
              <option value="Corn Silage Premium Grade">Corn Silage Premium Grade</option>
              <option value="Chelated Mineral & Salt Mixture">Chelated Mineral & Salt Mixture</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Quantity (kg / Units)</label>
              <input
                type="number"
                min="5"
                max="1000"
                value={feedQty}
                onChange={(e) => setFeedQty(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Assigned Batch / Cow</label>
              <select
                value={feedCowId}
                onChange={(e) => setFeedCowId(e.target.value)}
                className="input-field"
              >
                <option value="">All Herd Barn Distribution</option>
                {cattleList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tag_number || c.tag_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm flex items-center gap-1.5">
              <Boxes className="w-4 h-4" />
              Update Stock & Log Feed
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
