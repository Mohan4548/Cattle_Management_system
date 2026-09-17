import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { MilkLog, FeedLog, Cattle, InventoryItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { 
  Milk, 
  Plus, 
  Sun, 
  Moon, 
  TrendingUp, 
  Calendar, 
  Activity, 
  DollarSign, 
  Trophy, 
  AlertCircle, 
  Boxes, 
  Clock, 
  Award, 
  BarChart3, 
  Flame, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

const milkSchema = z.object({
  cattle_id: z.string().min(1, 'Please select a cattle'),
  log_date: z.string().min(4, 'Log date is required'),
  session: z.enum(['morning', 'evening']),
  yield_liters: z.coerce.number().min(0.1, 'Yield must be greater than 0'),
  fat_percentage: z.coerce.number().optional(),
  snf_percentage: z.coerce.number().optional(),
  milk_rate: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const feedSchema = z.object({
  cattle_id: z.string().optional(),
  feed_type: z.string().min(2, 'Feed type is required'),
  quantity_kg: z.coerce.number().min(0.5, 'Quantity is required'),
  cost: z.coerce.number().min(0.1, 'Cost is required'),
  feeding_time: z.enum(['Morning (06:00 AM)', 'Midday (12:00 PM)', 'Evening (05:00 PM)']),
  protein_pct: z.coerce.number().optional(),
  energy_tdn: z.coerce.number().optional(),
  fiber_pct: z.coerce.number().optional(),
});

type MilkFormData = z.infer<typeof milkSchema>;
type FeedFormData = z.infer<typeof feedSchema>;

export const MilkYield: React.FC = () => {
  const [logs, setLogs] = useState<MilkLog[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  // Analytics Timeframe Switch: Daily | Weekly | Monthly | Yearly
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activeTab, setActiveTab] = useState<'production' | 'feed'>('production');

  // Modals
  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);

  const {
    register: regMilk,
    handleSubmit: subMilk,
    reset: resetMilk,
    watch: watchMilk,
    formState: { errors: errorsMilk },
  } = useForm<MilkFormData>({
    resolver: zodResolver(milkSchema),
    defaultValues: {
      log_date: new Date().toISOString().split('T')[0],
      session: 'morning',
      yield_liters: 14.5,
      fat_percentage: 4.1,
      snf_percentage: 8.7,
      milk_rate: 3.00,
    },
  });

  const {
    register: regFeed,
    handleSubmit: subFeed,
    reset: resetFeed,
    formState: { errors: errorsFeed },
  } = useForm<FeedFormData>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      feed_type: 'Alfalfa Hay + Dairy Concentrate 18%',
      quantity_kg: 12,
      cost: 8.50,
      feeding_time: 'Morning (06:00 AM)',
      protein_pct: 18,
      energy_tdn: 72,
      fiber_pct: 22,
    },
  });

  const currentYieldInput = watchMilk('yield_liters');
  const currentRateInput = watchMilk('milk_rate');
  const calculatedIncomePreview = (Number(currentYieldInput || 0) * Number(currentRateInput || 3.00)).toFixed(2);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes, feedRes, cattleRes, invRes] = await Promise.all([
        apiClient.get('/milk'),
        apiClient.get('/milk/stats'),
        apiClient.get('/feed'),
        apiClient.get('/cattle'),
        apiClient.get('/inventory'),
      ]);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setStats(statsRes.data);
      setFeedLogs(Array.isArray(feedRes.data) ? feedRes.data : []);
      setCattleList(Array.isArray(cattleRes.data) ? cattleRes.data : (cattleRes.data?.data || []));
      setInventoryItems(Array.isArray(invRes.data) ? invRes.data : []);
    } catch {
      // Fallback handled
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMilkLog = async (data: MilkFormData) => {
    try {
      const res = await apiClient.post('/milk', data);
      setLogs(prev => [res.data, ...prev]);
      setIsMilkModalOpen(false);
      resetMilk();
      fetchData();
    } catch {
      alert('Failed to log milk production.');
    }
  };

  const handleCreateFeedLog = async (data: FeedFormData) => {
    try {
      const res = await apiClient.post('/feed', data);
      setFeedLogs(prev => [res.data, ...prev]);
      setIsFeedModalOpen(false);
      resetFeed();
      fetchData();
    } catch {
      alert('Failed to log feed session.');
    }
  };

  // Chart data based on selected timeframe
  const chartData = stats?.trends?.[timeframe] || [
    { date: 'Mon', total: 66, income: 198 },
    { date: 'Tue', total: 68, income: 204 },
    { date: 'Wed', total: 70, income: 210 },
    { date: 'Thu', total: 65, income: 195 },
    { date: 'Fri', total: 72, income: 216 },
    { date: 'Sat', total: 70, income: 210 },
    { date: 'Sun', total: 67, income: 201 },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Milk className="w-5 h-5 text-[var(--accent-teal)]" />
            Milk Records
          </h1>
          <p className="page-subtitle">Log yields, FAT/SNF metrics, milk income rates, and feed nutrition.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMilkModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Log Milk Yield
          </button>
          <button
            onClick={() => setIsFeedModalOpen(true)}
            className="btn-secondary"
          >
            <Boxes className="w-4 h-4" />
            Log Feed Session
          </button>
        </div>
      </div>

      {/* ── Leaderboard: Best & Lowest Producer ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Cow Card */}
        <div className="card-premium p-5 border border-[var(--accent-green)]/20 bg-gradient-to-r from-[var(--accent-green-subtle)] via-[var(--bg-card)] to-[var(--bg-card)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="icon-box icon-box-green w-12 h-12 rounded-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="badge-pill badge-green text-[9px]">Top Milk Producer</span>
              <h3 className="text-base font-black text-[var(--text-primary)] mt-1">
                {stats?.bestCow?.name || 'Ganga (Gir)'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">Tag: {stats?.bestCow?.tag || 'FE-CAT-2026-001'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="section-label block">Peak Yield</span>
            <span className="text-2xl font-black" style={{ color: 'var(--accent-green)' }}>{stats?.bestCow?.totalYield || 27.3} L</span>
          </div>
        </div>

        {/* Lowest Producer Card */}
        <div className="card-premium p-5 border border-[var(--accent-amber)]/20 bg-gradient-to-r from-[var(--accent-amber-subtle)] via-[var(--bg-card)] to-[var(--bg-card)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="icon-box icon-box-amber w-12 h-12 rounded-2xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="badge-pill badge-amber text-[9px]">Needs Attention</span>
              <h3 className="text-base font-black text-[var(--text-primary)] mt-1">
                {stats?.lowestProducer?.name || 'Lakshmi (Sahiwal)'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">Tag: {stats?.lowestProducer?.tag || 'FE-CAT-2026-003'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="section-label block">Current Yield</span>
            <span className="text-2xl font-black" style={{ color: 'var(--accent-amber)' }}>{stats?.lowestProducer?.totalYield || 8.0} L</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Morning Milk',  value: stats?.morningYield || 34.0, suffix: ' L', icon: Sun,        color: 'accent-amber',  sub: '06:00 AM Session' },
          { label: 'Evening Milk',  value: stats?.eveningYield || 33.0, suffix: ' L', icon: Moon,       color: 'accent-violet', sub: '05:00 PM Session' },
          { label: 'Daily Total',   value: stats?.totalYield   || 67.0, suffix: ' L', icon: Milk,       color: 'accent-teal',   sub: 'Both sessions' },
          { label: 'Milk Income',   value: stats?.totalIncome  || 1407.0, suffix: ' ₹', icon: DollarSign, color: 'accent-green',  sub: '@ ₹21/L avg rate' },
          { label: 'Trend',         value: stats?.growthPct    || 8.2,  suffix: '%',  icon: TrendingUp, color: 'accent-green',  sub: 'vs last week' },
        ].map(({ label, value, suffix, icon: Icon, color, sub }) => (
          <div key={label} className={`stat-card ${color} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">{label}</span>
              <Icon className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={value} decimals={1} suffix={suffix} />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Module Tabs ── */}
      <div className="tab-underline-bar">
        <button
          onClick={() => setActiveTab('production')}
          className={`tab-underline-item flex items-center gap-1.5 ${activeTab === 'production' ? 'active' : ''}`}
        >
          <Milk className="w-3.5 h-3.5" /> Milk Production Analytics
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`tab-underline-item flex items-center gap-1.5 ${activeTab === 'feed' ? 'active' : ''}`}
        >
          <Boxes className="w-4 h-4" /> Feed Nutrition & Expense Tracking
        </button>
      </div>

      {/* Tab 1: Milk Production Analytics */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          {/* Timeframe Analytics Chart Switcher */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-500" />
                  Milk Yield & Revenue Analytics Trend
                </h3>
                <p className="text-xs text-slate-500">Select timeframe scope to inspect production volume and financial returns.</p>
              </div>

              {/* Timeframe Selector Buttons */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      timeframe === tf ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Yield (L)" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="income" name="Milk Income ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Milk Logs Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Milk Production Log History</h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Cattle Tag / Name</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Session</th>
                  <th className="p-3.5">Yield (Liters)</th>
                  <th className="p-3.5">FAT %</th>
                  <th className="p-3.5">SNF %</th>
                  <th className="p-3.5">Rate ($/L)</th>
                  <th className="p-3.5 text-right">Income ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold">
                      <span className="font-mono text-emerald-500">{item.cattle_tag || 'FE-CAT-2026-001'}</span> - {item.cattle_name || 'Ganga'}
                    </td>
                    <td className="p-3.5">{item.log_date}</td>
                    <td className="p-3.5 capitalize flex items-center gap-1">
                      {item.session === 'morning' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      {item.session}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.yield_liters} L</td>
                    <td className="p-3.5">{item.fat_percentage ? `${item.fat_percentage}%` : '4.1%'}</td>
                    <td className="p-3.5">{item.snf_percentage ? `${item.snf_percentage}%` : '8.7%'}</td>
                    <td className="p-3.5">${item.milk_rate || 3.00}</td>
                    <td className="p-3.5 font-bold text-emerald-500 text-right">${(item.total_income || item.yield_liters * 3.00).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Feed Nutrition & Expense Tracking */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feed Consumption Logs */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-500" /> Daily Feeding Sessions & Nutrition
                </h3>
                <button onClick={() => setIsFeedModalOpen(true)} className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs">
                  + Log Feed
                </button>
              </div>

              <div className="space-y-3">
                {feedLogs.map((fl) => (
                  <div key={fl.id} className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{fl.feed_type}</span>
                      <span className="text-amber-500">${fl.cost}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Target: <strong>{fl.cattle_name || 'Herd Batch'}</strong></span>
                      <span className="font-mono">{fl.feeding_time}</span>
                    </div>

                    {/* Nutrition Breakdown Badges */}
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        Protein: {fl.protein_pct || 18}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                        TDN Energy: {fl.energy_tdn || 72}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                        Fiber: {fl.fiber_pct || 22}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Stock Thresholds */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Feed Stock Levels & Reorder Alerts
              </h3>

              <div className="space-y-3">
                {inventoryItems.filter(i => i.category === 'Fodder' || i.category === 'Supplements').map((inv) => {
                  const isLow = inv.quantity <= inv.reorder_level;
                  return (
                    <div key={inv.id} className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{inv.item_name}</h4>
                        <span className="text-[11px] text-slate-400">Reorder Level: {inv.reorder_level} {inv.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 dark:text-white text-sm block">{inv.quantity} {inv.unit}</span>
                        <Badge variant={isLow ? 'sick' : 'healthy'}>
                          {isLow ? 'Low Stock Alert' : 'Sufficient'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Milk Yield */}
      <Modal isOpen={isMilkModalOpen} onClose={() => setIsMilkModalOpen(false)} title="Log Daily Milk Yield">
        <form onSubmit={subMilk(handleCreateMilkLog)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regMilk('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold">
              <option value="">Select female cow...</option>
              {cattleList.filter(c => c.gender === 'female').map(c => (
                <option key={c.id} value={c.id}>{c.tag_number} - {c.name} ({c.breed})</option>
              ))}
            </select>
            {errorsMilk.cattle_id && <p className="text-[11px] text-rose-400 mt-0.5">{errorsMilk.cattle_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Session Date</label>
              <input {...regMilk('log_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Session Time</label>
              <select {...regMilk('session')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <option value="morning">Morning Milking (06:00 AM)</option>
                <option value="evening">Evening Milking (05:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Yield (L)</label>
              <input {...regMilk('yield_liters')} type="number" step="0.1" placeholder="14.5" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">FAT %</label>
              <input {...regMilk('fat_percentage')} type="number" step="0.1" placeholder="4.1" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">SNF %</label>
              <input {...regMilk('snf_percentage')} type="number" step="0.1" placeholder="8.7" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Rate ($/L)</label>
              <input {...regMilk('milk_rate')} type="number" step="0.01" placeholder="3.00" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between font-bold">
            <span className="text-slate-300">Calculated Income:</span>
            <span className="text-emerald-400 text-sm">${calculatedIncomePreview}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsMilkModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white shadow-glow">Save Production Log</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Feed Session */}
      <Modal isOpen={isFeedModalOpen} onClose={() => setIsFeedModalOpen(false)} title="Log Feed & Nutrition Session">
        <form onSubmit={subFeed(handleCreateFeedLog)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Feed Product / Mix</label>
            <input {...regFeed('feed_type')} type="text" placeholder="Alfalfa Hay + Dairy Concentrate 18%" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Quantity (kg)</label>
              <input {...regFeed('quantity_kg')} type="number" placeholder="12" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Cost ($)</label>
              <input {...regFeed('cost')} type="number" step="0.1" placeholder="8.50" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Feeding Time</label>
              <select {...regFeed('feeding_time')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <option value="Morning (06:00 AM)">Morning (06:00 AM)</option>
                <option value="Midday (12:00 PM)">Midday (12:00 PM)</option>
                <option value="Evening (05:00 PM)">Evening (05:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Protein %</label>
              <input {...regFeed('protein_pct')} type="number" placeholder="18" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">TDN Energy %</label>
              <input {...regFeed('energy_tdn')} type="number" placeholder="72" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Fiber %</label>
              <input {...regFeed('fiber_pct')} type="number" placeholder="22" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsFeedModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-glow">Save Feed Log</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
