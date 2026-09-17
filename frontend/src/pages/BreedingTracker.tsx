import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { BreedingRecord, Cattle } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FamilyTree } from '../components/breeding/FamilyTree';
import { 
  Heart, 
  Dna, 
  Plus, 
  Calendar, 
  Baby, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  UserCheck, 
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

const breedingSchema = z.object({
  cattle_id: z.string().min(1, 'Please select cattle'),
  event_type: z.enum(['Heat', 'Insemination', 'Pregnancy Check', 'Calving']),
  event_date: z.string().min(4, 'Event date is required'),
  sire_info: z.string().optional(),
  sire_tag: z.string().optional(),
  dam_tag: z.string().optional(),
  outcome: z.enum(['Successful', 'Failed', 'Pending']),
  technician_name: z.string().optional(),
  notes: z.string().optional(),
});

const calfSchema = z.object({
  breeding_record_id: z.string().optional(),
  calf_name: z.string().min(2, 'Calf name is required'),
  calf_gender: z.enum(['female', 'male']),
  breed: z.string().min(1, 'Breed is required'),
  birth_weight: z.coerce.number().min(1, 'Birth weight is required'),
  delivery_type: z.enum(['Normal', 'Assisted', 'C-Section']),
  dam_tag: z.string().min(1, 'Dam Tag ID required'),
  sire_tag: z.string().min(1, 'Sire Tag ID required'),
});

type BreedingFormData = z.infer<typeof breedingSchema>;
type CalfFormData = z.infer<typeof calfSchema>;

const PREGNANCY_COLORS = ['#10b981', '#6366f1', '#f59e0b'];

export const BreedingTracker: React.FC = () => {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [selectedCattleForTree, setSelectedCattleForTree] = useState<Cattle | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'events' | 'countdown' | 'tree' | 'analytics'>('events');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCalfModalOpen, setIsCalfModalOpen] = useState(false);
  const [selectedBreedingForCalf, setSelectedBreedingForCalf] = useState<BreedingRecord | null>(null);

  const {
    register: regRecord,
    handleSubmit: subRecord,
    reset: resetRecord,
    watch: watchRecord,
  } = useForm<BreedingFormData>({
    resolver: zodResolver(breedingSchema),
    defaultValues: {
      event_type: 'Insemination',
      event_date: new Date().toISOString().split('T')[0],
      sire_info: 'BULL-92 (Jersey High Merit)',
      sire_tag: 'BULL-92',
      outcome: 'Pending',
      technician_name: 'Dr. Marcus Vance',
    },
  });

  const {
    register: regCalf,
    handleSubmit: subCalf,
    reset: resetCalf,
    setValue: setValCalf,
  } = useForm<CalfFormData>({
    resolver: zodResolver(calfSchema),
    defaultValues: {
      calf_gender: 'female',
      breed: 'Gir Cross',
      birth_weight: 32,
      delivery_type: 'Normal',
    },
  });

  const selectedEventType = watchRecord('event_type');

  const fetchData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        apiClient.get('/breeding'),
        apiClient.get('/cattle'),
      ]);
      setRecords(Array.isArray(bRes.data) ? bRes.data : []);
      const cData = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []);
      setCattleList(cData);
      if (cData.length > 0 && !selectedCattleForTree) {
        setSelectedCattleForTree(cData[0]);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBreedingRecord = async (data: BreedingFormData) => {
    try {
      const res = await apiClient.post('/breeding', data);
      setRecords(prev => [res.data, ...prev]);
      setIsRecordModalOpen(false);
      resetRecord();
      fetchData();
    } catch {
      alert('Failed to log breeding event.');
    }
  };

  const handleOpenCalfModal = (record: BreedingRecord) => {
    setSelectedBreedingForCalf(record);
    setValCalf('breeding_record_id', record.id);
    setValCalf('dam_tag', record.dam_tag || record.cattle_tag || 'FE-CAT-2026-001');
    setValCalf('sire_tag', record.sire_tag || 'BULL-92');
    setIsCalfModalOpen(true);
  };

  const handleRegisterCalf = async (data: CalfFormData) => {
    try {
      await apiClient.post('/breeding/register-calf', data);
      setIsCalfModalOpen(false);
      resetCalf();
      fetchData();
      alert('✨ Calf successfully registered into Herd Directory & family tree linked!');
    } catch {
      alert('Failed to register calf.');
    }
  };

  // Distribution chart data
  const pregnantCount = records.filter(r => r.expected_calving_date && r.outcome !== 'Successful').length;
  const inseminatedCount = records.filter(r => r.event_type === 'Insemination' && r.outcome === 'Pending').length;
  const heatCount = records.filter(r => r.event_type === 'Heat').length;

  const analyticsPieData = [
    { name: 'Confirmed Pregnant', value: pregnantCount || 2 },
    { name: 'AI Inseminated', value: inseminatedCount || 3 },
    { name: 'Heat Observed', value: heatCount || 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Breeding & Gestation Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Heat detection, AI inseminations, bull details, pregnancy confirmation, 283-day delivery countdown, and family tree pedigree.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Breeding Event
          </button>
        </div>
      </div>

      {/* Delivery Countdown Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.filter(r => r.expected_calving_date && r.outcome !== 'Successful').map((preg) => (
          <div
            key={preg.id}
            className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-glow shrink-0">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Confirmed Pregnancy Calving Countdown
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {preg.cattle_name} ({preg.cattle_tag})
                </h3>
                <p className="text-xs text-slate-400 font-mono">Expected: {preg.expected_calving_date}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">Remaining</span>
              <span className="text-2xl font-black text-indigo-400 animate-pulse">
                {preg.days_remaining || 245} Days
              </span>
              <button
                onClick={() => handleOpenCalfModal(preg)}
                className="mt-1 px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-400 shadow-glow block ml-auto"
              >
                + Register Calf
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'events' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Breeding & Calving History ({records.length})
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'tree' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" /> Family Tree Pedigree Mapper
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Pregnancy Analytics & Success Rates
        </button>
      </div>

      {/* Tab 1: Breeding History Table */}
      {activeTab === 'events' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Cattle Tag / Name</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Event Date</th>
                <th className="p-3.5">Bull / Sire Info</th>
                <th className="p-3.5">Expected Calving</th>
                <th className="p-3.5">Outcome</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold">
                    <span className="font-mono text-emerald-500">{r.cattle_tag || 'FE-CAT-2026-001'}</span> - {r.cattle_name || 'Ganga'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-bold text-[11px] border border-purple-500/20">
                      {r.event_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">{r.event_date}</td>
                  <td className="p-3.5 text-slate-400">{r.sire_info || 'BULL-92 (Jersey)'}</td>
                  <td className="p-3.5 font-bold text-indigo-400">
                    {r.expected_calving_date || 'N/A (Heat log)'}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={r.outcome === 'Successful' ? 'healthy' : r.outcome === 'Failed' ? 'sick' : 'under_treatment'}>
                      {r.outcome}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    {r.expected_calving_date && r.outcome !== 'Successful' && (
                      <button
                        onClick={() => handleOpenCalfModal(r)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold text-[10px] border border-emerald-500/30"
                      >
                        + Register Calf
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Family Tree Pedigree visualizer */}
      {activeTab === 'tree' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-300">Select Cattle Node to Inspect Lineage:</span>
            <select
              value={selectedCattleForTree?.id || ''}
              onChange={(e) => {
                const found = cattleList.find(c => c.id === e.target.value);
                if (found) setSelectedCattleForTree(found);
              }}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-400 font-bold"
            >
              {cattleList.map(c => (
                <option key={c.id} value={c.id}>{c.tag_number} - {c.name} ({c.breed})</option>
              ))}
            </select>
          </div>

          {selectedCattleForTree && (
            <FamilyTree cattle={selectedCattleForTree} allCattle={cattleList} />
          )}
        </div>
      )}

      {/* Tab 3: Pregnancy Analytics */}
      {activeTab === 'analytics' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Herd Pregnancy Distribution & AI Success Rates
          </h3>
          <p className="text-xs text-slate-500">Breakdown of confirmed pregnancies, AI inseminations, and heat observation cycles.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analyticsPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {analyticsPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PREGNANCY_COLORS[index % PREGNANCY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modal: Log Breeding Event */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Log Breeding / AI Insemination Event">
        <form onSubmit={subRecord(handleCreateBreedingRecord)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Female Cow</label>
            <select {...regRecord('cattle_id')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold">
              <option value="">Select cattle...</option>
              {cattleList.filter(c => c.gender === 'female').map(c => (
                <option key={c.id} value={c.id}>{c.tag_number} - {c.name} ({c.breed})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Breeding Event Type</label>
              <select {...regRecord('event_type')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-rose-400">
                <option value="Heat">Heat Observation</option>
                <option value="Insemination">Artificial Insemination (AI)</option>
                <option value="Pregnancy Check">Pregnancy Confirmation Check</option>
                <option value="Calving">Calving Record</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Date</label>
              <input {...regRecord('event_date')} type="date" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          {(selectedEventType === 'Insemination' || selectedEventType === 'Pregnancy Check') && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-bold flex items-center justify-between">
              <span>✨ 283-Day Gestation Auto Predictor:</span>
              <span className="font-mono text-white">Expected Calving ~ 283 Days</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Sire / Bull Info</label>
              <input {...regRecord('sire_info')} type="text" placeholder="BULL-92 (Jersey High Merit)" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Bull Tag ID</label>
              <input {...regRecord('sire_tag')} type="text" placeholder="BULL-92" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Outcome Status</label>
              <select {...regRecord('outcome')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <option value="Pending">Pending / In Progress</option>
                <option value="Successful">Successful (Confirmed Pregnant)</option>
                <option value="Failed">Failed / Repeat Heat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Technician / Vet Name</label>
              <input {...regRecord('technician_name')} type="text" placeholder="Dr. Marcus Vance" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-glow">Save Event</button>
          </div>
        </form>
      </Modal>

      {/* Modal: 1-Click Calf Registration into Herd Directory */}
      <Modal isOpen={isCalfModalOpen} onClose={() => setIsCalfModalOpen(false)} title="1-Click Calf Registration & Link Parents">
        <form onSubmit={subCalf(handleRegisterCalf)} className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold">
            🎉 Registering newborn calf! System will automatically link Dam (Mother) and Sire (Father) tag numbers in the Herd Directory family tree.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Calf Nickname</label>
              <input {...regCalf('calf_name')} type="text" placeholder="Choti / Little Ganga" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Calf Gender</label>
              <select {...regCalf('calf_gender')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <option value="female">Female (Heifer Calf)</option>
                <option value="male">Male (Bull Calf)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Calf Breed</label>
              <input {...regCalf('breed')} type="text" placeholder="Gir Cross" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Birth Weight (kg)</label>
              <input {...regCalf('birth_weight')} type="number" placeholder="32" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Delivery Type</label>
              <select {...regCalf('delivery_type')} className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <option value="Normal">Normal Delivery</option>
                <option value="Assisted">Assisted Delivery</option>
                <option value="C-Section">C-Section</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Dam (Mother) Tag ID</label>
              <input {...regCalf('dam_tag')} type="text" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-purple-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Sire (Father) Tag ID</label>
              <input {...regCalf('sire_tag')} type="text" className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold text-indigo-400" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCalfModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-glow">Register Calf & Link Lineage</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
