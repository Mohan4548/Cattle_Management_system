import { Cattle, HealthRecord, MilkYieldRecord, FeedRecord, BreedingRecord, InventoryItem, FinancialTransaction, WorkerTask, UserProfile, AttendanceRecord, AuditLog, DigitalIdentity, Delivery } from '../types/index.js';
import { digitalIdentityService } from './digitalIdentityService.js';
import { idGenerator } from './digitalIdentityIdGenerator.js';

// ─── Dynamic Live Date Helpers ──────────────────────────────────────────────
const now = new Date();
const today = now.toISOString().split('T')[0];

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const monthsAgo = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split('T')[0];
};

// ─── Reset / Empty Data Store ───────────────────────────────────────────────
export const initialCattle: Cattle[] = [];
export const initialMilkRecords: MilkYieldRecord[] = [];
export const initialFeedRecords: FeedRecord[] = [];
export const initialBreedingRecords: BreedingRecord[] = [];
export const initialHealthRecords: HealthRecord[] = [];
export const initialVaccinations: any[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialFinancials: FinancialTransaction[] = [];
export const initialTasks: WorkerTask[] = [];
export const initialUsers: UserProfile[] = [];
export const initialAttendance: AttendanceRecord[] = [];
export const initialAuditLogs: AuditLog[] = [];
export const initialDeliveries: Delivery[] = [];
export const initialActivities: any[] = [];

export const DEFAULT_COW_IMAGES = [
  'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80'
];

export function calculateAgeFromDOB(dob: string): string {
  if (!dob) return 'N/A';
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} yrs ${months} mos`;
}

// ─── Central In-Memory Store ────────────────────────────────────────────────
export const store: any = {
  cattle: initialCattle,
  healthRecords: initialHealthRecords,
  milkRecords: initialMilkRecords,
  milkLogs: initialMilkRecords,
  feedRecords: initialFeedRecords,
  breedingRecords: initialBreedingRecords,
  inventory: initialInventory,
  financials: initialFinancials,
  transactions: initialFinancials,
  tasks: initialTasks,
  users: initialUsers,
  attendance: initialAttendance,
  auditLogs: initialAuditLogs,
  deliveries: initialDeliveries,
  purchaseDocuments: [] as any[],
  ownershipHistory: [] as any[],
  vaccinations: initialVaccinations,
  activities: initialActivities,
  digitalIdentities: [] as DigitalIdentity[],

  getDashboardStats: () => {
    const cattleList = store.cattle || [];
    const milkList = store.milkRecords || [];
    const feedList = store.feedRecords || [];
    const finList = store.financials || [];
    const tasksList = store.tasks || [];
    const breedingList = store.breedingRecords || [];
    const vaccinationsList = store.vaccinations || [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute live total milk today
    const milkTodayLiters = milkList
      .filter((m: any) => m.log_date === todayStr || m.date === todayStr)
      .reduce((sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0), 0);

    // Compute live monthly milk total
    const milkThisMonthLiters = milkList.reduce(
      (sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0),
      0
    );

    // Financial calculations
    const totalIncome = finList
      .filter((f: any) => f.type === 'income')
      .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
    const totalExpenses = finList
      .filter((f: any) => f.type === 'expense')
      .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
    const profitVal = totalIncome - totalExpenses;

    // Live Breed Distribution
    const breedCounts: Record<string, number> = {};
    cattleList.forEach((c: any) => {
      const b = c.breed || 'Other';
      breedCounts[b] = (breedCounts[b] || 0) + 1;
    });

    const breedColorMap: Record<string, string> = {
      'Gir': '#3b82f6',
      'Holstein Friesian': '#2563eb',
      'Jersey': '#6366f1',
      'Sahiwal': '#0ea5e9',
      'Red Sindhi': '#8b5cf6',
      'Tharparkar': '#f59e0b',
    };

    const breedDistribution = Object.entries(breedCounts).map(([name, value]) => ({
      name,
      value,
      color: breedColorMap[name] || '#64748b',
    }));

    // Live 7-Day Milk Production Trend
    const milkTrend = [6, 5, 4, 3, 2, 1, 0].map((d) => {
      const dayDate = daysAgo(d);
      const dayMilk = milkList.filter((m: any) => (m.log_date === dayDate || m.date === dayDate));
      const morning = dayMilk
        .filter((m: any) => m.session === 'morning')
        .reduce((sum: number, m: any) => sum + (Number(m.yield_liters) || Number(m.morning_yield) || 0), 0);
      const evening = dayMilk
        .filter((m: any) => m.session === 'evening')
        .reduce((sum: number, m: any) => sum + (Number(m.yield_liters) || Number(m.evening_yield) || 0), 0);
      return {
        date: new Date(dayDate).toLocaleDateString('en-US', { weekday: 'short' }),
        morning: Number(morning.toFixed(1)),
        evening: Number(evening.toFixed(1)),
        total: Number((morning + evening).toFixed(1)),
      };
    });

    // Live 6-Month Financial Trend
    const financialTrend = [5, 4, 3, 2, 1, 0].map((m) => {
      const mDate = new Date();
      mDate.setMonth(mDate.getMonth() - m);
      const monthPrefix = mDate.toISOString().slice(0, 7);
      const monthLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
      const income = finList
        .filter((f: any) => f.type === 'income' && (f.date || f.created_at || '').startsWith(monthPrefix))
        .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      const expense = finList
        .filter((f: any) => f.type === 'expense' && (f.date || f.created_at || '').startsWith(monthPrefix))
        .reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
      return {
        month: monthLabel,
        income,
        expense,
        profit: income - expense,
      };
    });

    return {
      kpi: {
        totalCattle: cattleList.length,
        healthyCattle: cattleList.filter((c: any) => c.status === 'healthy' || c.health_status === 'healthy').length,
        pregnantCattle: cattleList.filter((c: any) => c.status === 'pregnant' || c.health_status === 'pregnant').length,
        milkToday: Number(milkTodayLiters.toFixed(1)),
        milkThisMonth: Number(milkThisMonthLiters.toFixed(1)),
        feedCost: feedList.reduce((sum: number, r: any) => sum + (Number(r.cost) || 0), 0),
        profit: profitVal,
        expenses: totalExpenses,
        vaccinationsDue: vaccinationsList.filter((v: any) => v.status === 'scheduled' || (v.next_due_date && v.next_due_date <= todayStr)).length,
        todaysTasks: tasksList.filter((t: any) => t.status !== 'completed').length,
        upcomingDeliveries: breedingList.filter((b: any) => b.pregnancy_confirmed || b.status === 'confirmed').length,
      },
      charts: {
        milkTrend,
        financialTrend,
        breedDistribution,
      },
      recentActivities: store.activities,
      deliveries: store.deliveries,
      weather: {
        temp: 26,
        condition: 'Optimal',
        humidity: '50%',
        wind: '10 km/h',
        location: 'Farm Operations',
        forecast: 'All systems cleared and ready for new telemetry.',
      },
    };
  }
};

// ─── Phase 1: Digital Identity Auto-Migration ─────────────────────────────────
(function runDigitalIdentityMigration() {
  digitalIdentityService.initialize(store.cattle);
  const report = digitalIdentityService.migrateAllCattle(store.cattle);
  store.digitalIdentities = digitalIdentityService.getAllIdentities();
  console.log(
    `[FarmEase] Digital Identity Migration complete: ` +
    `${report.migrated} migrated, ${report.skipped} already had identities.`
  );
})();
