export type UserRole = 'admin' | 'farmer' | 'veterinarian' | 'worker';
export type CattleGender = 'female' | 'male';
export type HealthStatus = 'healthy' | 'sick' | 'under_treatment' | 'quarantined' | 'pregnant';
export type LactationStage = 'early' | 'mid' | 'late' | 'dry' | 'heifer' | 'bull';
export type MilkSession = 'morning' | 'evening';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TransactionType = 'income' | 'expense';
export type QRStatus = 'pending' | 'active' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  status: 'active' | 'inactive';
  base_salary?: number;
  created_at: string;
}

export interface CattleTimelineEvent {
  id: string;
  title: string;
  date: string;
  category: 'birth' | 'purchase' | 'health' | 'vaccination' | 'breeding' | 'milking';
  description: string;
}

export interface HealthVitals {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  body_temp_c: number;
  heart_rate_bpm: number;
  weight_kg: number;
  record_date: string;
}

export interface Deworming {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  dewormer_name: string;
  administered_date: string;
  next_due_date: string;
  administered_by: string;
  status: 'completed' | 'scheduled';
}

export interface VitaminSchedule {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  vitamin_name: string;
  dosage: string;
  frequency: string;
  next_due_date: string;
  status: 'active' | 'completed';
}

export interface DoctorVisit {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  veterinarian_name: string;
  visit_date: string;
  reason: string;
  diagnosis: string;
  notes: string;
  prescription_url?: string;
  cost: number;
  is_emergency: boolean;
  created_at: string;
}

export interface Cattle {
  id: string;
  tag_number: string;
  name: string;
  breed: string;
  gender: CattleGender;
  date_of_birth: string;
  age?: string;
  weight_kg: number;
  height_cm?: number;
  color?: string;
  horn_type?: string;
  // ─── Basic Purchase Fields (original) ────────────────────────────────────
  purchase_date?: string;
  purchase_cost?: number;
  owner_name?: string;
  owner_phone?: string;
  // ─── Extended Purchase Fields (Phase 2) ──────────────────────────────────
  purchase_type?: PurchaseType;
  invoice_number?: string;
  purchase_reference?: string;
  purchase_location?: string;
  seller_name?: string;
  seller_contact?: string;
  seller_address?: string;
  previous_owner?: string;
  previous_owner_contact?: string;
  transportation_cost?: number;
  initial_medical_cost?: number;
  other_purchase_cost?: number;
  total_acquisition_cost?: number;
  purchase_notes?: string;
  purchase_created_by?: string;
  // ─── Related Records (populated on GET /cattle/:id) ──────────────────────
  purchase_documents?: PurchaseDocument[];
  ownership_history?: OwnershipRecord[];
  // ─── Health / Status ─────────────────────────────────────────────────────
  health_status: HealthStatus;
  lactation_stage: LactationStage;
  image_url: string;
  gallery?: string[];
  qr_code_data?: string;
  sire_tag?: string;
  dam_tag?: string;
  notes?: string;
  created_at: string;
  timeline?: CattleTimelineEvent[];
  milk_logs?: MilkLog[];
  health_records?: HealthRecord[];
  vaccinations?: Vaccination[];
  breeding_records?: BreedingRecord[];
  // ─── Phase 1: Digital Identity Fields ────────────────────────────────────
  digital_identity_id?: string;
  public_profile_slug?: string;
  qr_status?: QRStatus;
  qr_created_at?: string;
  qr_updated_at?: string;
  last_qr_generated?: string | null;
}

export interface MilkLog {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  log_date: string;
  session: MilkSession;
  yield_liters: number;
  fat_percentage?: number;
  snf_percentage?: number;
  milk_rate?: number;
  total_income?: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

export interface FeedLog {
  id: string;
  cattle_id?: string;
  cattle_name?: string;
  feed_type: string;
  quantity_kg: number;
  cost: number;
  feeding_time: 'Morning (06:00 AM)' | 'Midday (12:00 PM)' | 'Evening (05:00 PM)';
  protein_pct?: number;
  energy_tdn?: number;
  fiber_pct?: number;
  recorded_by?: string;
  log_date: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  record_type: 'Disease' | 'Checkup' | 'Surgery' | 'Emergency';
  disease_name?: string;
  diagnosis: string;
  treatment?: string;
  medicine_prescribed?: string;
  prescription_url?: string;
  veterinarian_name?: string;
  cost: number;
  body_temp_c?: number;
  heart_rate_bpm?: number;
  is_emergency?: boolean;
  status: 'active' | 'resolved';
  record_date: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  vaccine_name: string;
  administered_date: string;
  next_due_date: string;
  batch_number?: string;
  administered_by?: string;
  status: 'completed' | 'scheduled';
}

export interface BreedingRecord {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  event_type: 'Heat' | 'Insemination' | 'Pregnancy Check' | 'Calving';
  event_date: string;
  sire_info?: string;
  sire_tag?: string;
  dam_tag?: string;
  expected_calving_date?: string;
  actual_calving_date?: string;
  days_remaining?: number;
  outcome?: 'Successful' | 'Failed' | 'Pending';
  calf_id?: string;
  calf_gender?: 'female' | 'male';
  calf_birth_weight?: number;
  delivery_type?: 'Normal' | 'Assisted' | 'C-Section';
  technician_name?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: 'Fodder' | 'Supplements' | 'Medicines' | 'Equipment';
  quantity: number;
  unit: string;
  reorder_level: number;
  unit_cost: number;
  supplier?: string;
  last_restocked: string;
  protein_pct?: number;
  energy_tdn?: number;
  fiber_pct?: number;
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  transaction_date?: string;
  date?: string;
  description?: string;
  reference_id?: string;
  payment_method?: 'bank_transfer' | 'cash' | 'online';
  status?: 'completed' | 'pending';
  invoice_number?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_to_name?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'milk' | 'health' | 'breeding' | 'inventory' | 'financial' | 'task';
  user_name: string;
}

export interface Delivery {
  id: string;
  title: string;
  supplier_or_client: string;
  type: 'incoming_feed' | 'outgoing_milk' | 'equipment';
  expected_date: string;
  quantity: string;
  status: 'pending' | 'in_transit' | 'delivered';
}

export interface DashboardData {
  kpi: {
    totalCattle: number;
    healthyCattle: number;
    pregnantCattle: number;
    milkToday: number;
    milkThisMonth: number;
    feedCost: number;
    profit: number;
    expenses: number;
    vaccinationsDue: number;
    todaysTasks: number;
    upcomingDeliveries: number;
  };
  charts: {
    milkTrend: { date: string; morning: number; evening: number; total: number }[];
    financialTrend: { month: string; income: number; expense: number; profit: number }[];
    breedDistribution: { name: string; value: number; color: string }[];
  };
  recentActivities: ActivityLog[];
  deliveries: Delivery[];
  weather: {
    temp: number;
    condition: string;
    humidity: string;
    wind: string;
    location: string;
    forecast: string;
  };
}

// ─── Purchase Details Types ───────────────────────────────────────────────────

export type PurchaseType = 'Purchased' | 'Transferred' | 'Inherited' | 'Rescued' | 'Born on Farm';

export interface PurchaseDocument {
  id: string;
  cattle_id: string;
  doc_name: string;
  doc_type: string;
  file_url: string;
  uploaded_by?: string;
  created_at: string;
}

export interface OwnershipRecord {
  id: string;
  cattle_id: string;
  owner_name: string;
  owner_contact?: string;
  transfer_date: string;
  transfer_price?: number;
  transfer_location?: string;
  transfer_notes?: string;
  created_at: string;
}
