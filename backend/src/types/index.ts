export type UserRole = 'admin' | 'farmer' | 'veterinarian' | 'worker';
export type CattleGender = 'female' | 'male';
export type HealthStatus = 'healthy' | 'sick' | 'under_treatment' | 'quarantined' | 'pregnant';
export type LactationStage = 'early' | 'mid' | 'late' | 'dry' | 'heifer' | 'bull';
export type MilkSession = 'morning' | 'evening';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TransactionType = 'income' | 'expense';
export type QRStatus = 'pending' | 'active' | 'inactive';
export type HealthRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type HealthRiskConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExplainableFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface HealthRiskInputSummary {
  age?: string;
  breed?: string;
  gender?: CattleGender;
  weight_kg?: number;
  health_status?: HealthStatus;
  lactation_stage?: LactationStage;
  recent_vitals?: {
    body_temp_c?: number;
    heart_rate_bpm?: number;
  };
  total_health_records?: number;
  active_health_records?: number;
  vaccinations_count?: number;
  doctor_visits_count?: number;
  is_pregnant?: boolean;
}

export interface HealthRiskResult {
  cattleId: string;
  riskLevel: HealthRiskLevel;
  riskScore: number;
  confidence: HealthRiskConfidence;
  keyFactors: ExplainableFactor[];
  recommendations: string[];
  analyzedAt: string;
  safetyNotice: string;
  inputSummary: HealthRiskInputSummary;
}

export interface CattleAttentionItem {
  id: string;
  tag_number: string;
  name: string;
  breed: string;
  riskLevel: HealthRiskLevel;
  riskScore: number;
  confidence: HealthRiskConfidence;
  mainFactor: string;
  factorDescription: string;
  lastAnalysis: string;
}

export interface AIHealthInsightsSummary {
  totalAnalyzed: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  insufficientDataCount: number;
  healthDataCoverage: number;
  riskDistribution: { name: string; value: number; color: string }[];
  cattleRequiringAttention: CattleAttentionItem[];
  highRiskCattle: CattleAttentionItem[];
  mediumRiskCattle: CattleAttentionItem[];
  recentAnalyses: HealthRiskResult[];
  vaccinationInsights: {
    dueSoonCount: number;
    overdueCount: number;
    totalVaccinations: number;
  };
  aiSummary: string;
  healthTrends: { date: string; temp: number; heartRate: number; activeRecords: number }[];
  hasHistoricalData: boolean;
}

export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationType =
  | 'ai_health_risk'
  | 'vaccination_due'
  | 'vaccination_overdue'
  | 'treatment_followup'
  | 'repeated_health_concern';
export type NotificationStatus = 'unread' | 'read' | 'resolved';

export interface SmartNotification {
  id: string;
  cattle_id: string;
  cattle_name: string;
  cattle_tag: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  risk_level?: HealthRiskLevel;
  risk_score?: number;
  main_factor?: string;
  recommended_action?: string;
  status: NotificationStatus;
  action_url: string;
  created_at: string;
}




export type PurchaseType = 'Purchased' | 'Transferred' | 'Inherited' | 'Rescued' | 'Born on Farm';

export type PurchaseDocumentType =
  | 'Purchase Invoice'
  | 'Sale Agreement'
  | 'Ownership Document'
  | 'Registration Certificate'
  | 'Transportation Document'
  
  | 'Previous Owner Document'
  | 'Other Purchase Document';

export interface PurchaseDocument {
  id: string;
  cattle_id: string;
  doc_name: string;
  doc_type: PurchaseDocumentType;
  file_url: string;
  file_size?: string;
  uploaded_by?: string;
  upload_date: string;
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
  is_current?: boolean;
}


// ─── Digital Identity ────────────────────────────────────────────────────────

export interface DigitalIdentity {
  id: string;                          // internal record id
  cattle_id: string;                   // references Cattle.id
  digital_identity_id: string;         // e.g. CAT-2026-000001
  public_profile_slug: string;         // e.g. cat-2026-000001
  qr_status: QRStatus;
  qr_created_at: string;
  qr_updated_at: string;
  last_qr_generated: string | null;
  created_at: string;
  // ─── Phase 2: QR Code Generation Fields ──────────────────────────────────
  qr_generated: boolean;               // true once QR has been generated
  qr_version: number;                  // increments on each regeneration
  qr_payload: string;                  // the URL/data encoded in the QR code
  qr_image_path: string | null;        // logical path e.g. qr-codes/CAT-2026-000001.png
  qr_storage_location: string;         // 'browser' | 'server' — currently browser-side
}

export interface DigitalIdentityValidationResult {
  valid: boolean;
  digital_identity_id: string;
  cattle_id?: string;
  cattle_name?: string;
  cattle_tag?: string;
  errors: string[];
}

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

export interface Cattle {
  id: string;
  tag_number?: string;
  tag_id?: string;
  name: string;
  breed: string;
  gender: CattleGender;
  date_of_birth?: string;
  dob?: string;
  age?: string;
  weight_kg: number;
  height_cm?: number;
  color?: string;
  horn_type?: string;
  purchase_date?: string;
  purchase_cost?: number;
  // Extended purchase fields
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
  purchase_documents?: PurchaseDocument[];
  ownership_history?: OwnershipRecord[];
  health_status?: HealthStatus;
  status?: HealthStatus;
  lactation_stage?: LactationStage;
  milking_status?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_details?: {
    name: string;
    phone: string;
    address: string;
  };
  image_url?: string;
  photo_url?: string;
  gallery?: string[];
  qr_code_data?: string;
  qr_code_url?: string;
  sire_tag?: string;
  dam_tag?: string;
  notes?: string;
  created_at?: string;
  timeline?: any[];
  milk_logs?: any[];
  health_records?: any[];
  vaccinations?: any[];
  breeding_records?: any[];
  // ─── Phase 1: Digital Identity Fields ──────────────────────────────────────
  digital_identity_id?: string;        // e.g. CAT-2026-000001
  public_profile_slug?: string;        // e.g. cat-2026-000001
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
  log_date?: string;
  date?: string;
  session?: MilkSession;
  morning_yield?: number;
  evening_yield?: number;
  total_yield?: number;
  yield_liters?: number;
  fat_percentage?: number;
  snf_percentage?: number;
  rate_per_liter?: number;
  milk_rate?: number;
  total_income?: number;
  notes?: string;
  recorded_by?: string;
  created_at?: string;
}

export type MilkYieldRecord = MilkLog;

export interface FeedLog {
  id: string;
  cattle_id?: string;
  cattle_name?: string;
  feed_type: string;
  quantity_kg: number;
  cost: number;
  feeding_time?: string;
  protein_percentage?: number;
  protein_pct?: number;
  tdn_percentage?: number;
  energy_tdn?: number;
  fiber_percentage?: number;
  fiber_pct?: number;
  recorded_by?: string;
  log_date?: string;
  date?: string;
  notes?: string;
  created_at?: string;
}

export type FeedRecord = FeedLog;

export interface HealthRecord {
  id: string;
  cattle_id: string;
  cattle_tag?: string;
  cattle_name?: string;
  type?: string;
  record_type?: string;
  title?: string;
  disease_name?: string;
  diagnosis: string;
  treatment?: string;
  prescribed_medicine?: string;
  medicine_prescribed?: string;
  dosage?: string;
  prescription_url?: string;
  doctor_name?: string;
  veterinarian_name?: string;
  cost: number;
  body_temp_c?: number;
  heart_rate_bpm?: number;
  is_emergency?: boolean;
  status: 'active' | 'resolved';
  record_date: string;
  next_due_date?: string;
  notes?: string;
  created_at?: string;
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
  created_at?: string;
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
  heat_detection_date?: string;
  ai_date?: string;
  bull_id?: string;
  bull_breed?: string;
  pregnancy_confirmed?: boolean;
  pregnancy_check_date?: string;
  expected_delivery_date?: string;
  event_type?: string;
  event_date?: string;
  sire_info?: string;
  sire_tag?: string;
  dam_tag?: string;
  expected_calving_date?: string;
  actual_calving_date?: string;
  days_remaining?: number;
  outcome?: string;
  calf_id?: string;
  calf_gender?: 'female' | 'male';
  calf_birth_weight?: number;
  delivery_type?: string;
  technician_name?: string;
  status?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name?: string;
  item_name?: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  cost_per_unit?: number;
  unit_cost?: number;
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
  payment_method?: string;
  status?: string;
  invoice_number?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_user_id?: string;
  assigned_to_name?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  created_at?: string;
}

export type WorkerTask = Task;

export interface AttendanceRecord {
  id: string;
  user_id: string;
  worker_name: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  check_in?: string;
  check_out?: string;
  shift?: 'morning' | 'evening' | 'full_day';
  daily_wage?: number;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_email: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  ip_address: string;
}

// ─── Phase 10A: AI Breeding & Pregnancy Analysis Contracts ─────────────────

export type BreedingStatus = 'NOT_BRED' | 'INSEMINATED' | 'PREGNANT' | 'DELIVERED' | 'FAILED';
export type PregnancyStatus = 'CONFIRMED' | 'UNCONFIRMED' | 'NOT_PREGNANT' | 'DELIVERED';

export interface BreedingTimelineStage {
  stage: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming' | 'unconfirmed';
  description: string;
}

export interface BreedingHistorySummary {
  totalBreedingEvents: number;
  confirmedPregnancies: number;
  recordedDeliveries: number;
  breedingSuccessRate: number;
  latestBreedingDate?: string;
  latestPregnancyCheckDate?: string;
  latestCalvingDate?: string;
}

export interface PregnancyDetails {
  isPregnant: boolean;
  daysPregnant?: number;
  daysRemaining?: number;
  trimester?: '1st Trimester (Early)' | '2nd Trimester (Mid)' | '3rd Trimester (Late)' | 'Dry Period & Transition';
  trimesterCode?: 'TRIMESTER_1' | 'TRIMESTER_2' | 'TRIMESTER_3' | 'DRY_PERIOD';
  progressPercentage?: number;
  dryOffDate?: string;
  careRecommendations?: string[];
}

export interface BreedingInsightResult {
  cattleId: string;
  tagNumber: string;
  name: string;
  breed: string;
  gender: CattleGender;
  age?: string;
  breedingStatus: BreedingStatus;
  pregnancyStatus: PregnancyStatus;
  latestBreedingDate?: string;
  pregnancyConfirmationDate?: string;
  estimatedDeliveryDate?: string;
  estimatedDeliveryWindow?: {
    start: string;
    end: string;
  };
  dryOffDate?: string;
  pregnancyDetails: PregnancyDetails;
  timeline: BreedingTimelineStage[];
  breedingHistory: BreedingHistorySummary;
  missingData: string[];
  insights: string[];
  analyzedAt: string;
  disclaimer: string;
}

// ─── Phase 10C: Farm Breeding Intelligence Interfaces ──────────────────────

export interface FarmBreedingSummary {
  totalBreedingRecords: number;
  confirmedPregnancies: number;
  upcomingDeliveries: number;
  delivered: number;
  incompleteRecords: number;
  hasData: boolean;
}

export interface FarmPregnancyOverview {
  confirmed: number;
  unconfirmed: number;
  delivered: number;
  notPregnant: number;
  unknown: number;
}

export interface UpcomingDeliveryItem {
  cattleId: string;
  cattleTag: string;
  cattleName: string;
  breed: string;
  pregnancyStatus: PregnancyStatus;
  estimatedDeliveryDate: string;
  estimatedDeliveryWindow?: { start: string; end: string };
  dryOffDate?: string;
  daysRemaining: number;
}

export interface BreedingAttentionItem {
  cattleId: string;
  cattleTag: string;
  cattleName: string;
  breed: string;
  issue: string;
  relevantDate?: string;
}

export interface BreedingTrendItem {
  period: string;
  count: number;
}

export interface BreedingDataQuality {
  totalCattleAnalyzed: number;
  incompleteRecordsCount: number;
  missingBreedingDateCount: number;
  missingPregnancyCheckCount: number;
  missingDeliveryInfoCount: number;
  qualityScorePercentage: number;
}

export interface BreedingPerformanceMetrics {
  totalBreedingEvents: number;
  confirmedPregnancies: number;
  recordedDeliveries: number;
  pregnancyConfirmationRate: number | null;
  hasSufficientData: boolean;
}

export interface FarmBreedingInsightsResult {
  summary: FarmBreedingSummary;
  pregnancyOverview: FarmPregnancyOverview;
  upcomingDeliveries: UpcomingDeliveryItem[];
  attentionRequired: BreedingAttentionItem[];
  breedingTrends: BreedingTrendItem[];
  confirmationTrends: BreedingTrendItem[];
  dataQuality: BreedingDataQuality;
  performanceMetrics: BreedingPerformanceMetrics;
  insights: string[];
  analyzedAt: string;
  disclaimer: string;
}

