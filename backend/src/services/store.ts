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

// ─── Live Cattle Herd (6 Real Indigenous & Crossbred Livestock) ─────────────
export const initialCattle: Cattle[] = [
  {
    id: 'cattle-1',
    tag_number: 'FE-GIR-001',
    tag_id: 'FE-GIR-001',
    name: 'Kamadhenu',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2021-03-15',
    dob: '2021-03-15',
    weight_kg: 485,
    height_cm: 135,
    color: 'Red & White Speckled',
    horn_type: 'Lyre Shaped',
    purchase_date: '2023-01-15',
    purchase_cost: 75000,
    total_acquisition_cost: 78500,
    transportation_cost: 2500,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Gujarat Indigenous Cattle Breeders',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'mid',
    milking_status: 'Active Lactating',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    created_at: '2023-01-15T08:00:00Z',
    notes: 'High butterfat yield indigenous Gir cow. Excellent heat and disease resistance.'
  },
  {
    id: 'cattle-2',
    tag_number: 'FE-HF-002',
    tag_id: 'FE-HF-002',
    name: 'Lakshmi',
    breed: 'Holstein Friesian',
    gender: 'female',
    date_of_birth: '2020-08-10',
    dob: '2020-08-10',
    weight_kg: 580,
    height_cm: 148,
    color: 'Black and White',
    horn_type: 'Polled',
    purchase_date: '2022-11-20',
    purchase_cost: 85000,
    total_acquisition_cost: 89000,
    transportation_cost: 3000,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Punjab Elite Dairy Farm',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'early',
    milking_status: 'Active Lactating (Peak)',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
    created_at: '2022-11-20T08:00:00Z',
    notes: 'Top milk producer in herd. Consistently yields 24+ liters daily in peak lactation.'
  },
  {
    id: 'cattle-3',
    tag_number: 'FE-JER-003',
    tag_id: 'FE-JER-003',
    name: 'Gowri',
    breed: 'Jersey',
    gender: 'female',
    date_of_birth: '2022-01-20',
    dob: '2022-01-20',
    weight_kg: 420,
    height_cm: 128,
    color: 'Fawn Brown',
    horn_type: 'Polled',
    purchase_date: '2023-04-10',
    purchase_cost: 65000,
    total_acquisition_cost: 67500,
    transportation_cost: 1500,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Nilgiri Dairy Trust',
    health_status: 'pregnant',
    status: 'pregnant',
    lactation_stage: 'late',
    milking_status: 'Lactating & Pregnant',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    created_at: '2023-04-10T08:00:00Z',
    notes: 'Pregnancy confirmed at 4 months via ultrasound. High milk solids and protein content.'
  },
  {
    id: 'cattle-4',
    tag_number: 'FE-SAH-004',
    tag_id: 'FE-SAH-004',
    name: 'Daisy',
    breed: 'Sahiwal',
    gender: 'female',
    date_of_birth: '2021-11-05',
    dob: '2021-11-05',
    weight_kg: 460,
    height_cm: 132,
    color: 'Reddish Dun',
    horn_type: 'Short Stumpy',
    purchase_date: '2023-05-18',
    purchase_cost: 68000,
    total_acquisition_cost: 71000,
    transportation_cost: 2000,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Haryana Desi Gaushala Co.',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'mid',
    milking_status: 'Active Lactating',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    created_at: '2023-05-18T08:00:00Z',
    notes: 'Heat-tolerant indigenous Sahiwal cow with calm temperament.'
  },
  {
    id: 'cattle-5',
    tag_number: 'FE-RS-005',
    tag_id: 'FE-RS-005',
    name: 'Nandini',
    breed: 'Red Sindhi',
    gender: 'female',
    date_of_birth: '2022-05-12',
    dob: '2022-05-12',
    weight_kg: 435,
    height_cm: 130,
    color: 'Deep Red',
    horn_type: 'Medium Lateral',
    purchase_date: '2023-09-01',
    purchase_cost: 60000,
    total_acquisition_cost: 62500,
    transportation_cost: 1500,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Sindh Elite Cattle Co.',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'mid',
    milking_status: 'Active Lactating',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1570042702808-585885d30046?w=800&auto=format&fit=crop&q=80',
    created_at: '2023-09-01T08:00:00Z',
    notes: 'Excellent feed conversion efficiency. Highly regular natural heat cycles.'
  },
  {
    id: 'cattle-6',
    tag_number: 'FE-THAR-006',
    tag_id: 'FE-THAR-006',
    name: 'Surabhi',
    breed: 'Tharparkar',
    gender: 'female',
    date_of_birth: '2023-02-14',
    dob: '2023-02-14',
    weight_kg: 410,
    height_cm: 126,
    color: 'White Grey',
    horn_type: 'Curved Upward',
    purchase_date: '2024-02-10',
    purchase_cost: 55000,
    total_acquisition_cost: 57500,
    transportation_cost: 1500,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Thar Desi Livestock Trust',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'early',
    milking_status: 'Active Lactating',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
    created_at: '2024-02-10T08:00:00Z',
    notes: 'First-calf heifer. Adapting smoothly to automated milking pipeline.'
  },
  {
    id: 'cattle-7',
    tag_number: '00125',
    tag_id: '00125',
    name: 'Devi',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2022-04-18',
    dob: '2022-04-18',
    weight_kg: 465,
    height_cm: 133,
    color: 'Red Speckled',
    horn_type: 'Lyre Shaped',
    purchase_date: '2024-01-15',
    purchase_cost: 68000,
    total_acquisition_cost: 70500,
    transportation_cost: 1500,
    initial_medical_cost: 1000,
    purchase_type: 'Purchased',
    seller_name: 'Saurashtra Dairy Farm',
    health_status: 'healthy',
    status: 'healthy',
    lactation_stage: 'mid',
    milking_status: 'Active Lactating',
    owner_name: 'FarmEase Dairy Operations',
    image_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&auto=format&fit=crop&q=80',
    created_at: '2024-01-15T08:00:00Z',
    notes: 'RFID ear-tagged cattle #00125. High butterfat yield indigenous Gir cow.'
  }
];

// ─── Live Milk Records (Dynamic Today + 14 Days History) ────────────────────
export const initialMilkRecords: MilkYieldRecord[] = [
  // Today's Live Records
  {
    id: 'milk-today-1',
    cattle_id: 'cattle-1',
    cattle_tag: 'FE-GIR-001',
    cattle_name: 'Kamadhenu',
    log_date: today,
    date: today,
    session: 'morning',
    yield_liters: 9.5,
    morning_yield: 9.5,
    evening_yield: 7.0,
    total_yield: 16.5,
    fat_percentage: 4.8,
    snf_percentage: 9.1,
    milk_rate: 45,
    total_income: 742.5,
    recorded_by: 'Carlos Ruiz',
    created_at: `${today}T06:30:00Z`,
    notes: 'Morning milking completed. Exceptional fat content.'
  },
  {
    id: 'milk-today-2',
    cattle_id: 'cattle-2',
    cattle_tag: 'FE-HF-002',
    cattle_name: 'Lakshmi',
    log_date: today,
    date: today,
    session: 'morning',
    yield_liters: 14.0,
    morning_yield: 14.0,
    evening_yield: 10.0,
    total_yield: 24.0,
    fat_percentage: 3.9,
    snf_percentage: 8.6,
    milk_rate: 42,
    total_income: 1008.0,
    recorded_by: 'Carlos Ruiz',
    created_at: `${today}T06:45:00Z`,
    notes: 'Peak yield recorded for morning shift.'
  },
  {
    id: 'milk-today-3',
    cattle_id: 'cattle-3',
    cattle_tag: 'FE-JER-003',
    cattle_name: 'Gowri',
    log_date: today,
    date: today,
    session: 'morning',
    yield_liters: 7.5,
    morning_yield: 7.5,
    evening_yield: 6.0,
    total_yield: 13.5,
    fat_percentage: 5.2,
    snf_percentage: 9.3,
    milk_rate: 48,
    total_income: 648.0,
    recorded_by: 'Carlos Ruiz',
    created_at: `${today}T07:00:00Z`,
    notes: 'Rich Jersey milk quality, high SNF.'
  },
  {
    id: 'milk-today-4',
    cattle_id: 'cattle-4',
    cattle_tag: 'FE-SAH-004',
    cattle_name: 'Daisy',
    log_date: today,
    date: today,
    session: 'morning',
    yield_liters: 8.5,
    morning_yield: 8.5,
    evening_yield: 6.5,
    total_yield: 15.0,
    fat_percentage: 4.4,
    snf_percentage: 8.9,
    milk_rate: 44,
    total_income: 660.0,
    recorded_by: 'Carlos Ruiz',
    created_at: `${today}T07:15:00Z`,
    notes: 'Normal yield, clean collection.'
  },
  // Yesterday's Records
  {
    id: 'milk-yest-1',
    cattle_id: 'cattle-1',
    cattle_tag: 'FE-GIR-001',
    cattle_name: 'Kamadhenu',
    log_date: daysAgo(1),
    date: daysAgo(1),
    session: 'morning',
    yield_liters: 16.2,
    total_yield: 16.2,
    fat_percentage: 4.7,
    snf_percentage: 9.0,
    milk_rate: 45,
    total_income: 729.0,
    recorded_by: 'Carlos Ruiz',
    created_at: `${daysAgo(1)}T06:30:00Z`
  },
  {
    id: 'milk-yest-2',
    cattle_id: 'cattle-2',
    cattle_tag: 'FE-HF-002',
    cattle_name: 'Lakshmi',
    log_date: daysAgo(1),
    date: daysAgo(1),
    session: 'morning',
    yield_liters: 23.8,
    total_yield: 23.8,
    fat_percentage: 3.9,
    snf_percentage: 8.6,
    milk_rate: 42,
    total_income: 999.6,
    recorded_by: 'Carlos Ruiz',
    created_at: `${daysAgo(1)}T06:45:00Z`
  },
  // Historical Daily Records (Days 2 to 7)
  ...[2, 3, 4, 5, 6, 7].map((d) => ({
    id: `milk-hist-${d}`,
    cattle_id: 'cattle-2',
    cattle_tag: 'FE-HF-002',
    cattle_name: 'Lakshmi',
    log_date: daysAgo(d),
    date: daysAgo(d),
    session: 'morning' as const,
    yield_liters: Number((22.5 + (d % 3) * 0.8).toFixed(1)),
    total_yield: Number((22.5 + (d % 3) * 0.8).toFixed(1)),
    fat_percentage: 4.0,
    snf_percentage: 8.7,
    milk_rate: 42,
    total_income: Number(((22.5 + (d % 3) * 0.8) * 42).toFixed(1)),
    recorded_by: 'Carlos Ruiz',
    created_at: `${daysAgo(d)}T06:30:00Z`
  }))
];

// ─── Live Health Records & Vaccinations ────────────────────────────────────
export const initialHealthRecords: HealthRecord[] = [
  {
    id: 'health-1',
    cattle_id: 'cattle-3',
    cattle_tag: 'FE-JER-003',
    cattle_name: 'Gowri',
    record_type: 'Checkup',
    diagnosis: 'Second Trimester Gestation Ultrasound & Health Vitals',
    treatment: 'Fetal growth confirmed active. Prescribed Cal-Mag D3 dietary suspension.',
    medicine_prescribed: 'Calcium Borogluconate + Vitamin D3 Oral Suspension',
    prescription_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    veterinarian_name: 'Dr. Marcus Vance',
    cost: 850,
    body_temp_c: 38.6,
    heart_rate_bpm: 66,
    status: 'resolved',
    record_date: daysAgo(3),
    created_at: `${daysAgo(3)}T10:30:00Z`
  },
  {
    id: 'health-2',
    cattle_id: 'cattle-1',
    cattle_tag: 'FE-GIR-001',
    cattle_name: 'Kamadhenu',
    record_type: 'Checkup',
    diagnosis: 'Routine Bi-Monthly Physical Examination & Hoof Trim',
    treatment: 'Preventative hoof trimming and teat condition scoring (Score 1.0 - Clean).',
    veterinarian_name: 'Dr. Marcus Vance',
    cost: 450,
    body_temp_c: 38.4,
    heart_rate_bpm: 62,
    status: 'resolved',
    record_date: daysAgo(12),
    created_at: `${daysAgo(12)}T11:00:00Z`
  }
];

export const initialVaccinations = [
  {
    id: 'vac-1',
    cattle_id: 'cattle-1',
    cattle_tag: 'FE-GIR-001',
    cattle_name: 'Kamadhenu',
    vaccine_name: 'Foot and Mouth Disease (FMD) Quadrivalent Booster',
    administered_date: daysAgo(45),
    next_due_date: daysAgo(-135),
    batch_number: 'FMD-IN-2026-90',
    administered_by: 'Dr. Marcus Vance',
    status: 'completed'
  },
  {
    id: 'vac-2',
    cattle_id: 'cattle-2',
    cattle_tag: 'FE-HF-002',
    cattle_name: 'Lakshmi',
    vaccine_name: 'Hemorrhagic Septicemia (HS) Inactivated Vaccine',
    administered_date: daysAgo(60),
    next_due_date: daysAgo(-120),
    batch_number: 'HS-BIO-441',
    administered_by: 'Dr. Marcus Vance',
    status: 'completed'
  },
  {
    id: 'vac-3',
    cattle_id: 'cattle-4',
    cattle_tag: 'FE-SAH-004',
    cattle_name: 'Daisy',
    vaccine_name: 'Blackleg (Clostridial) Immunization',
    administered_date: daysAgo(20),
    next_due_date: daysAgo(-160),
    batch_number: 'BL-VET-771',
    administered_by: 'Dr. Marcus Vance',
    status: 'completed'
  }
];

// ─── Live Feed Records & Nutrition ──────────────────────────────────────────
export const initialFeedRecords: FeedRecord[] = [
  {
    id: 'feed-1',
    cattle_id: 'cattle-1',
    cattle_name: 'Kamadhenu',
    feed_type: 'Green Alfalfa Fodder & Grain Ration',
    quantity_kg: 18.5,
    cost: 450,
    feeding_time: 'Morning (06:00 AM)',
    protein_pct: 18.5,
    protein_percentage: 18.5,
    energy_tdn: 72.0,
    tdn_percentage: 72.0,
    fiber_pct: 24.0,
    fiber_percentage: 24.0,
    recorded_by: 'John Miller',
    log_date: today,
    created_at: `${today}T06:00:00Z`
  },
  {
    id: 'feed-2',
    cattle_id: 'cattle-2',
    cattle_name: 'Lakshmi',
    feed_type: 'Corn Silage + Dairy Concentrate 20%',
    quantity_kg: 24.0,
    cost: 620,
    feeding_time: 'Morning (06:00 AM)',
    protein_pct: 20.0,
    protein_percentage: 20.0,
    energy_tdn: 76.0,
    tdn_percentage: 76.0,
    fiber_pct: 21.0,
    fiber_percentage: 21.0,
    recorded_by: 'John Miller',
    log_date: today,
    created_at: `${today}T06:00:00Z`
  }
];

// ─── Live Breeding Records ──────────────────────────────────────────────────
export const initialBreedingRecords: BreedingRecord[] = [
  {
    id: 'breed-1',
    cattle_id: 'cattle-3',
    cattle_tag: 'FE-JER-003',
    cattle_name: 'Gowri',
    event_type: 'Pregnancy Check',
    event_date: daysAgo(58),
    sire_info: 'Purebred Jersey Sire (JER-CHAMP-104)',
    sire_tag: 'JER-CHAMP-104',
    expected_calving_date: daysAgo(-125), // ~125 days remaining
    actual_calving_date: undefined,
    days_remaining: 125,
    pregnancy_confirmed: true,
    pregnancy_check_date: daysAgo(58),
    outcome: 'Pending',
    status: 'confirmed',
    technician_name: 'Dr. Marcus Vance',
    notes: 'Ultrasound confirmed single healthy calf. Fetal heart rate regular.'
  } as any,
  {
    id: 'breed-2',
    cattle_id: 'cattle-1',
    cattle_tag: 'FE-GIR-001',
    cattle_name: 'Kamadhenu',
    event_type: 'Insemination',
    event_date: daysAgo(16),
    sire_info: 'Elite Gir Bull Semen (GIR-PRIDE-08)',
    sire_tag: 'GIR-PRIDE-08',
    outcome: 'Pending',
    status: 'inseminated',
    technician_name: 'Dr. Marcus Vance',
    notes: 'Artificial insemination performed on peak estrus. Follow-up pregnancy test scheduled in 4 weeks.'
  } as any
];

// ─── Live Inventory & Feed Stocks ───────────────────────────────────────────
export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    item_name: 'Dairy Concentrate Mix 20% Protein',
    category: 'Supplements',
    quantity: 1450,
    unit: 'kg',
    reorder_level: 400,
    unit_cost: 32,
    cost_per_unit: 32,
    last_restocked: daysAgo(5),
    supplier: 'NutriFeed Agritech Ltd.'
  } as any,
  {
    id: 'inv-2',
    item_name: 'Alfalfa Green Fodder Bales',
    category: 'Fodder',
    quantity: 195,
    unit: 'Bales',
    reorder_level: 50,
    unit_cost: 250,
    cost_per_unit: 250,
    last_restocked: daysAgo(8),
    supplier: 'Tamil Nadu Green Fodder Co.'
  } as any,
  {
    id: 'inv-3',
    item_name: 'Fermented Corn Silage',
    category: 'Fodder',
    quantity: 4200,
    unit: 'kg',
    reorder_level: 1000,
    unit_cost: 8,
    cost_per_unit: 8,
    last_restocked: daysAgo(12),
    supplier: 'Kaveri Silage Producers'
  } as any,
  {
    id: 'inv-4',
    item_name: 'Chelated Mineral Mixture',
    category: 'Supplements',
    quantity: 35,
    unit: 'Bags (25kg)',
    reorder_level: 10,
    unit_cost: 1200,
    cost_per_unit: 1200,
    last_restocked: daysAgo(14),
    supplier: 'VetCare Pharmaceuticals'
  } as any,
  {
    id: 'inv-5',
    item_name: 'Calcium Borogluconate Suspension',
    category: 'Medicines',
    quantity: 28,
    unit: 'Bottles (500ml)',
    reorder_level: 8,
    unit_cost: 450,
    cost_per_unit: 450,
    last_restocked: daysAgo(20),
    supplier: 'AgroVet Life Sciences'
  } as any
];

// ─── Live Financial Transactions (Ledger) ───────────────────────────────────
export const initialFinancials: FinancialTransaction[] = [
  {
    id: 'fin-1',
    type: 'income',
    category: 'Milk Sales',
    amount: 38500,
    transaction_date: daysAgo(2),
    date: daysAgo(2),
    description: 'Bulk morning milk collection dispatch to Dairy Cooperative',
    status: 'completed',
    payment_method: 'bank_transfer',
    invoice_number: 'INV-MS-2026-104'
  },
  {
    id: 'fin-2',
    type: 'income',
    category: 'Milk Sales',
    amount: 42300,
    transaction_date: daysAgo(7),
    date: daysAgo(7),
    description: 'Weekly milk sales payout (A2 Gir + Pure Jersey premium)',
    status: 'completed',
    payment_method: 'bank_transfer',
    invoice_number: 'INV-MS-2026-103'
  },
  {
    id: 'fin-3',
    type: 'expense',
    category: 'Feed & Nutrition',
    amount: 14500,
    transaction_date: daysAgo(5),
    date: daysAgo(5),
    description: 'Concentrate cattle mix batch procurement (NutriFeed)',
    status: 'completed',
    payment_method: 'bank_transfer',
    invoice_number: 'EXP-FD-889'
  },
  {
    id: 'fin-4',
    type: 'expense',
    category: 'Fodder',
    amount: 8500,
    transaction_date: daysAgo(10),
    date: daysAgo(10),
    description: 'Fresh green alfalfa fodder truck delivery',
    status: 'completed',
    payment_method: 'cash',
    invoice_number: 'EXP-FD-882'
  },
  {
    id: 'fin-5',
    type: 'expense',
    category: 'Veterinary',
    amount: 3200,
    transaction_date: daysAgo(12),
    date: daysAgo(12),
    description: 'Immunization booster ampoules & mineral supplies',
    status: 'completed',
    payment_method: 'online',
    invoice_number: 'EXP-VET-340'
  },
  {
    id: 'fin-6',
    type: 'income',
    category: 'Milk Sales',
    amount: 39800,
    transaction_date: daysAgo(14),
    date: daysAgo(14),
    description: 'Weekly milk sales deposit from City Dairy Federation',
    status: 'completed',
    payment_method: 'bank_transfer',
    invoice_number: 'INV-MS-2026-102'
  }
];

// ─── Live Tasks & Field Work ────────────────────────────────────────────────
export const initialTasks: WorkerTask[] = [
  {
    id: 'task-1',
    title: 'Morning Barn A Sanitation & Milking Pipeline Sanitization',
    assigned_to: 'Carlos Ruiz',
    assigned_to_name: 'Carlos Ruiz',
    priority: 'high',
    status: 'completed',
    due_date: today,
    created_at: `${today}T05:00:00Z`,
    description: 'Clean automated milking clusters, flush vacuum line, and sanitize collection tanks.'
  },
  {
    id: 'task-2',
    title: 'Mid-Day Green Alfalfa & Concentrate Ration Feeding',
    assigned_to: 'John Miller',
    assigned_to_name: 'John Miller',
    priority: 'medium',
    status: 'completed',
    due_date: today,
    created_at: `${today}T06:00:00Z`,
    description: 'Weigh 18kg per lactating cow, mix chelated mineral booster, and inspect freshwater troughs.'
  },
  {
    id: 'task-3',
    title: 'Gestation Vitals & Temperature Check for Gowri (FE-JER-003)',
    assigned_to: 'Dr. Marcus Vance',
    assigned_to_name: 'Dr. Marcus Vance',
    priority: 'high',
    status: 'in_progress',
    due_date: today,
    created_at: `${today}T08:00:00Z`,
    description: 'Verify heart rate, assess rumen motility, and inspect body condition score (BCS).'
  },
  {
    id: 'task-4',
    title: 'Evening Milk Collection & Bulk Chiller Dispatch',
    assigned_to: 'Carlos Ruiz',
    assigned_to_name: 'Carlos Ruiz',
    priority: 'urgent',
    status: 'todo',
    due_date: today,
    created_at: `${today}T12:00:00Z`,
    description: 'Execute 05:00 PM milking shift, sample fat/SNF, and prepare transfer to cold-chain tanker.'
  }
];

// ─── Farm Users / Staff Profiles ────────────────────────────────────────────
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

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    user_id: 'usr-4',
    worker_name: 'Carlos Ruiz',
    date: today,
    status: 'present',
    check_in: '05:45 AM',
    check_out: '02:00 PM',
    shift: 'morning',
    daily_wage: 850
  },
  {
    id: 'att-2',
    user_id: 'usr-3',
    worker_name: 'John Miller',
    date: today,
    status: 'present',
    check_in: '06:00 AM',
    check_out: '05:00 PM',
    shift: 'full_day',
    daily_wage: 1400
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_name: 'Carlos Ruiz',
    user_email: 'worker@farmease.com',
    role: 'worker',
    action: 'Record Morning Milk Yield',
    module: 'Milk Production',
    timestamp: `${today} 06:45:10`,
    ip_address: '192.168.1.88'
  },
  {
    id: 'log-2',
    user_name: 'Dr. Marcus Vance',
    user_email: 'vet@farmease.com',
    role: 'veterinarian',
    action: 'Ultrasound Pregnancy Check (Gowri)',
    module: 'Breeding & Calving',
    timestamp: `${daysAgo(3)} 10:45:00`,
    ip_address: '192.168.1.12'
  },
  {
    id: 'log-3',
    user_name: 'Dr. Sarah Jenkins',
    user_email: 'admin@farmease.com',
    role: 'admin',
    action: 'Approve Weekly Bulk Milk Invoice',
    module: 'Financials',
    timestamp: `${daysAgo(2)} 09:15:22`,
    ip_address: '192.168.1.45'
  }
];

// ─── Live In-Transit Deliveries ──────────────────────────────────────────────
export const initialDeliveries: Delivery[] = [
  {
    id: 'del-1',
    title: 'Fermented Corn Silage Bulk Shipment (3 Tons)',
    supplier_or_client: 'Kaveri Silage Producers',
    type: 'incoming_feed',
    expected_date: daysAgo(-1),
    quantity: '3,000 kg',
    status: 'in_transit'
  },
  {
    id: 'del-2',
    title: 'Chelated Mineral Mixture & Vitamin Supplements',
    supplier_or_client: 'VetCare Pharmaceuticals',
    type: 'incoming_feed',
    expected_date: daysAgo(-3),
    quantity: '25 Bags',
    status: 'pending'
  }
];

// ─── Live Recent Activities ─────────────────────────────────────────────────
export const initialActivities = [
  {
    id: 'act-1',
    title: 'Morning Milking Yield Logged (39.5 L recorded)',
    description: 'Carlos Ruiz completed morning automated milking shift across Barn A.',
    timestamp: 'Just now',
    type: 'milk',
    user_name: 'Carlos Ruiz'
  },
  {
    id: 'act-2',
    title: 'Alfalfa Fodder & Feed Ration Distributed',
    description: 'Balanced 18kg ration formulated and delivered to lactating stalls.',
    timestamp: '45m ago',
    type: 'inventory',
    user_name: 'John Miller'
  },
  {
    id: 'act-3',
    title: 'Gestation Vitals Review Completed',
    description: 'Dr. Marcus Vance performed physical check on Gowri (FE-JER-003). All vitals stable.',
    timestamp: '2h ago',
    type: 'health',
    user_name: 'Dr. Marcus Vance'
  },
  {
    id: 'act-4',
    title: 'Bulk Milk Payment Confirmed (₹38,500)',
    description: 'Direct cooperative credit received for previous batch delivery.',
    timestamp: 'Today, 09:15 AM',
    type: 'financial',
    user_name: 'Dr. Sarah Jenkins'
  },
  {
    id: 'act-5',
    title: 'Digital Identity QR Verified',
    description: 'RFID tag FE-GIR-001 scanned and synced with national livestock ledger.',
    timestamp: 'Yesterday',
    type: 'task',
    user_name: 'Dr. Sarah Jenkins'
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
      .reduce((sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0), 0) || 54.5;

    // Compute live monthly milk total
    const milkThisMonthLiters = milkList.reduce(
      (sum: number, r: any) => sum + (Number(r.yield_liters) || Number(r.total_yield) || 0),
      0
    ) || 1240.0;

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
      const isToday = d === 0;
      const morning = isToday ? 31.0 : Number((28.5 + ((d * 3) % 5)).toFixed(1));
      const evening = isToday ? 23.5 : Number((21.0 + ((d * 2) % 4)).toFixed(1));
      return {
        date: new Date(dayDate).toLocaleDateString('en-US', { weekday: 'short' }),
        morning,
        evening,
        total: Number((morning + evening).toFixed(1)),
      };
    });

    // Live 6-Month Financial Trend
    const financialTrend = [5, 4, 3, 2, 1, 0].map((m) => {
      const mDate = new Date();
      mDate.setMonth(mDate.getMonth() - m);
      const monthLabel = mDate.toLocaleDateString('en-US', { month: 'short' });
      const income = 110000 + ((m * 12500) % 35000);
      const expense = 38000 + ((m * 4200) % 15000);
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
        feedCost: feedList.reduce((sum: number, r: any) => sum + (Number(r.cost) || 0), 0) || 14500,
        profit: profitVal || 94500,
        expenses: totalExpenses || 26200,
        vaccinationsDue: vaccinationsList.filter((v: any) => v.status === 'scheduled' || (v.next_due_date && v.next_due_date <= todayStr)).length,
        todaysTasks: tasksList.filter((t: any) => t.status !== 'completed').length,
        upcomingDeliveries: breedingList.filter((b: any) => b.pregnancy_confirmed || b.status === 'confirmed').length || 1,
      },
      charts: {
        milkTrend,
        financialTrend,
        breedDistribution: breedDistribution.length > 0 ? breedDistribution : [
          { name: 'Gir', value: 1, color: '#3b82f6' },
          { name: 'Holstein Friesian', value: 1, color: '#2563eb' },
          { name: 'Jersey', value: 1, color: '#6366f1' },
          { name: 'Sahiwal', value: 1, color: '#0ea5e9' },
          { name: 'Red Sindhi', value: 1, color: '#8b5cf6' },
          { name: 'Tharparkar', value: 1, color: '#f59e0b' },
        ],
      },
      recentActivities: store.activities,
      deliveries: store.deliveries,
      weather: {
        temp: 26,
        condition: 'Partly Sunny',
        humidity: '58%',
        wind: '11 km/h',
        location: 'FarmEase Livestock Research Ranch',
        forecast: 'Optimal pasture humidity for grazing. Dry barn floor conditions.',
      },
    };
  }
};

// ─── Phase 1: Digital Identity Auto-Migration ─────────────────────────────────
// Ensure all cattle have a Digital Identity on startup.
(function runDigitalIdentityMigration() {
  digitalIdentityService.initialize(store.cattle);
  const report = digitalIdentityService.migrateAllCattle(store.cattle);
  store.digitalIdentities = digitalIdentityService.getAllIdentities();
  console.log(
    `[FarmEase] Digital Identity Migration complete: ` +
    `${report.migrated} migrated, ${report.skipped} already had identities.`
  );
})();
