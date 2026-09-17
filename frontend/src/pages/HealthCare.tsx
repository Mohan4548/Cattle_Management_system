import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { 
  HealthRecord, 
  Vaccination, 
  Deworming, 
  VitaminSchedule, 
  DoctorVisit, 
  Cattle 
} from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Stethoscope, 
  Syringe, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Thermometer, 
  Activity, 
  Printer, 
  FileText, 
  Clock, 
  ShieldAlert, 
  Bell, 
  UserCheck, 
  TrendingUp, 
  Paperclip,
  Upload,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const healthSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  record_type: z.enum(['Disease', 'Checkup', 'Surgery', 'Emergency']),
  disease_name: z.string().optional(),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  treatment: z.string().optional(),
  medicine_prescribed: z.string().optional(),
  prescription_url: z.string().optional(),
  veterinarian_name: z.string().optional(),
  cost: z.coerce.number().min(0),
  body_temp_c: z.coerce.number().optional(),
  heart_rate_bpm: z.coerce.number().optional(),
  is_emergency: z.boolean().optional(),
  status: z.enum(['active', 'resolved']),
});

const vacSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  vaccine_name: z.string().min(2, 'Vaccine name is required'),
  administered_date: z.string().min(4, 'Administered date is required'),
  next_due_date: z.string().min(4, 'Next due date is required'),
  batch_number: z.string().optional(),
  administered_by: z.string().optional(),
});

const dewormSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  dewormer_name: z.string().min(2, 'Dewormer name is required'),
  administered_date: z.string().min(4, 'Administered date is required'),
  next_due_date: z.string().min(4, 'Next due date is required'),
});

const vitSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  vitamin_name: z.string().min(2, 'Vitamin name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  next_due_date: z.string().min(4, 'Next due date is required'),
});

const visitSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  veterinarian_name: z.string().min(2, 'Doctor name is required'),
  visit_date: z.string().min(4, 'Visit date is required'),
  reason: z.string().min(2, 'Reason is required'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  notes: z.string().optional(),
  cost: z.coerce.number().min(0),
  is_emergency: z.boolean().optional(),
});

type HealthFormData = z.infer<typeof healthSchema>;
type VacFormData = z.infer<typeof vacSchema>;
type DewormFormData = z.infer<typeof dewormSchema>;
type VitFormData = z.infer<typeof vitSchema>;
type VisitFormData = z.infer<typeof visitSchema>;

// ── Vaccination status helper ─────────────────────────────────────────
const getVaccinationStatus = (nextDue?: string): { label: string; variant: 'healthy' | 'urgent' | 'medium' | 'low' } => {
  if (!nextDue) return { label: '⚪ Not Recorded', variant: 'low' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(nextDue); due.setHours(0, 0, 0, 0);
  const diff  = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0)   return { label: '🔴 Overdue',    variant: 'urgent' };
  if (diff <= 30) return { label: '🟡 Due Soon',   variant: 'medium' };
  return               { label: '🟢 Up to Date', variant: 'healthy' };
};

export const HealthCare: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [dewormings, setDewormings] = useState<Deworming[]>([]);
  const [vitamins, setVitamins] = useState<VitaminSchedule[]>([]);
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>([]);
  const [vitalsTrend, setVitalsTrend] = useState<any[]>([]);
  const [cattleList, setCattleList] = useState<Cattle[]>([]);

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'records' | 'vaccinations' | 'deworming' | 'doctors' | 'analytics' | 'calendar'>('records');

  // Modals
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isVacModalOpen, setIsVacModalOpen] = useState(false);
  const [isDewormModalOpen, setIsDewormModalOpen] = useState(false);
  const [isVitModalOpen, setIsVitModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [viewPrescriptionUrl, setViewPrescriptionUrl] = useState<string | null>(null);

  // Forms
  const { register: regHealth, handleSubmit: subHealth, reset: resetHealth } = useForm<HealthFormData>({
    resolver: zodResolver(healthSchema),
    defaultValues: { record_type: 'Disease', status: 'active', cost: 75, body_temp_c: 38.5, heart_rate_bpm: 65, veterinarian_name: 'Dr. Marcus Vance', is_emergency: false },
  });

  const { register: regVac, handleSubmit: subVac, reset: resetVac } = useForm<VacFormData>({
    resolver: zodResolver(vacSchema),
    defaultValues: { administered_date: new Date().toISOString().split('T')[0], next_due_date: '2027-05-10', administered_by: 'Dr. Marcus Vance' },
  });

  const { register: regDeworm, handleSubmit: subDeworm, reset: resetDeworm } = useForm<DewormFormData>({
    resolver: zodResolver(dewormSchema),
    defaultValues: { administered_date: new Date().toISOString().split('T')[0], next_due_date: '2027-02-15' },
  });

  const { register: regVit, handleSubmit: subVit, reset: resetVit } = useForm<VitFormData>({
    resolver: zodResolver(vitSchema),
    defaultValues: { dosage: '10 ml', frequency: 'Monthly', next_due_date: '2026-09-01' },
  });

  const { register: regVisit, handleSubmit: subVisit, reset: resetVisit } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: { visit_date: new Date().toISOString().split('T')[0], veterinarian_name: 'Dr. Marcus Vance', cost: 100, is_emergency: false },
  });

  const fetchData = async () => {
    try {
      const [hRes, vRes, dRes, vitRes, docRes, vtRes, cRes] = await Promise.all([
        apiClient.get('/health'),
        apiClient.get('/vaccinations'),
        apiClient.get('/health/deworming'),
        apiClient.get('/health/vitamins'),
        apiClient.get('/health/doctor-visits'),
        apiClient.get('/health/vitals-trend'),
        apiClient.get('/cattle'),
      ]);
      setHealthRecords(Array.isArray(hRes.data) ? hRes.data : []);
      setVaccinations(Array.isArray(vRes.data) ? vRes.data : []);
      setDewormings(Array.isArray(dRes.data) ? dRes.data : []);
      setVitamins(Array.isArray(vitRes.data) ? vitRes.data : []);
      setDoctorVisits(Array.isArray(docRes.data) ? docRes.data : []);
      setVitalsTrend(Array.isArray(vtRes.data) ? vtRes.data : []);
      setCattleList(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []));
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHealth = async (data: HealthFormData) => {
    try {
      const res = await apiClient.post('/health', data);
      setHealthRecords(prev => [res.data, ...prev]);
      setIsHealthModalOpen(false);
      resetHealth();
    } catch {
      alert('Failed to save health record.');
    }
  };

  const handleCreateVac = async (data: VacFormData) => {
    try {
      const res = await apiClient.post('/vaccinations', data);
      setVaccinations(prev => [res.data, ...prev]);
      setIsVacModalOpen(false);
      resetVac();
    } catch {
      alert('Failed to save vaccination record.');
    }
  };

  const handleCreateDeworm = async (data: DewormFormData) => {
    try {
      const res = await apiClient.post('/health/deworming', data);
      setDewormings(prev => [res.data, ...prev]);
      setIsDewormModalOpen(false);
      resetDeworm();
    } catch {
      alert('Failed to save deworming entry.');
    }
  };

  const handleCreateVit = async (data: VitFormData) => {
    try {
      const res = await apiClient.post('/health/vitamins', data);
      setVitamins(prev => [res.data, ...prev]);
      setIsVitModalOpen(false);
      resetVit();
    } catch {
      alert('Failed to save vitamin schedule.');
    }
  };

  const handleCreateVisit = async (data: VisitFormData) => {
    try {
      const res = await apiClient.post('/health/doctor-visits', data);
      setDoctorVisits(prev => [res.data, ...prev]);
      setIsVisitModalOpen(false);
      resetVisit();
    } catch {
      alert('Failed to log doctor visit.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const emergencyCount = healthRecords.filter(h => h.is_emergency || h.record_type === 'Emergency').length;

  return (
    <div className="space-y-5 print:p-0">
      {/* ── Page Header ── */}
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[var(--accent-violet)]" />
            Health & Vet
          </h1>
          <p className="page-subtitle">
            Vaccination records, disease history, doctor visits, deworming, and vitals analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrintPDF}
            className="btn-secondary"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            PDF Report
          </button>

          <button
            onClick={() => {
              const headers = ['Cattle Tag','Cattle Name','Vaccine Name','Batch #','Administered Date','Next Due Date','Administered By','Status'];
              const rows = vaccinations.map(v => [
                v.cattle_tag || '', v.cattle_name || '', v.vaccine_name,
                v.batch_number || '', v.administered_date, v.next_due_date,
                v.administered_by || '', getVaccinationStatus(v.next_due_date).label,
              ]);
              const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `FarmEase_Health_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            Export CSV
          </button>

          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="btn-primary bg-[var(--accent-violet)] hover:bg-[#6d28d9]"
            style={{ background: 'var(--accent-violet)', boxShadow: '0 4px 14px var(--accent-violet-glow)' }}
          >
            <Plus className="w-4 h-4" />
            Log Health Record
          </button>
        </div>
      </div>

      {/* ── Emergency Alert Banner ── */}
      {emergencyCount > 0 && (
        <div className="p-4 rounded-xl border border-[var(--accent-rose)]/30 bg-[var(--accent-rose-subtle)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[var(--accent-rose)] animate-pulse shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                🚨 Emergency Health Alert ({emergencyCount} Case)
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Critical health treatment required. Veterinary attention assigned.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisitModalOpen(true)}
            className="btn-danger text-xs shrink-0"
          >
            Request Emergency Visit
          </button>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="tab-underline-bar overflow-x-auto print:hidden">
        {([
          { key: 'records',      label: 'Diseases & History', icon: FileText,    count: healthRecords.length },
          { key: 'vaccinations', label: 'Vaccinations',        icon: Syringe,     count: vaccinations.length },
          { key: 'deworming',    label: 'Deworming',           icon: Pill,        count: dewormings.length },
          { key: 'doctors',      label: 'Doctor Visits',       icon: UserCheck,   count: doctorVisits.length },
          { key: 'analytics',    label: 'Vitals Analytics',    icon: TrendingUp,  count: null },
          { key: 'calendar',     label: 'Schedule',            icon: Bell,        count: null },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`tab-underline-item flex items-center gap-1.5 whitespace-nowrap ${activeTab === key ? 'active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {count !== null && (
              <span className={`ml-1 badge-pill ${activeTab === key ? 'badge-violet' : 'badge-slate'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Disease History & Medical Records ── */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthRecords.map((item) => (
            <div
              key={item.id}
              className={`card-premium p-5 space-y-3 ${
                item.is_emergency ? 'border-[var(--accent-rose)]/40 bg-[var(--accent-rose-subtle)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-xs" style={{ color: 'var(--accent-green)' }}>
                    {item.cattle_tag || 'FE-103'}
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {item.cattle_name || 'Molly'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {item.is_emergency && <Badge variant="urgent">Emergency</Badge>}
                  <Badge variant={item.status === 'active' ? 'under_treatment' : 'completed'}>
                    {item.status}
                  </Badge>
                </div>
              </div>

              {/* Vitals summary bar */}
              <div className="flex items-center gap-4 p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[var(--accent-rose)]" />
                  {item.body_temp_c || 38.5}°C
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                  {item.heart_rate_bpm || 65} bpm
                </span>
                <span className="ml-auto text-[var(--text-muted)] font-mono">{item.record_date}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-[var(--text-muted)] font-semibold">Diagnosis: </span>
                  <span className="font-bold text-[var(--text-primary)]">{item.diagnosis}</span>
                </div>
                {item.treatment && (
                  <div>
                    <span className="text-[var(--text-muted)] font-semibold">Treatment Plan: </span>
                    <span className="text-[var(--text-secondary)]">{item.treatment}</span>
                  </div>
                )}
                {item.medicine_prescribed && (
                  <div>
                    <span className="text-slate-400 font-semibold">Rx Prescribed: </span>
                    <span className="text-purple-400 font-bold">{item.medicine_prescribed}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Vet: <strong>{item.veterinarian_name || 'Dr. Marcus Vance'}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewPrescriptionUrl(item.prescription_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80')}
                    className="text-purple-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> Prescription
                  </button>
                  <span className="text-emerald-500 font-bold">${item.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Vaccination Schedule */}
      {activeTab === 'vaccinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Herd Vaccination Schedule</h3>
            <button
              onClick={() => setIsVacModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-400"
            >
              + Add Vaccination
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Cattle Tag / Name</th>
                  <th className="p-3.5">Vaccine Name</th>
                  <th className="p-3.5">Batch #</th>
                  <th className="p-3.5">Administered Date</th>
                  <th className="p-3.5">Next Due Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {vaccinations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 font-bold">
                      <span className="font-mono text-emerald-500">{v.cattle_tag || 'FE-101'}</span> - {v.cattle_name || 'Bella'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{v.vaccine_name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{v.batch_number || 'VAC-992'}</td>
                    <td className="p-3.5">{v.administered_date}</td>
                    <td className="p-3.5 font-bold text-purple-400">{v.next_due_date}</td>
                    <td className="p-3.5">
                      {(() => {
                        const st = getVaccinationStatus(v.next_due_date);
                        return <Badge variant={st.variant}>{st.label}</Badge>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Deworming & Vitamin Schedule */}
      {activeTab === 'deworming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deworming */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" /> Deworming Records
              </h3>
              <button
                onClick={() => setIsDewormModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold text-xs"
              >
                + Deworm
              </button>
            </div>

            <div className="space-y-3">
              {dewormings.map((dw) => (
                <div key={dw.id} className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>{dw.cattle_name || 'Ganga'} ({dw.cattle_tag || 'FE-101'})</span>
                    <Badge variant={dw.status === 'completed' ? 'healthy' : 'medium'}>{dw.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold">{dw.dewormer_name}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Administered: {dw.administered_date}</span>
                    <span className="font-bold text-emerald-500">Next Due: {dw.next_due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitamin Schedules */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Vitamin & Mineral Schedules
              </h3>
              <button
                onClick={() => setIsVitModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-bold text-xs"
              >
                + Schedule Vitamin
              </button>
            </div>

            <div className="space-y-3">
              {vitamins.map((vt) => (
                <div key={vt.id} className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>{vt.cattle_name || 'Kaveri'} ({vt.cattle_tag})</span>
                    <Badge variant="healthy">{vt.frequency}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{vt.vitamin_name} ({vt.dosage})</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Status: {vt.status}</span>
                    <span className="font-bold text-amber-500">Next Dose: {vt.next_due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Doctor Visits & Notes */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-500" /> Veterinarian Visit Logs & Notes
            </h3>
            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 text-white font-bold text-xs"
            >
              + Log Doctor Visit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorVisits.map((v) => (
              <div key={v.id} className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{v.veterinarian_name}</h4>
                    <span className="text-[11px] text-slate-400 font-semibold">{v.reason}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{v.visit_date}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-950/70 text-xs space-y-1">
                  <p><strong>Diagnosis:</strong> {v.diagnosis}</p>
                  <p className="text-slate-500 italic">"{v.notes}"</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Target: <strong className="text-slate-200">{v.cattle_name} ({v.cattle_tag})</strong></span>
                  <span className="font-bold text-emerald-500">${v.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Health Analytics & Vitals Trends */}
      {activeTab === 'analytics' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Body Temperature & Heart Rate Vitals Analytics
          </h3>
          <p className="text-xs text-slate-500">Live body temperature (°C) tracking vs heart rate (bpm)</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="temp" name="Body Temp (°C)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Prescription Attachment Preview Modal */}
      {viewPrescriptionUrl && (
        <Modal
          isOpen={!!viewPrescriptionUrl}
          onClose={() => setViewPrescriptionUrl(null)}
          title="Uploaded Veterinary Prescription Document"
        >
          <div className="space-y-4 text-center">
            <img
              src={viewPrescriptionUrl}
              alt="Prescription"
              className="w-full h-64 object-cover rounded-2xl border border-slate-700 shadow-xl"
            />
            <p className="text-xs text-slate-400">Official Rx prescribed by Dr. Marcus Vance</p>
          </div>
        </Modal>
      )}

      {/* Health Record Modal */}
      <Modal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} title="Log Health Treatment & Medical Diagnosis">
        <form onSubmit={subHealth(handleCreateHealth)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regHealth('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <option value="">Select cattle...</option>
              {cattleList.map(c => <option key={c.id} value={c.id}>{c.tag_number} - {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Diagnosis</label>
              <input {...regHealth('diagnosis')} type="text" placeholder="Mild Mastitis, Foot Rot..." className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Prescription Medication</label>
              <input {...regHealth('medicine_prescribed')} type="text" placeholder="Cefapirin sodium 200mg" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Body Temp (°C)</label>
              <input {...regHealth('body_temp_c')} type="number" step="0.1" placeholder="38.5" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Heart Rate (bpm)</label>
              <input {...regHealth('heart_rate_bpm')} type="number" placeholder="65" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Cost ($)</label>
              <input {...regHealth('cost')} type="number" placeholder="75" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <input type="checkbox" id="is_emergency" {...regHealth('is_emergency')} className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500" />
            <label htmlFor="is_emergency" className="text-xs font-bold text-rose-500 cursor-pointer">
              Mark as Emergency Case Alert 🚨
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsHealthModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white shadow-glow">Save Health Record</button>
          </div>
        </form>
      </Modal>

      {/* Vaccination Modal */}
      <Modal isOpen={isVacModalOpen} onClose={() => setIsVacModalOpen(false)} title="Schedule / Record Vaccination">
        <form onSubmit={subVac(handleCreateVac)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regVac('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <option value="">Select cattle...</option>
              {cattleList.map(c => <option key={c.id} value={c.id}>{c.tag_number} - {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Vaccine Name</label>
            <input {...regVac('vaccine_name')} type="text" placeholder="Bovine Viral Diarrhea (BVD)" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Administered Date</label>
              <input {...regVac('administered_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Next Due Date</label>
              <input {...regVac('next_due_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsVacModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white shadow-glow">Save Vaccine</button>
          </div>
        </form>
      </Modal>

      {/* Deworming Modal */}
      <Modal isOpen={isDewormModalOpen} onClose={() => setIsDewormModalOpen(false)} title="Log Deworming Treatment">
        <form onSubmit={subDeworm(handleCreateDeworm)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regDeworm('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <option value="">Select cattle...</option>
              {cattleList.map(c => <option key={c.id} value={c.id}>{c.tag_number} - {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Dewormer Product Name</label>
            <input {...regDeworm('dewormer_name')} type="text" placeholder="Albendazole 2500mg Oral Drench" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Administered Date</label>
              <input {...regDeworm('administered_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Next Due Date</label>
              <input {...regDeworm('next_due_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsDewormModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-glow">Save Deworming</button>
          </div>
        </form>
      </Modal>

      {/* Vitamin Modal */}
      <Modal isOpen={isVitModalOpen} onClose={() => setIsVitModalOpen(false)} title="Schedule Vitamin / Mineral Supplement">
        <form onSubmit={subVit(handleCreateVit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regVit('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <option value="">Select cattle...</option>
              {cattleList.map(c => <option key={c.id} value={c.id}>{c.tag_number} - {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Vitamin Supplement Name</label>
            <input {...regVit('vitamin_name')} type="text" placeholder="Multivitamin AD3E Injection" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Dosage</label>
              <input {...regVit('dosage')} type="text" placeholder="10 ml" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Frequency</label>
              <input {...regVit('frequency')} type="text" placeholder="Monthly / Weekly" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsVitModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-glow">Save Supplement</button>
          </div>
        </form>
      </Modal>

      {/* Doctor Visit Modal */}
      <Modal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} title="Log Veterinarian Doctor Visit">
        <form onSubmit={subVisit(handleCreateVisit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Cattle</label>
            <select {...regVisit('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <option value="">Select cattle...</option>
              {cattleList.map(c => <option key={c.id} value={c.id}>{c.tag_number} - {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Veterinarian Name</label>
              <input {...regVisit('veterinarian_name')} type="text" placeholder="Dr. Marcus Vance" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Visit Date</label>
              <input {...regVisit('visit_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Reason for Visit</label>
            <input {...regVisit('reason')} type="text" placeholder="Mastitis Examination & Infusion" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Diagnosis & Doctor Notes</label>
            <textarea {...regVisit('notes')} rows={2} placeholder="Infused Cefapirin sodium 200mg..." className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsVisitModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white shadow-glow">Log Doctor Visit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
