import { Request, Response } from 'express';
import { store } from '../services/store.js';
import { HealthRecord, Vaccination, Deworming, VitaminSchedule, DoctorVisit } from '../types/index.js';

// Pre-seeded Health Data
export const INITIAL_DEWORMING: Deworming[] = [
  { id: 'dw-1', cattle_id: 'cattle-1', cattle_tag: 'FE-CAT-2026-001', cattle_name: 'Ganga (Gir)', dewormer_name: 'Albendazole 2500mg Oral Drench', administered_date: '2026-06-01', next_due_date: '2026-12-01', administered_by: 'Carlos Ruiz', status: 'completed' },
  { id: 'dw-2', cattle_id: 'cattle-2', cattle_tag: 'FE-CAT-2026-002', cattle_name: 'Kaveri (Kangayam)', dewormer_name: 'Ivermectin Pour-On Solution', administered_date: '2026-07-15', next_due_date: '2027-01-15', administered_by: 'Carlos Ruiz', status: 'completed' },
  { id: 'dw-3', cattle_id: 'cattle-3', cattle_tag: 'FE-CAT-2026-003', cattle_name: 'Lakshmi (Sahiwal)', dewormer_name: 'Fenbendazole 10% Bolus', administered_date: '2026-08-20', next_due_date: '2026-08-20', administered_by: 'Carlos Ruiz', status: 'scheduled' },
];

export const INITIAL_VITAMINS: VitaminSchedule[] = [
  { id: 'vit-1', cattle_id: 'cattle-1', cattle_tag: 'FE-CAT-2026-001', cattle_name: 'Ganga (Gir)', vitamin_name: 'Multivitamin AD3E Injection', dosage: '10 ml', frequency: 'Monthly', next_due_date: '2026-09-01', status: 'active' },
  { id: 'vit-2', cattle_id: 'cattle-2', cattle_tag: 'FE-CAT-2026-002', cattle_name: 'Kaveri (Kangayam)', vitamin_name: 'Chelated Calcium & Phosphorus Drench', dosage: '100 ml/day', frequency: 'Daily', next_due_date: '2026-08-15', status: 'active' },
];

export const INITIAL_VET_VISITS: DoctorVisit[] = [
  { id: 'vetv-1', cattle_id: 'cattle-3', cattle_tag: 'FE-CAT-2026-003', cattle_name: 'Lakshmi (Sahiwal)', veterinarian_name: 'Dr. Marcus Vance', visit_date: '2026-08-05', reason: 'Mastitis Examination & Infusion', diagnosis: 'Mild Mastitis in rear right quarter', notes: 'Infused Cefapirin sodium 200mg. Re-examine in 5 days.', prescription_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80', cost: 75.00, is_emergency: false, created_at: '2026-08-05T10:00:00Z' },
  { id: 'vetv-2', cattle_id: 'cattle-2', cattle_tag: 'FE-CAT-2026-002', cattle_name: 'Kaveri (Kangayam)', veterinarian_name: 'Dr. Marcus Vance', visit_date: '2026-07-28', reason: 'Routine Prenatal Pregnancy Check', diagnosis: '7 Months Pregnant - Normal Fetal Growth', notes: 'Prescribed prenatal mineral booster.', prescription_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80', cost: 50.00, is_emergency: false, created_at: '2026-07-28T14:30:00Z' },
];

let dewormingStore = [...INITIAL_DEWORMING];
let vitaminStore = [...INITIAL_VITAMINS];
let vetVisitStore = [...INITIAL_VET_VISITS];

export const getHealthRecords = async (req: Request, res: Response) => {
  const { cattle_id, status, is_emergency } = req.query;
  let result = [...store.healthRecords];

  if (cattle_id) {
    result = result.filter(h => h.cattle_id === cattle_id);
  }

  if (status) {
    result = result.filter(h => h.status === status);
  }

  if (is_emergency === 'true') {
    result = result.filter(h => h.is_emergency);
  }

  return res.json(result);
};

export const createHealthRecord = async (req: Request, res: Response) => {
  const { 
    cattle_id, 
    record_type, 
    disease_name, 
    diagnosis, 
    treatment, 
    medicine_prescribed, 
    prescription_url,
    veterinarian_name, 
    cost, 
    body_temp_c,
    heart_rate_bpm,
    is_emergency,
    status 
  } = req.body;

  if (!cattle_id || !diagnosis) {
    return res.status(400).json({ message: 'Cattle ID and diagnosis are required' });
  }

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newRecord: HealthRecord = {
    id: `hr-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    record_type: record_type || 'Disease',
    disease_name,
    diagnosis,
    treatment,
    medicine_prescribed,
    prescription_url: prescription_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    veterinarian_name: veterinarian_name || 'Dr. Marcus Vance',
    cost: Number(cost) || 0,
    body_temp_c: body_temp_c ? Number(body_temp_c) : 38.5,
    heart_rate_bpm: heart_rate_bpm ? Number(heart_rate_bpm) : 65,
    is_emergency: Boolean(is_emergency),
    status: status || 'active',
    record_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  if (cattle && (status === 'active' || is_emergency)) {
    cattle.health_status = is_emergency ? 'sick' : 'under_treatment';
  }

  store.healthRecords.unshift(newRecord);

  // Add timeline entry to cattle
  if (cattle) {
    cattle.timeline = cattle.timeline || [];
    cattle.timeline.unshift({
      id: `t-${Date.now()}`,
      title: is_emergency ? '🚨 Emergency Health Event' : 'Medical Diagnosis Logged',
      date: new Date().toISOString().split('T')[0],
      category: 'health',
      description: `${diagnosis}. Treatment: ${treatment || 'Prescribed medications.'}`,
    });
  }

  return res.status(201).json(newRecord);
};

// Vaccinations
export const getVaccinations = async (req: Request, res: Response) => {
  return res.json(store.vaccinations);
};

export const createVaccination = async (req: Request, res: Response) => {
  const { cattle_id, vaccine_name, administered_date, next_due_date, batch_number, administered_by, status } = req.body;

  if (!cattle_id || !vaccine_name || !administered_date) {
    return res.status(400).json({ message: 'Cattle ID, vaccine name, and date are required' });
  }

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newVac: Vaccination = {
    id: `vac-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    vaccine_name,
    administered_date,
    next_due_date: next_due_date || administered_date,
    batch_number: batch_number || `VAC-${Math.floor(1000 + Math.random() * 9000)}`,
    administered_by: administered_by || 'Dr. Marcus Vance',
    status: status || 'completed',
  };

  store.vaccinations.unshift(newVac);
  return res.status(201).json(newVac);
};

// Deworming Records
export const getDeworming = async (req: Request, res: Response) => {
  return res.json(dewormingStore);
};

export const createDeworming = async (req: Request, res: Response) => {
  const { cattle_id, dewormer_name, administered_date, next_due_date, administered_by } = req.body;

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newEntry: Deworming = {
    id: `dw-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    dewormer_name,
    administered_date,
    next_due_date,
    administered_by: administered_by || 'Carlos Ruiz',
    status: 'completed',
  };

  dewormingStore.unshift(newEntry);
  return res.status(201).json(newEntry);
};

// Vitamin Schedules
export const getVitamins = async (req: Request, res: Response) => {
  return res.json(vitaminStore);
};

export const createVitamin = async (req: Request, res: Response) => {
  const { cattle_id, vitamin_name, dosage, frequency, next_due_date } = req.body;

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newVit: VitaminSchedule = {
    id: `vit-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    vitamin_name,
    dosage: dosage || '10 ml',
    frequency: frequency || 'Monthly',
    next_due_date,
    status: 'active',
  };

  vitaminStore.unshift(newVit);
  return res.status(201).json(newVit);
};

// Doctor Visits
export const getDoctorVisits = async (req: Request, res: Response) => {
  return res.json(vetVisitStore);
};

export const createDoctorVisit = async (req: Request, res: Response) => {
  const { cattle_id, veterinarian_name, visit_date, reason, diagnosis, notes, prescription_url, cost, is_emergency } = req.body;

  const cattle = store.cattle.find(c => c.id === cattle_id);

  const newVisit: DoctorVisit = {
    id: `vetv-${Date.now()}`,
    cattle_id,
    cattle_tag: cattle?.tag_number || 'FE-UNKNOWN',
    cattle_name: cattle?.name || 'Unknown',
    veterinarian_name: veterinarian_name || 'Dr. Marcus Vance',
    visit_date: visit_date || new Date().toISOString().split('T')[0],
    reason: reason || 'Routine Clinical Examination',
    diagnosis: diagnosis || 'Normal Health',
    notes: notes || 'Vitals checked. No complications.',
    prescription_url: prescription_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    cost: Number(cost) || 50,
    is_emergency: Boolean(is_emergency),
    created_at: new Date().toISOString(),
  };

  vetVisitStore.unshift(newVisit);
  return res.status(201).json(newVisit);
};

// Health Vitals History for Recharts Line Graphs
export const getVitalsTrend = async (req: Request, res: Response) => {
  const vitalsTrend = [
    { date: 'Aug 03', temp: 38.4, heartRate: 64, weight: 538 },
    { date: 'Aug 04', temp: 38.6, heartRate: 66, weight: 539 },
    { date: 'Aug 05', temp: 39.2, heartRate: 72, weight: 540 },
    { date: 'Aug 06', temp: 39.0, heartRate: 70, weight: 540 },
    { date: 'Aug 07', temp: 38.7, heartRate: 67, weight: 541 },
    { date: 'Aug 08', temp: 38.5, heartRate: 65, weight: 542 },
    { date: 'Aug 09', temp: 38.5, heartRate: 65, weight: 542 },
  ];

  return res.json(vitalsTrend);
};
