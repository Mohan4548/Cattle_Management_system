import { Cattle, HealthRecord, MilkYieldRecord, FeedRecord, BreedingRecord, InventoryItem, FinancialTransaction, WorkerTask, UserProfile, AttendanceRecord, AuditLog, DigitalIdentity } from '../types';
import { digitalIdentityService } from './digitalIdentityService.js';
import { idGenerator } from './digitalIdentityIdGenerator.js';

// Seed Initial Cattle Data with Indian Currency (INR ₹)
export const initialCattle: Cattle[] = [
  {
    id: 'cattle-1',
    tag_id: 'FE-CAT-2026-001',
    name: 'Ganga',
    breed: 'Gir',
    gender: 'female',
    dob: '2022-03-15',
    weight_kg: 540,
    height_cm: 138,
    color: 'Reddish Brown with Speckles',
    horn_type: 'Curved Backward',
    purchase_date: '2023-05-10',
    purchase_cost: 85000,
    status: 'healthy',
    lactation_stage: 'mid',
    milking_status: 'milking',
    qr_code_url: 'FE-CAT-2026-001',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    notes: 'High milk yielding purebred Gir cow. Excellent temperament.',
    created_at: '2023-05-10T10:00:00Z',
    owner_details: {
      name: 'Green Valley Farm Co.',
      phone: '+91 98765 43210',
      address: 'Coimbatore, Tamil Nadu, India'
    },
    // Phase 1: Pre-seeded Digital Identity
    digital_identity_id: 'CAT-2026-000001',
    public_profile_slug: 'cat-2026-000001',
    qr_status: 'pending',
    qr_created_at: '2023-05-10T10:00:00Z',
    qr_updated_at: '2023-05-10T10:00:00Z',
    last_qr_generated: null,
  },
  {
    id: 'cattle-2',
    tag_id: 'FE-CAT-2026-002',
    name: 'Kaveri',
    breed: 'Kangayam',
    gender: 'female',
    dob: '2021-11-20',
    weight_kg: 480,
    height_cm: 132,
    color: 'Greyish White',
    horn_type: 'Pointed Upward',
    purchase_date: '2022-12-01',
    purchase_cost: 65000,
    status: 'pregnant',
    lactation_stage: 'late',
    milking_status: 'milking',
    qr_code_url: 'FE-CAT-2026-002',
    photo_url: 'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
    notes: 'Hardy drought-resistant Kangayam breed. Confirmed pregnant.',
    created_at: '2022-12-01T10:00:00Z',
    owner_details: {
      name: 'Green Valley Farm Co.',
      phone: '+91 98765 43210',
      address: 'Coimbatore, Tamil Nadu, India'
    },
    digital_identity_id: 'CAT-2026-000002',
    public_profile_slug: 'cat-2026-000002',
    qr_status: 'pending',
    qr_created_at: '2022-12-01T10:00:00Z',
    qr_updated_at: '2022-12-01T10:00:00Z',
    last_qr_generated: null,
  },
  {
    id: 'cattle-3',
    tag_id: 'FE-CAT-2026-003',
    name: 'Surya',
    breed: 'Sahiwal',
    gender: 'female',
    dob: '2023-01-10',
    weight_kg: 510,
    height_cm: 135,
    color: 'Reddish Brown',
    horn_type: 'Short Stubby',
    purchase_date: '2023-08-15',
    purchase_cost: 95000,
    status: 'healthy',
    lactation_stage: 'early',
    milking_status: 'milking',
    qr_code_url: 'FE-CAT-2026-003',
    photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    notes: 'Top milk producer with high FAT % score.',
    created_at: '2023-08-15T10:00:00Z',
    owner_details: {
      name: 'Green Valley Farm Co.',
      phone: '+91 98765 43210',
      address: 'Coimbatore, Tamil Nadu, India'
    },
    digital_identity_id: 'CAT-2026-000003',
    public_profile_slug: 'cat-2026-000003',
    qr_status: 'pending',
    qr_created_at: '2023-08-15T10:00:00Z',
    qr_updated_at: '2023-08-15T10:00:00Z',
    last_qr_generated: null,
  },
  {
    id: 'cattle-4',
    tag_id: 'FE-CAT-2026-004',
    name: 'Nandi',
    breed: 'Ongole',
    gender: 'male',
    dob: '2020-05-04',
    weight_kg: 720,
    height_cm: 155,
    color: 'Pure White',
    horn_type: 'Large Curved',
    purchase_date: '2021-06-20',
    purchase_cost: 120000,
    status: 'healthy',
    lactation_stage: 'dry',
    milking_status: 'dry',
    qr_code_url: 'FE-CAT-2026-004',
    photo_url: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&auto=format&fit=crop&q=80',
    notes: 'Primary breeding stud bull. Exceptional muscular build.',
    created_at: '2021-06-20T10:00:00Z',
    owner_details: {
      name: 'Green Valley Farm Co.',
      phone: '+91 98765 43210',
      address: 'Coimbatore, Tamil Nadu, India'
    },
    digital_identity_id: 'CAT-2026-000004',
    public_profile_slug: 'cat-2026-000004',
    qr_status: 'pending',
    qr_created_at: '2021-06-20T10:00:00Z',
    qr_updated_at: '2021-06-20T10:00:00Z',
    last_qr_generated: null,
  },
  {
    id: 'cattle-5',
    tag_id: 'FE-CAT-2026-005',
    name: 'Veera',
    breed: 'Hallikar',
    gender: 'female',
    dob: '2023-06-01',
    weight_kg: 430,
    height_cm: 128,
    color: 'Dark Grey',
    horn_type: 'Long Vertical',
    purchase_date: '2024-01-10',
    purchase_cost: 55000,
    status: 'sick',
    lactation_stage: 'mid',
    milking_status: 'milking',
    qr_code_url: 'FE-CAT-2026-005',
    photo_url: 'https://images.unsplash.com/photo-1495882650041-860368fa9627?w=800&auto=format&fit=crop&q=80',
    notes: 'Under quarantine observation for mild mastitis treatment.',
    created_at: '2024-01-10T10:00:00Z',
    owner_details: {
      name: 'Green Valley Farm Co.',
      phone: '+91 98765 43210',
      address: 'Coimbatore, Tamil Nadu, India'
    },
    digital_identity_id: 'CAT-2026-000005',
    public_profile_slug: 'cat-2026-000005',
    qr_status: 'pending',
    qr_created_at: '2024-01-10T10:00:00Z',
    qr_updated_at: '2024-01-10T10:00:00Z',
    last_qr_generated: null,
  }
];

// Seed Initial Milk Yield Records (Rates in ₹ INR per Litre)
export const initialMilkRecords: MilkYieldRecord[] = [
  {
    id: 'milk-1',
    cattle_id: 'cattle-1',
    date: '2026-08-09',
    morning_yield: 14.5,
    evening_yield: 12.8,
    total_yield: 27.3,
    fat_percentage: 4.6,
    snf_percentage: 8.8,
    rate_per_liter: 45, // ₹45 / L
    total_income: 1228.5, // ₹1,228.50
    notes: 'Morning yield logged at 06:15 AM'
  },
  {
    id: 'milk-2',
    cattle_id: 'cattle-3',
    date: '2026-08-09',
    morning_yield: 13.0,
    evening_yield: 11.2,
    total_yield: 24.2,
    fat_percentage: 4.8,
    snf_percentage: 9.0,
    rate_per_liter: 45, // ₹45 / L
    total_income: 1089.0, // ₹1,089.00
    notes: 'Optimal FAT score'
  }
];

// Seed Initial Financial Transactions in ₹ INR
export const initialFinancials: FinancialTransaction[] = [
  {
    id: 'fin-1',
    date: '2026-08-09',
    type: 'income',
    category: 'Milk Sales',
    amount: 245000, // ₹2,45,000 INR
    description: 'Bulk milk supply delivery to A2 Organic Dairy Co.',
    payment_method: 'bank_transfer',
    status: 'completed',
    invoice_number: 'INV-2026-089'
  },
  {
    id: 'fin-2',
    date: '2026-08-07',
    type: 'expense',
    category: 'Feed',
    amount: 45000, // ₹45,000 INR
    description: 'Purchase of 180 bales Alfalfa Green Fodder & Concentrate',
    payment_method: 'online',
    status: 'completed',
    invoice_number: 'BILL-8890'
  },
  {
    id: 'fin-3',
    date: '2026-08-05',
    type: 'expense',
    category: 'Salary',
    amount: 65000, // ₹65,000 INR
    description: 'Monthly payroll disbursement for farm workers',
    payment_method: 'bank_transfer',
    status: 'completed',
    invoice_number: 'PAY-2026-08'
  },
  {
    id: 'fin-4',
    date: '2026-08-03',
    type: 'expense',
    category: 'Medicine',
    amount: 8500, // ₹8,500 INR
    description: 'Anthrax booster vaccines & veterinary health kit',
    payment_method: 'cash',
    status: 'completed',
    invoice_number: 'MED-7712'
  },
  {
    id: 'fin-5',
    date: '2026-08-01',
    type: 'income',
    category: 'Manure Sales',
    amount: 18000, // ₹18,000 INR
    description: 'Organic compost fertilizer sale to regional nursery',
    payment_method: 'cash',
    status: 'completed',
    invoice_number: 'INV-2026-075'
  },
  {
    id: 'fin-6',
    date: '2026-07-28',
    type: 'income',
    category: 'Stud Breeding Fees',
    amount: 25000, // ₹25,000 INR
    description: 'Stud service fee for Ongole Bull Nandi',
    payment_method: 'bank_transfer',
    status: 'completed',
    invoice_number: 'INV-2026-070'
  },
  {
    id: 'fin-7',
    date: '2026-07-25',
    type: 'expense',
    category: 'Utilities',
    amount: 14500, // ₹14,500 INR
    description: 'Milking parlor solar power & water chilling electricity',
    payment_method: 'online',
    status: 'completed',
    invoice_number: 'UTIL-9901'
  }
];

// Seed Initial Workers with Monthly Base Salary in ₹ INR
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
    base_salary: 85000 // ₹85,000/month
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
    base_salary: 65000 // ₹65,000/month
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
    base_salary: 35000 // ₹35,000/month
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
    base_salary: 22000 // ₹22,000/month
  }
];

export const initialHealthRecords: HealthRecord[] = [
  {
    id: 'health-1',
    cattle_id: 'cattle-1',
    type: 'vaccination',
    title: 'Foot and Mouth Disease (FMD) Booster',
    diagnosis: 'Routine Annual Immunization',
    treatment: 'FMD Vaccine 2ml Subcutaneous Injection',
    prescribed_medicine: 'FMD Vaccine',
    dosage: '2 ml',
    doctor_name: 'Dr. Marcus Vance',
    record_date: '2026-06-15',
    next_due_date: '2027-06-15',
    status: 'resolved',
    cost: 450, // ₹450
    prescription_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    notes: 'Booster administered cleanly. No adverse reaction observed.'
  }
];

export const initialFeedRecords: FeedRecord[] = [
  {
    id: 'feed-1',
    cattle_id: 'cattle-1',
    date: '2026-08-09',
    feed_type: 'Alfalfa Fodder & Grain Mix',
    quantity_kg: 18.5,
    cost: 450, // ₹450
    feeding_time: '07:30 AM',
    protein_percentage: 18.5,
    tdn_percentage: 72.0,
    fiber_percentage: 24.0,
    notes: 'Balanced high-yield ration mix'
  }
];

export const initialBreedingRecords: BreedingRecord[] = [
  {
    id: 'breed-1',
    cattle_id: 'cattle-1',
    heat_detection_date: '2026-04-05',
    ai_date: '2026-04-06',
    bull_id: 'FE-BULL-92',
    bull_breed: 'Gir Purebred',
    pregnancy_confirmed: true,
    pregnancy_check_date: '2026-05-20',
    expected_delivery_date: '2027-01-18', // ~283 days bovine gestation
    status: 'confirmed',
    notes: 'Ultrasound confirmed single healthy fetus.'
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Alfalfa Green Fodder Bales',
    category: 'Fodder',
    quantity: 180,
    unit: 'Bales',
    reorder_level: 50,
    cost_per_unit: 250, // ₹250 / bale
    last_restocked: '2026-08-01',
    supplier: 'Tamil Nadu Green Fodder Co.'
  },
  {
    id: 'inv-2',
    name: 'Dairy Concentrate Mix 18%',
    category: 'Concentrate',
    quantity: 42,
    unit: 'Bags (50kg)',
    reorder_level: 20,
    cost_per_unit: 1450, // ₹1,450 / bag
    last_restocked: '2026-07-25',
    supplier: 'NutriFeed Agritech'
  }
];

export const initialTasks: WorkerTask[] = [
  {
    id: 'task-1',
    title: 'Morning Barn A Sanitation & Milking Preparation',
    assigned_to: 'Carlos Ruiz',
    assigned_user_id: 'usr-4',
    due_date: '2026-08-09',
    priority: 'high',
    status: 'completed',
    description: 'Disinfect milking parlor pipeline and sanitize teat dip buckets.'
  },
  {
    id: 'task-2',
    title: 'Alfalfa Fodder Batch Distribution to Barn B',
    assigned_to: 'John Miller',
    assigned_user_id: 'usr-3',
    due_date: '2026-08-09',
    priority: 'medium',
    status: 'in_progress',
    description: 'Weigh 18kg feed per heifer and ensure freshwater troughs are filled.'
  }
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    user_id: 'usr-4',
    worker_name: 'Carlos Ruiz',
    date: '2026-08-09',
    status: 'present',
    check_in: '05:45 AM',
    check_out: '02:00 PM',
    shift: 'morning',
    daily_wage: 850 // ₹850
  },
  {
    id: 'att-2',
    user_id: 'usr-3',
    worker_name: 'John Miller',
    date: '2026-08-09',
    status: 'present',
    check_in: '06:00 AM',
    check_out: '05:00 PM',
    shift: 'full_day',
    daily_wage: 1400 // ₹1,400
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_name: 'Dr. Sarah Jenkins',
    user_email: 'admin@farmease.com',
    role: 'admin',
    action: 'Log Health Record',
    module: 'Veterinary Health',
    timestamp: '2026-08-09 10:15:22',
    ip_address: '192.168.1.45'
  },
  {
    id: 'log-2',
    user_name: 'Carlos Ruiz',
    user_email: 'worker@farmease.com',
    role: 'worker',
    action: 'Record Morning Milk Yield',
    module: 'Milk Production',
    timestamp: '2026-08-09 06:10:05',
    ip_address: '192.168.1.88'
  },
  {
    id: 'log-3',
    user_name: 'Dr. Marcus Vance',
    user_email: 'vet@farmease.com',
    role: 'veterinarian',
    action: 'Ultrasound Pregnancy Check (Positive)',
    module: 'Breeding & Calving',
    timestamp: '2026-08-08 14:30:00',
    ip_address: '192.168.1.12'
  },
  {
    id: 'log-4',
    user_name: 'Dr. Sarah Jenkins',
    user_email: 'admin@farmease.com',
    role: 'admin',
    action: 'Export Financial Ledger CSV',
    module: 'Financials',
    timestamp: '2026-08-08 09:00:15',
    ip_address: '192.168.1.45'
  }
];

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
  getDashboardStats: () => ({
    totalCattle: initialCattle.length,
    healthyCattle: initialCattle.filter(c => c.status === 'healthy').length,
    pregnantCattle: initialCattle.filter(c => c.status === 'pregnant').length,
    milkToday: 38.5,
    milkThisMonth: 1120,
    feedCost: 45000,
    profit: 141000,
    expenses: 45000,
    vaccinationsDue: 1,
    todaysTasks: 1,
    upcomingDeliveries: 1
  })
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
