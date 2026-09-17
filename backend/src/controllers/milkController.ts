import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { MilkLog, FeedLog } from '../types/index.js';

export const INITIAL_FEED_LOGS: FeedLog[] = [
  { id: 'fl-1', cattle_id: 'cattle-1', cattle_name: 'Ganga (Gir)', feed_type: 'Alfalfa Hay + Dairy Concentrate 18%', quantity_kg: 12, cost: 8.50, feeding_time: 'Morning (06:00 AM)', protein_pct: 18, energy_tdn: 72, fiber_pct: 22, recorded_by: 'Carlos Ruiz', log_date: '2026-08-09', created_at: '2026-08-09T06:00:00Z' },
  { id: 'fl-2', cattle_id: 'cattle-2', cattle_name: 'Kaveri (Kangayam)', feed_type: 'Green Maize Fodder & Mineral Mixture', quantity_kg: 15, cost: 7.20, feeding_time: 'Morning (06:00 AM)', protein_pct: 14, energy_tdn: 68, fiber_pct: 26, recorded_by: 'Carlos Ruiz', log_date: '2026-08-09', created_at: '2026-08-09T06:15:00Z' },
  { id: 'fl-3', cattle_id: 'cattle-3', cattle_name: 'Lakshmi (Sahiwal)', feed_type: 'Silage & Medicated Feed Supplement', quantity_kg: 10, cost: 9.00, feeding_time: 'Evening (05:00 PM)', protein_pct: 16, energy_tdn: 70, fiber_pct: 24, recorded_by: 'Carlos Ruiz', log_date: '2026-08-09', created_at: '2026-08-09T17:00:00Z' },
];

let feedLogStore = [...INITIAL_FEED_LOGS];

export const getMilkLogs = async (req: Request, res: Response) => {
  const { date, cattle_id } = req.query;
  let result = [...store.milkLogs];

  if (date) {
    result = result.filter(m => m.log_date === date);
  }

  if (cattle_id) {
    result = result.filter(m => m.cattle_id === cattle_id);
  }

  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json(result);
};

export const createMilkLog = async (req: Request, res: Response) => {
  const { cattle_id, log_date, session, yield_liters, fat_percentage, snf_percentage, milk_rate, notes, recorded_by } = req.body;

  if (!cattle_id || !session || yield_liters === undefined) {
    return res.status(400).json({ message: 'Cattle ID, session, and yield in liters are required' });
  }

  const cattle = store.cattle.find(c => c.id === cattle_id);
  const rate = milk_rate ? Number(milk_rate) : 3.00; // $3.00 per liter
  const totalIncome = Number(yield_liters) * rate;

  const newLog: MilkLog = {
    id: `ml-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    log_date: log_date || new Date().toISOString().split('T')[0],
    session,
    yield_liters: Number(yield_liters),
    fat_percentage: fat_percentage ? Number(fat_percentage) : 4.1,
    snf_percentage: snf_percentage ? Number(snf_percentage) : 8.7,
    milk_rate: rate,
    total_income: totalIncome,
    notes,
    recorded_by: recorded_by || 'Carlos Ruiz',
    created_at: new Date().toISOString(),
  };

  store.milkLogs.unshift(newLog);

  // Auto record income transaction
  store.transactions.unshift({
    id: `tx-milk-${Date.now()}`,
    type: 'income',
    category: 'Milk Sale',
    amount: totalIncome,
    transaction_date: newLog.log_date,
    description: `Milk sale for ${newLog.cattle_name} (${newLog.yield_liters} L @ $${rate}/L)`,
    reference_id: `MILK-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  return res.status(201).json(newLog);
};

export const getMilkStats = async (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = store.milkLogs.filter(m => m.log_date === today);
  const totalTodayYield = todayLogs.reduce((acc, curr) => acc + curr.yield_liters, 0) || 67.0;

  const morningYield = todayLogs.filter(m => m.session === 'morning').reduce((acc, curr) => acc + curr.yield_liters, 0) || 34.0;
  const eveningYield = todayLogs.filter(m => m.session === 'evening').reduce((acc, curr) => acc + curr.yield_liters, 0) || 33.0;

  const lactatingCount = store.cattle.filter(c => ['early', 'mid', 'late'].includes(c.lactation_stage)).length || 3;
  const avgYieldPerCow = lactatingCount > 0 ? (totalTodayYield / lactatingCount).toFixed(1) : 22.3;

  // Best Cow & Lowest Producer Leaderboard
  const cowTotals: Record<string, { name: string; tag: string; totalYield: number }> = {};
  store.milkLogs.forEach(m => {
    if (!cowTotals[m.cattle_id]) {
      cowTotals[m.cattle_id] = { name: m.cattle_name || 'Bella', tag: m.cattle_tag || 'FE-101', totalYield: 0 };
    }
    cowTotals[m.cattle_id].totalYield += m.yield_liters;
  });

  const sortedCows = Object.values(cowTotals).sort((a, b) => b.totalYield - a.totalYield);
  const bestCow = sortedCows[0] || { name: 'Ganga (Gir)', tag: 'FE-CAT-2026-001', totalYield: 27.3 };
  const lowestProducer = sortedCows[sortedCows.length - 1] || { name: 'Lakshmi (Sahiwal)', tag: 'FE-CAT-2026-003', totalYield: 8.0 };

  // Analytics Trends: Daily, Weekly, Monthly, Yearly
  const dailyTrend = [
    { label: '06:00 AM (Morning)', yield: morningYield },
    { label: '05:00 PM (Evening)', yield: eveningYield },
  ];

  const weeklyTrend = [
    { date: 'Mon', morning: 34, evening: 32, total: 66, income: 198 },
    { date: 'Tue', morning: 35, evening: 33, total: 68, income: 204 },
    { date: 'Wed', morning: 36, evening: 34, total: 70, income: 210 },
    { date: 'Thu', morning: 33, evening: 32, total: 65, income: 195 },
    { date: 'Fri', morning: 37, evening: 35, total: 72, income: 216 },
    { date: 'Sat', morning: 36, evening: 34, total: 70, income: 210 },
    { date: 'Sun', morning: morningYield, evening: eveningYield, total: totalTodayYield, income: totalTodayYield * 3 },
  ];

  const monthlyTrend = [
    { date: 'Week 1', yield: 460, income: 1380 },
    { date: 'Week 2', yield: 480, income: 1440 },
    { date: 'Week 3', yield: 510, income: 1530 },
    { date: 'Week 4', yield: 495, income: 1485 },
  ];

  const yearlyTrend = [
    { date: 'Q1', yield: 5200, income: 15600 },
    { date: 'Q2', yield: 5800, income: 17400 },
    { date: 'Q3', yield: 6100, income: 18300 },
    { date: 'Q4', yield: 5900, income: 17700 },
  ];

  return res.json({
    totalTodayYield,
    morningYield,
    eveningYield,
    avgYieldPerCow: Number(avgYieldPerCow),
    lactatingCount,
    bestCow,
    lowestProducer,
    milkRate: 3.00,
    totalTodayIncome: totalTodayYield * 3.00,
    trends: {
      daily: dailyTrend,
      weekly: weeklyTrend,
      monthly: monthlyTrend,
      yearly: yearlyTrend,
    },
  });
};

// Feed Module Endpoints
export const getFeedLogs = async (req: Request, res: Response) => {
  return res.json(feedLogStore);
};

export const createFeedLog = async (req: Request, res: Response) => {
  const { cattle_id, feed_type, quantity_kg, cost, feeding_time, protein_pct, energy_tdn, fiber_pct } = req.body;

  if (!feed_type || !quantity_kg) {
    return res.status(400).json({ message: 'Feed type and quantity in kg are required' });
  }

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newLog: FeedLog = {
    id: `fl-${Date.now()}`,
    cattle_id,
    cattle_name: cattle?.name || 'Herd Batch Feed',
    feed_type,
    quantity_kg: Number(quantity_kg),
    cost: Number(cost) || 7.50,
    feeding_time: feeding_time || 'Morning (06:00 AM)',
    protein_pct: protein_pct ? Number(protein_pct) : 18,
    energy_tdn: energy_tdn ? Number(energy_tdn) : 72,
    fiber_pct: fiber_pct ? Number(fiber_pct) : 22,
    recorded_by: 'Carlos Ruiz',
    log_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  feedLogStore.unshift(newLog);

  // Auto record feed expense transaction
  store.transactions.unshift({
    id: `tx-feed-${Date.now()}`,
    type: 'expense',
    category: 'Feed Purchase',
    amount: newLog.cost,
    transaction_date: newLog.log_date,
    description: `Daily feed: ${feed_type} (${quantity_kg} kg)`,
    reference_id: `FEED-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  return res.status(201).json(newLog);
};
