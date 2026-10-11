import { Cattle, HealthRecord, MilkYieldRecord, FeedRecord, BreedingRecord, InventoryItem, FinancialTransaction, WorkerTask, UserProfile, AttendanceRecord, AuditLog, DigitalIdentity } from '../types';
import { digitalIdentityService } from './digitalIdentityService.js';
import { idGenerator } from './digitalIdentityIdGenerator.js';

// Initial Cattle Data (empty by default, populates with real user data)
export const initialCattle: Cattle[] = [];

// Initial Milk Yield Records
export const initialMilkRecords: MilkYieldRecord[] = [];

// Initial Financial Transactions
export const initialFinancials: FinancialTransaction[] = [];

// Farm Users / Staff Profiles
export const initialUsers: UserProfile[] = [
  {
    id: 'usr-1',
    full_name: 'Dr. Sarah Jenkins',
    email: 'admin@farmease.com',
    role: 'admin',
    phone: '+91 98765 43210',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    base_salary: 85000
  },
  {
    id: 'usr-2',
    full_name: 'Dr. Marcus Vance',
    email: 'vet@farmease.com',
    role: 'veterinarian',
    phone: '+91 98765 43211',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2023-02-15T00:00:00Z',
    base_salary: 65000
  },
  {
    id: 'usr-3',
    full_name: 'John Miller',
    email: 'farmer@farmease.com',
    role: 'farmer',
    phone: '+91 98765 43212',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2023-03-01T00:00:00Z',
    base_salary: 35000
  },
  {
    id: 'usr-4',
    full_name: 'Carlos Ruiz',
    email: 'worker@farmease.com',
    role: 'worker',
    phone: '+91 98765 43213',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    created_at: '2023-04-10T00:00:00Z',
    base_salary: 22000
  }
];

export const initialHealthRecords: HealthRecord[] = [];
export const initialFeedRecords: FeedRecord[] = [];
export const initialBreedingRecords: BreedingRecord[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialTasks: WorkerTask[] = [];
export const initialAttendance: AttendanceRecord[] = [];
export const initialAuditLogs: AuditLog[] = [];

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
  purchaseDocuments: [] as any[],
  ownershipHistory: [] as any[],
  vaccinations: [],
  activities: [],
  digitalIdentities: [] as DigitalIdentity[],
  getDashboardStats: () => {
    const cattleList = store.cattle || [];
    const milkList = store.milkRecords || [];
    const feedList = store.feedRecords || [];
    const finList = store.financials || [];
    const tasksList = store.tasks || [];
    const breedingList = store.breedingRecords || [];
    const vaccinationsList = store.vaccinations || [];
    const today = new Date().toISOString().split('T')[0];

    return {
      totalCattle: cattleList.length,
      healthyCattle: cattleList.filter((c: any) => c.status === 'healthy').length,
      pregnantCattle: cattleList.filter((c: any) => c.status === 'pregnant').length,
      milkToday: milkList
        .filter((m: any) => m.date === today)
        .reduce((sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0), 0),
      milkThisMonth: milkList.reduce((sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0), 0),
      feedCost: feedList.reduce((sum: number, r: any) => sum + (Number(r.cost) || 0), 0),
      profit: finList.reduce((sum: number, f: any) => sum + (f.type === 'income' ? Number(f.amount) || 0 : -(Number(f.amount) || 0)), 0),
      expenses: finList.filter((f: any) => f.type === 'expense').reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0),
      vaccinationsDue: vaccinationsList.filter((v: any) => v.next_due_date && v.next_due_date <= today).length,
      todaysTasks: tasksList.filter((t: any) => t.status !== 'completed').length,
      upcomingDeliveries: breedingList.filter((b: any) => b.pregnancy_confirmed && b.status === 'confirmed').length
    };
  }
};

// ─── Phase 1: Digital Identity Auto-Migration ─────────────────────────────────
// On every server start, ensure all cattle have a Digital Identity.
// This is idempotent — cattle with existing identities are skipped.
(function runDigitalIdentityMigration() {
  // First sync the ID counter from pre-seeded identity IDs
  digitalIdentityService.initialize(store.cattle);

  // Then migrate any cattle that don't yet have an identity (e.g., newly registered)
  const report = digitalIdentityService.migrateAllCattle(store.cattle);

  // Sync identity records back to the store's digitalIdentities array
  store.digitalIdentities = digitalIdentityService.getAllIdentities();

  console.log(
    `[FarmEase] Digital Identity Migration complete: ` +
    `${report.migrated} migrated, ${report.skipped} already had identities, ` +
    `${report.errors.length} errors.`
  );
  if (report.errors.length > 0) {
    console.warn('[FarmEase] Migration errors:', report.errors);
  }
})();
