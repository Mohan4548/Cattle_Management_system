import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Cattle, PurchaseDocument, OwnershipRecord } from '../types';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { DigitalIdentityCard } from '../modules/digitalIdentity/components/DigitalIdentityCard';
import { CattleHealthRiskCard } from '../modules/healthRisk/components/CattleHealthRiskCard';
import {
  Beef,
  ArrowLeft,
  Printer,
  Edit,
  Trash2,
  Calendar,
  Scale,
  Ruler,
  Palette,
  ShieldAlert,
  User,
  Phone,
  DollarSign,
  Dna,
  Stethoscope,
  Milk,
  Image as ImageIcon,
  Clock,
  Sparkles,
  QrCode,
  Fingerprint,
  ScanLine,
  ShoppingCart,
  Truck,
  FileText,
  MapPin,
  Hash,
  Building2,
  Plus,
  X,
  CheckCircle2,
  IndianRupee,
  Download,
  Tag,
  Syringe,
  Thermometer,
  Activity,
  AlertTriangle,
} from 'lucide-react';

type TabType = 'timeline' | 'gallery' | 'health' | 'ai-health' | 'milk' | 'identity' | 'purchase' | 'documents';

export const CattleProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cattle, setCattle]           = useState<Cattle | null>(null);
  const [activeTab, setActiveTab]     = useState<TabType>('timeline');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [docs, setDocs]               = useState<PurchaseDocument[]>([]);
  const [ownership, setOwnership]     = useState<OwnershipRecord[]>([]);
  const [showAddDoc, setShowAddDoc]   = useState(false);
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [docForm, setDocForm]         = useState({ doc_name: '', doc_type: 'Purchase Invoice', file_url: '' });
  const [ownerForm, setOwnerForm]     = useState({ owner_name: '', owner_contact: '', transfer_date: '', transfer_price: '', transfer_location: '', transfer_notes: '' });
  const [savingDoc, setSavingDoc]     = useState(false);

  // ─── Per-cattle health data (lazy loaded when health tab opens) ───────────
  const [cattleHealthRecords, setCattleHealthRecords] = useState<any[]>([]);
  const [cattleVaccinations, setCattleVaccinations]   = useState<any[]>([]);
  const [healthLoading, setHealthLoading]             = useState(false);
  const [healthLoaded, setHealthLoaded]               = useState(false);

  // Compute vaccination status from next_due_date
  const vaccinationStatus = (nextDue?: string): { label: string; cls: string } => {
    if (!nextDue) return { label: '⚪ Not Recorded', cls: 'badge-slate' };
    const today = new Date(); today.setHours(0,0,0,0);
    const due   = new Date(nextDue); due.setHours(0,0,0,0);
    const diff  = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    if (diff < 0)   return { label: '🔴 Overdue',     cls: 'badge-rose' };
    if (diff <= 30) return { label: '🟡 Due Soon',    cls: 'badge-amber' };
    return               { label: '🟢 Up to Date',  cls: 'badge-green' };
  };

  const fetchCattle = async () => {
    try {
      const res = await apiClient.get(`/cattle/${id}`);
      setCattle(res.data);
      if (res.data?.image_url) setSelectedPhoto(res.data.image_url);
      // Fetch purchase docs and ownership history
      try {
        const [docsRes, ownRes] = await Promise.all([
          apiClient.get(`/cattle/${id}/purchase-documents`),
          apiClient.get(`/cattle/${id}/ownership-history`),
        ]);
        setDocs(Array.isArray(docsRes.data) ? docsRes.data : []);
        setOwnership(Array.isArray(ownRes.data) ? ownRes.data : []);
      } catch {
        // Non-critical — silently ignore if routes not yet available
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoading(false);
    }
  };

  const fetchCattleHealth = async () => {
    if (!id || healthLoaded) return;
    setHealthLoading(true);
    try {
      const [hRes, vRes] = await Promise.all([
        apiClient.get('/health', { params: { cattle_id: id } }),
        apiClient.get('/vaccinations', { params: { cattle_id: id } }),
      ]);
      setCattleHealthRecords(Array.isArray(hRes.data) ? hRes.data : []);
      setCattleVaccinations(Array.isArray(vRes.data) ? vRes.data : []);
      setHealthLoaded(true);
    } catch {
      // Silently ignore — backend may not support cattle_id filter yet
      setHealthLoaded(true);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchCattle();
  }, [id]);

  // Lazy-load health data when health tab is first opened
  useEffect(() => {
    if (activeTab === 'health') fetchCattleHealth();
  }, [activeTab]);

  const handleDelete = async () => {
    if (!cattle) return;
    if (!window.confirm(`Are you sure you want to delete ${cattle.name} (${cattle.tag_number})?`)) return;
    try {
      await apiClient.delete(`/cattle/${cattle.id}`);
      navigate('/cattle');
    } catch {
      alert('Failed to delete cattle record.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cattle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Cattle Record Not Found</h2>
        <Link to="/cattle" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">
          Return to Herd Directory
        </Link>
      </div>
    );
  }

  const gallery = cattle.gallery && cattle.gallery.length > 0 ? cattle.gallery : [cattle.image_url];

  const fmtCurrency = (n?: number) => n ? `₹${n.toLocaleString('en-IN')}` : '—';
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    try { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)); }
    catch { return d; }
  };

  const totalAcq = (
    (cattle.purchase_cost ?? 0) +
    (cattle.transportation_cost ?? 0) +
    (cattle.initial_medical_cost ?? 0) +
    (cattle.other_purchase_cost ?? 0)
  );

  const addDocument = async () => {
    if (!cattle || !docForm.doc_name || !docForm.file_url) return;
    setSavingDoc(true);
    try {
      const res = await apiClient.post(`/cattle/${cattle.id}/purchase-documents`, docForm);
      setDocs(prev => [...prev, res.data]);
      setDocForm({ doc_name: '', doc_type: 'Purchase Invoice', file_url: '' });
      setShowAddDoc(false);
    } catch { alert('Failed to add document.'); }
    finally { setSavingDoc(false); }
  };

  const deleteDocument = async (docId: string) => {
    if (!cattle || !window.confirm('Delete this document?')) return;
    try {
      await apiClient.delete(`/cattle/${cattle.id}/purchase-documents/${docId}`);
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch { alert('Failed to delete document.'); }
  };

  const addOwnership = async () => {
    if (!cattle || !ownerForm.owner_name || !ownerForm.transfer_date) return;
    setSavingDoc(true);
    try {
      const res = await apiClient.post(`/cattle/${cattle.id}/ownership-history`, ownerForm);
      setOwnership(prev => [...prev, res.data]);
      setOwnerForm({ owner_name: '', owner_contact: '', transfer_date: '', transfer_price: '', transfer_location: '', transfer_notes: '' });
      setShowAddOwner(false);
    } catch { alert('Failed to add ownership record.'); }
    finally { setSavingDoc(false); }
  };

  const DOC_TYPES = ['Purchase Invoice','Sale Agreement','Ownership Document','Registration Certificate','Transportation Document','Previous Owner Document','Other Purchase Document'];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'timeline',  label: 'Lifetime Timeline',      icon: <Clock className="w-4 h-4" /> },
    { id: 'gallery',   label: `Photos (${gallery.length})`, icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'health',    label: 'Medical Records',         icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'ai-health', label: 'AI Health Risk',          icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
    { id: 'milk',      label: 'Production Logs',         icon: <Milk className="w-4 h-4" /> },
    { id: 'purchase',  label: 'Purchase Details',        icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'documents', label: `Documents (${docs.length})`, icon: <FileText className="w-4 h-4" /> },
    { id: 'identity',  label: 'Digital Identity & QR',   icon: <QrCode className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/cattle"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl glass-panel hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-500" />
            Print Passport
          </button>

          {/* Phase 3: Scan Another QR */}
          <button
            onClick={() => navigate('/qr-scanner')}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ScanLine className="w-4 h-4" />
            Scan Another QR
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Passport Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Profile Banner */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={selectedPhoto || cattle.image_url}
              alt={cattle.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-xl"
            />

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 text-white font-mono text-sm font-extrabold tracking-wider border border-white/10 shadow-md">
                  {cattle.tag_number}
                </span>
                <Badge variant={cattle.health_status}>
                  {cattle.health_status.replace('_', ' ')}
                </Badge>
                {/* Digital Identity badge */}
                {cattle.digital_identity_id && (
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 font-mono text-xs font-extrabold tracking-wider border border-indigo-500/20 flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" />
                    {cattle.digital_identity_id}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {cattle.name}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Breed: {cattle.breed}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Age: {cattle.age}
                </span>
                <span className="capitalize px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Stage: {cattle.lactation_stage}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Tag — now pulls from digital identity data */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shrink-0 shadow-sm">
            {cattle.digital_identity_id ? (
              <button
                onClick={() => setActiveTab('identity')}
                className="flex flex-col items-center gap-1.5 group"
                title="Click to view full QR & Digital Identity"
              >
                <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                  <QrCode className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">
                  View QR Code →
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  <QrCode className="w-10 h-10 text-slate-300" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  No QR yet
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Physical Attributes & Owner Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-500" /> Weight
            </span>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{cattle.weight_kg} kg</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-teal-500" /> Height
            </span>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{cattle.height_cm || 135} cm</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-500" /> Color
            </span>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{cattle.color || 'Brown'}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Horn Type
            </span>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{cattle.horn_type || 'Short'}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-purple-500" /> Owner Details
            </span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.owner_name || 'Green Valley Farm'}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> Phone
            </span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.owner_phone || '+91 98765 43210'}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Purchase Date
            </span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.purchase_date || cattle.date_of_birth}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Purchase Cost
            </span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">₹{(cattle.purchase_cost || 85000).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 print:hidden overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Cattle Lifetime Event History
            </h3>
            <div className="relative border-l-2 border-emerald-500/30 ml-3 space-y-6 pl-6">
              {(cattle.timeline || [
                { id: '1', title: 'Birth Record', date: cattle.date_of_birth, category: 'birth', description: `Calf born on farm.` },
                { id: '2', title: 'Registration & Tagging', date: cattle.created_at?.split('T')[0], category: 'purchase', description: `Assigned Cattle ID ${cattle.tag_number}.` },
                ...(cattle.purchase_date ? [{ id: 'p1', title: `${cattle.purchase_type || 'Purchased'} – ${cattle.name}`, date: cattle.purchase_date, category: 'purchase', description: `${cattle.purchase_type || 'Purchased'} for ₹${(cattle.purchase_cost || 0).toLocaleString('en-IN')}${cattle.seller_name ? ` from ${cattle.seller_name}` : ''}${cattle.purchase_location ? ` at ${cattle.purchase_location}` : ''}.` }] : []),
                ...(cattle.digital_identity_id ? [{ id: 'di1', title: 'Digital Identity Assigned', date: cattle.qr_created_at?.split('T')[0] || cattle.created_at?.split('T')[0], category: 'identity', description: `Digital Identity ${cattle.digital_identity_id} assigned. QR Code generated.` }] : []),
                ...cattleHealthRecords.slice(0, 3).map((h: any, i: number) => ({ id: `h${i}`, title: `Health Record – ${h.diagnosis || h.record_type || 'Checkup'}`, date: h.record_date || h.created_at?.split('T')[0], category: 'health' as const, description: `${h.record_type || 'Checkup'}${h.veterinarian_name ? ` by ${h.veterinarian_name}` : ''}${h.cost ? `. Cost: ₹${h.cost}` : ''}.` })),
                ...cattleVaccinations.slice(0, 2).map((v: any, i: number) => ({ id: `v${i}`, title: `Vaccination – ${v.vaccine_name}`, date: v.administered_date, category: 'vaccination' as const, description: `${v.vaccine_name}${v.administered_by ? ` administered by ${v.administered_by}` : ''}. Next due: ${v.next_due_date || '—'}.` })),
              ]).map((evt: any) => (
                <div key={evt.id} className="relative group">
                  <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{evt.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">{evt.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Cattle Photo Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(img)}
                  className={`relative h-32 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedPhoto === img ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-transparent hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: AI Health Risk */}
        {activeTab === 'ai-health' && (
          <div className="space-y-4 pt-2">
            <CattleHealthRiskCard cattleId={cattle.id} cattleName={cattle.name} />
          </div>
        )}

        {/* Tab Content 3: Health – full per-cattle panel */}
        {activeTab === 'health' && (
          <div className="space-y-5 pt-2">
            <CattleHealthRiskCard cattleId={cattle.id} cattleName={cattle.name} />

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-500" />
                Medical Records & Vaccination
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  to="/health"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Health Record
                </Link>
              </div>
            </div>

            {/* Health Status Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-500" /> Health Status
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1 capitalize">{cattle.health_status.replace('_', ' ')}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-500" /> Records
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {cattleHealthRecords.length > 0 ? `${cattleHealthRecords.length} records` : (cattle.health_records?.length ?? 0) + ' records'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Syringe className="w-3 h-3 text-violet-500" /> Vaccinations
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {cattleVaccinations.length > 0 ? `${cattleVaccinations.length} records` : (cattle.vaccinations?.length ?? 0) + ' records'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-teal-500" /> Weight
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">{cattle.weight_kg} kg</p>
              </div>
            </div>

            {healthLoading && (
              <div className="flex items-center gap-2 py-4 justify-center">
                <span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Loading health records…</span>
              </div>
            )}

            {/* ── Vaccinations ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Syringe className="w-3.5 h-3.5 text-violet-500" /> Vaccination Status
                </h4>
                <Link to="/health" className="text-[10px] font-bold text-violet-500 hover:underline">+ Add Vaccination</Link>
              </div>
              {(() => {
                const vacs = cattleVaccinations.length > 0 ? cattleVaccinations : (cattle.vaccinations || []);
                if (vacs.length === 0) return (
                  <div className="flex flex-col items-center py-6 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <Syringe className="w-6 h-6 text-slate-300 mb-1.5" />
                    <p className="text-xs text-slate-400 italic">No vaccinations recorded. Visit Health & Vet to add.</p>
                  </div>
                );
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="p-2.5 text-left">Vaccine</th>
                          <th className="p-2.5 text-left">Administered</th>
                          <th className="p-2.5 text-left">Next Due</th>
                          <th className="p-2.5 text-left">Status</th>
                          <th className="p-2.5 text-left">By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {vacs.map((v: any) => {
                          const st = vaccinationStatus(v.next_due_date);
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">{v.vaccine_name}</td>
                              <td className="p-2.5 font-mono text-slate-400">{v.administered_date || '—'}</td>
                              <td className="p-2.5 font-bold text-violet-500">{v.next_due_date || '—'}</td>
                              <td className="p-2.5"><span className={`badge-pill ${st.cls} text-[10px]`}>{st.label}</span></td>
                              <td className="p-2.5 text-slate-400">{v.administered_by || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* ── Medical Records ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-purple-500" /> Medical Records & Treatments
                </h4>
                <Link to="/health" className="text-[10px] font-bold text-purple-500 hover:underline">+ Log Treatment</Link>
              </div>
              {(() => {
                const records = cattleHealthRecords.length > 0 ? cattleHealthRecords : (cattle.health_records || []);
                if (records.length === 0) return (
                  <div className="flex flex-col items-center py-6 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <Stethoscope className="w-6 h-6 text-slate-300 mb-1.5" />
                    <p className="text-xs text-slate-400 italic">No health records logged. Visit Health & Vet to add.</p>
                  </div>
                );
                return (
                  <div className="space-y-3">
                    {records.map((h: any) => (
                      <div key={h.id} className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                        h.is_emergency ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50' : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {h.is_emergency && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                            <span className="font-bold text-slate-900 dark:text-white">{h.diagnosis}</span>
                            <Badge variant={h.status === 'active' ? 'under_treatment' : 'completed'}>{h.status || 'active'}</Badge>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{h.record_date || h.created_at?.split('T')[0] || '—'}</span>
                        </div>
                        <div className="flex items-center gap-4 p-2.5 rounded-xl bg-white/60 dark:bg-slate-950/60 font-semibold text-[var(--text-secondary)]">
                          {h.body_temp_c && <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-rose-400" />{h.body_temp_c}°C</span>}
                          {h.heart_rate_bpm && <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-teal-400" />{h.heart_rate_bpm} bpm</span>}
                          {h.cost > 0 && <span className="ml-auto font-bold text-emerald-500">₹{h.cost}</span>}
                        </div>
                        {h.treatment && <p className="text-slate-500"><strong>Treatment:</strong> {h.treatment}</p>}
                        {h.medicine_prescribed && <p className="text-violet-500 font-bold">Rx: {h.medicine_prescribed}</p>}
                        {h.veterinarian_name && <p className="text-[10px] text-slate-400">Vet: {h.veterinarian_name}</p>}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Link to full Health page */}
            <div className="flex items-center justify-center pt-2">
              <Link
                to="/health"
                className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1"
              >
                <Stethoscope className="w-3.5 h-3.5" /> View full Health & Vaccination management →
              </Link>
            </div>
          </div>
        )}

        {/* Tab Content 4: Milk */}
        {activeTab === 'milk' && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Milk className="w-4 h-4 text-teal-500" />
              Milk Production Log History
            </h3>
            {(cattle.milk_logs || []).length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Session</th>
                    <th className="p-2.5">Yield (Liters)</th>
                    <th className="p-2.5">FAT %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cattle.milk_logs?.map((m: any) => (
                    <tr key={m.id}>
                      <td className="p-2.5">{m.log_date}</td>
                      <td className="p-2.5 capitalize">{m.session}</td>
                      <td className="p-2.5 font-bold text-emerald-500">{m.yield_liters} L</td>
                      <td className="p-2.5">{m.fat_percentage ? `${m.fat_percentage}%` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-400 italic">No milk production logs recorded.</p>
            )}
          </div>
        )}

        {/* Tab Content 5: Digital Identity & QR */}
        {activeTab === 'identity' && (
          <div className="pt-2">
            <DigitalIdentityCard cattle={cattle} />
          </div>
        )}

        {/* Tab Content 6: Purchase Details */}
        {activeTab === 'purchase' && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                Purchase & Acquisition Details
              </h3>
              {['admin', 'farmer'].includes(user?.role || '') && (
                <a
                  href="/purchases"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit in Purchase Registry
                </a>
              )}
            </div>

            {/* Acquisition Type & Key Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-500" /> Purchase Type
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {cattle.purchase_type || '—'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-500" /> Purchase Date
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {fmtDate(cattle.purchase_date)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" /> Location
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {cattle.purchase_location || '—'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <FileText className="w-3 h-3 text-violet-500" /> Invoice No.
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {cattle.invoice_number || '—'}
                </p>
              </div>
            </div>

            {/* Acquisition Cost Breakdown */}
            {cattle.purchase_type !== 'Born on Farm' && (
              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acquisition Cost Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                      <IndianRupee className="w-3 h-3" /> Purchase Price
                    </p>
                    <p className="text-lg font-black text-emerald-500 mt-0.5">{fmtCurrency(cattle.purchase_cost)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                      <Truck className="w-3 h-3" /> Transport
                    </p>
                    <p className="text-lg font-black text-amber-500 mt-0.5">{fmtCurrency(cattle.transportation_cost)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                      <Stethoscope className="w-3 h-3" /> Medical
                    </p>
                    <p className="text-lg font-black text-purple-500 mt-0.5">{fmtCurrency(cattle.initial_medical_cost)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Other</p>
                    <p className="text-lg font-black text-slate-700 dark:text-slate-200 mt-0.5">{fmtCurrency(cattle.other_purchase_cost)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Total Acquisition Cost</span>
                  <span className="text-2xl font-black text-emerald-500">
                    {totalAcq > 0 ? `₹${totalAcq.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            )}

            {/* Seller & Previous Owner */}
            {cattle.purchase_type !== 'Born on Farm' && (
              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Seller & Previous Owner
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Seller Name</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.seller_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Seller Contact</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.seller_contact || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Seller Address</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.seller_address || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Previous Owner</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.previous_owner || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Previous Owner Contact</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{cattle.previous_owner_contact || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Owner & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-500" /> Current Owner
                </span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{cattle.owner_name || '—'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{cattle.owner_phone || ''}</p>
              </div>
              {cattle.purchase_reference && (
                <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 uppercase font-semibold text-[10px] flex items-center gap-1">
                    <Hash className="w-3 h-3 text-indigo-500" /> Purchase Reference
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white mt-1 font-mono text-sm">{cattle.purchase_reference}</p>
                </div>
              )}
            </div>

            {cattle.purchase_notes && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30">
                <span className="text-amber-600 dark:text-amber-400 uppercase font-semibold text-[10px]">Purchase Notes</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{cattle.purchase_notes}</p>
              </div>
            )}

            {!cattle.purchase_date && !cattle.purchase_cost && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-500">No purchase details recorded yet.</p>
                {['admin', 'farmer'].includes(user?.role || '') && (
                  <a href="/purchases" className="mt-2 text-xs text-emerald-500 hover:underline font-semibold">
                    Add purchase details in the Purchase Registry →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 7: Documents & Ownership History */}
        {activeTab === 'documents' && (
          <div className="space-y-6 pt-2">

            {/* ── Purchase Documents ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Purchase Documents
                </h3>
                {['admin', 'farmer'].includes(user?.role || '') && (
                  <button
                    onClick={() => setShowAddDoc(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Document
                  </button>
                )}
              </div>

              {docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700">
                  <FileText className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 italic">No purchase documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.doc_name}</p>
                          <p className="text-[10px] text-slate-500">{doc.doc_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {['admin', 'farmer'].includes(user?.role || '') && (
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Ownership History ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Ownership History
                </h3>
                {['admin', 'farmer'].includes(user?.role || '') && (
                  <button
                    onClick={() => setShowAddOwner(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Transfer
                  </button>
                )}
              </div>

              {ownership.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700">
                  <User className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 italic">No ownership transfers recorded yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-indigo-500/30 ml-3 space-y-4 pl-6">
                  {ownership.map((rec) => (
                    <div key={rec.id} className="relative">
                      <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.owner_name}</span>
                          <span className="text-[10px] font-mono text-indigo-500 font-bold">{rec.transfer_date}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                          {rec.transfer_price && <span>₹{Number(rec.transfer_price).toLocaleString('en-IN')}</span>}
                          {rec.transfer_location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{rec.transfer_location}</span>}
                          {rec.owner_contact && <span>{rec.owner_contact}</span>}
                        </div>
                        {rec.transfer_notes && <p className="text-[11px] text-slate-400 mt-1 italic">{rec.transfer_notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Document Modal ── */}
      {showAddDoc && (
        <Modal isOpen={showAddDoc} onClose={() => setShowAddDoc(false)} title="Add Purchase Document" maxWidth="md">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Document Name *</label>
              <input
                type="text"
                value={docForm.doc_name}
                onChange={e => setDocForm(f => ({ ...f, doc_name: e.target.value }))}
                placeholder="Purchase Invoice – Lakshmi Farms"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Document Type</label>
              <select
                value={docForm.doc_type}
                onChange={e => setDocForm(f => ({ ...f, doc_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none"
              >
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">File URL / Link *</label>
              <input
                type="url"
                value={docForm.file_url}
                onChange={e => setDocForm(f => ({ ...f, file_url: e.target.value }))}
                placeholder="https://drive.google.com/…"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowAddDoc(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={addDocument}
                disabled={savingDoc || !docForm.doc_name || !docForm.file_url}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingDoc ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Document
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Ownership Transfer Modal ── */}
      {showAddOwner && (
        <Modal isOpen={showAddOwner} onClose={() => setShowAddOwner(false)} title="Record Ownership Transfer" maxWidth="md">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">New Owner Name *</label>
                <input
                  type="text"
                  value={ownerForm.owner_name}
                  onChange={e => setOwnerForm(f => ({ ...f, owner_name: e.target.value }))}
                  placeholder="Rajan Cattle Co."
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Owner Contact</label>
                <input
                  type="text"
                  value={ownerForm.owner_contact}
                  onChange={e => setOwnerForm(f => ({ ...f, owner_contact: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Transfer Date *</label>
                <input
                  type="date"
                  value={ownerForm.transfer_date}
                  onChange={e => setOwnerForm(f => ({ ...f, transfer_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Transfer Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={ownerForm.transfer_price}
                  onChange={e => setOwnerForm(f => ({ ...f, transfer_price: e.target.value }))}
                  placeholder="95000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Transfer Location</label>
                <input
                  type="text"
                  value={ownerForm.transfer_location}
                  onChange={e => setOwnerForm(f => ({ ...f, transfer_location: e.target.value }))}
                  placeholder="Coimbatore Cattle Market"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={ownerForm.transfer_notes}
                  onChange={e => setOwnerForm(f => ({ ...f, transfer_notes: e.target.value }))}
                  placeholder="Additional notes…"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowAddOwner(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={addOwnership}
                disabled={savingDoc || !ownerForm.owner_name || !ownerForm.transfer_date}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingDoc ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Transfer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
