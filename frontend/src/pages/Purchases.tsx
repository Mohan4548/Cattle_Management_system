import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Cattle } from '../types';
import {
  ShoppingCart, Search, Filter, Edit, Eye, Download, TrendingUp,
  IndianRupee, Calendar, Beef, ArrowUpDown, ArrowUp, ArrowDown,
  CheckCircle2, AlertCircle, RefreshCw, Tag, User, Phone, Clock,
  X, ChevronLeft, ChevronRight, MapPin, FileText, Hash, Truck,
  Stethoscope, BarChart2, Printer, Package, Building2,
} from 'lucide-react';

const PURCHASE_TYPES = ['Purchased', 'Transferred', 'Inherited', 'Rescued', 'Born on Farm'] as const;

const purchaseSchema = z.object({
  purchase_type: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.coerce.number().min(0, 'Cannot be negative').optional(),
  invoice_number: z.string().optional(),
  purchase_reference: z.string().optional(),
  purchase_location: z.string().optional(),
  seller_name: z.string().optional(),
  seller_contact: z.string().optional(),
  seller_address: z.string().optional(),
  previous_owner: z.string().optional(),
  previous_owner_contact: z.string().optional(),
  transportation_cost: z.coerce.number().min(0, 'Cannot be negative').optional(),
  initial_medical_cost: z.coerce.number().min(0, 'Cannot be negative').optional(),
  other_purchase_cost: z.coerce.number().min(0, 'Cannot be negative').optional(),
  purchase_notes: z.string().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;
type SortKey = 'purchase_date' | 'purchase_cost' | 'total_acquisition_cost' | 'name' | 'breed';
type SortDir = 'asc' | 'desc';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

const fmtCurrency = (n: number) => `\u20b9${n.toLocaleString('en-IN')}`;
const fmtDate = (d?: string) => {
  if (!d) return '\u2014';
  try { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)); }
  catch { return d; }
};

const INDIAN_BREEDS = [
  'Kangayam','Gir','Sahiwal','Ongole','Hallikar',
  'Red Sindhi','Tharparkar','Hariana',
  'Holstein Friesian','Jersey','Brown Swiss','Angus','Guernsey',
];

const SortIcon: React.FC<{ col: SortKey; sortKey: SortKey; sortDir: SortDir }> = ({ col, sortKey, sortDir }) => {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)] opacity-50" />;
  return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-[var(--accent-green)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent-green)]" />;
};

export const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [allCattle, setAllCattle]         = useState<Cattle[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [selectedPurchaseType, setSelectedPurchaseType] = useState('all');
  const [filterHasPurchase, setFilterHasPurchase] = useState<'all'|'yes'|'no'>('all');
  const [sortKey, setSortKey]             = useState<SortKey>('purchase_date');
  const [sortDir, setSortDir]             = useState<SortDir>('desc');
  const [currentPage, setCurrentPage]     = useState(1);
  const [activeView, setActiveView]       = useState<'table'|'charts'>('table');
  const ITEMS_PER_PAGE = 10;
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [saving, setSaving]               = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PurchaseFormData>({ resolver: zodResolver(purchaseSchema) });
  const watchedPurchaseCost  = watch('purchase_cost');
  const watchedTransportCost = watch('transportation_cost');
  const watchedMedicalCost   = watch('initial_medical_cost');
  const watchedOtherCost     = watch('other_purchase_cost');
  const watchedPurchaseType  = watch('purchase_type');
  const isBornOnFarm         = watchedPurchaseType === 'Born on Farm';
  const modalTotal = (Number(watchedPurchaseCost)||0)+(Number(watchedTransportCost)||0)+(Number(watchedMedicalCost)||0)+(Number(watchedOtherCost)||0);

  const showToastRef = React.useRef(showToast);
  React.useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  const fetchAllCattle = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await apiClient.get('/cattle', { params: { limit: 500, page: 1 } });
      const data: Cattle[] = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      setAllCattle(data);
    } catch { showToastRef.current('Failed to load cattle records.', 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAllCattle(); }, [fetchAllCattle]);

  const filtered = useMemo(() => {
    let list = [...allCattle];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.tag_number.toLowerCase().includes(q) ||
        (c.owner_name||'').toLowerCase().includes(q) || (c.seller_name||'').toLowerCase().includes(q) ||
        (c.invoice_number||'').toLowerCase().includes(q) || (c.purchase_reference||'').toLowerCase().includes(q) ||
        (c.previous_owner||'').toLowerCase().includes(q) || c.breed.toLowerCase().includes(q)
      );
    }
    if (selectedBreed !== 'all') list = list.filter(c => c.breed === selectedBreed);
    if (selectedPurchaseType !== 'all') list = list.filter(c => (c.purchase_type||'Purchased') === selectedPurchaseType);
    if (filterHasPurchase === 'yes') list = list.filter(c => c.purchase_cost && c.purchase_cost > 0);
    else if (filterHasPurchase === 'no') list = list.filter(c => !c.purchase_cost || c.purchase_cost === 0);
    list.sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'purchase_date': av = a.purchase_date ? new Date(a.purchase_date).getTime() : 0; bv = b.purchase_date ? new Date(b.purchase_date).getTime() : 0; break;
        case 'purchase_cost': av = a.purchase_cost??0; bv = b.purchase_cost??0; break;
        case 'total_acquisition_cost': av = a.total_acquisition_cost??a.purchase_cost??0; bv = b.total_acquisition_cost??b.purchase_cost??0; break;
        case 'name': av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break;
        case 'breed': av = a.breed.toLowerCase(); bv = b.breed.toLowerCase(); break;
        default: av = 0; bv = 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [allCattle, searchTerm, selectedBreed, selectedPurchaseType, filterHasPurchase, sortKey, sortDir]);

  const kpi = useMemo(() => {
    const withCost = allCattle.filter(c => c.purchase_cost && c.purchase_cost > 0);
    const total     = withCost.reduce((s,c) => s+(c.purchase_cost??0),0);
    const avgPrice  = withCost.length ? total/withCost.length : 0;
    const highest   = withCost.reduce((m,c) => Math.max(m,c.purchase_cost??0),0);
    const totalTransp = allCattle.reduce((s,c) => s+(c.transportation_cost??0),0);
    const totalMed  = allCattle.reduce((s,c) => s+(c.initial_medical_cost??0),0);
    const totalAcq  = allCattle.reduce((s,c) => s+(c.total_acquisition_cost??c.purchase_cost??0),0);
    return { total, avgPrice, highest, totalTransp, totalMed, totalAcq, count: withCost.length, missing: allCattle.length-withCost.length };
  }, [allCattle]);

  const chartData = useMemo(() => {
    const typeMap: Record<string,number> = {};
    allCattle.forEach(c => { const t=c.purchase_type||'Purchased'; typeMap[t]=(typeMap[t]||0)+1; });
    const byType = Object.entries(typeMap).map(([name,value],i) => ({ name, value, fill: CHART_COLORS[i%CHART_COLORS.length] }));
    const monthMap: Record<string,{cost:number;acquisition:number}> = {};
    allCattle.forEach(c => {
      if (c.purchase_date) {
        const m = c.purchase_date.substring(0,7);
        if (!monthMap[m]) monthMap[m]={cost:0,acquisition:0};
        monthMap[m].cost += c.purchase_cost??0;
        monthMap[m].acquisition += c.total_acquisition_cost??c.purchase_cost??0;
      }
    });
    const byMonth = Object.entries(monthMap).sort(([a],[b])=>a.localeCompare(b)).slice(-6)
      .map(([month,d]) => ({
        month: new Date(month+'-01').toLocaleDateString('en-IN',{month:'short',year:'2-digit'}),
        cost: Math.round(d.cost/1000), acquisition: Math.round(d.acquisition/1000),
      }));
    return { byType, byMonth };
  }, [allCattle]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedBreed, selectedPurchaseType, filterHasPurchase, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const openEdit = (cattle: Cattle) => {
    setEditingCattle(cattle);
    setValue('purchase_type', cattle.purchase_type??'Purchased');
    setValue('purchase_date', cattle.purchase_date??'');
    setValue('purchase_cost', cattle.purchase_cost??undefined);
    setValue('invoice_number', cattle.invoice_number??'');
    setValue('purchase_reference', cattle.purchase_reference??'');
    setValue('purchase_location', cattle.purchase_location??'');
    setValue('seller_name', cattle.seller_name??'');
    setValue('seller_contact', cattle.seller_contact??'');
    setValue('seller_address', cattle.seller_address??'');
    setValue('previous_owner', cattle.previous_owner??'');
    setValue('previous_owner_contact', cattle.previous_owner_contact??'');
    setValue('transportation_cost', cattle.transportation_cost??undefined);
    setValue('initial_medical_cost', cattle.initial_medical_cost??undefined);
    setValue('other_purchase_cost', cattle.other_purchase_cost??undefined);
    setValue('purchase_notes', cattle.purchase_notes??'');
    setValue('owner_name', cattle.owner_name??'');
    setValue('owner_phone', cattle.owner_phone??'');
  };

  const onSave = async (data: PurchaseFormData) => {
    if (!editingCattle) return;
    setSaving(true);
    try {
      const pc=Number(data.purchase_cost)||0, tc=Number(data.transportation_cost)||0;
      const mc=Number(data.initial_medical_cost)||0, oc=Number(data.other_purchase_cost)||0;
      const payload = { ...data, purchase_cost:pc||null, transportation_cost:tc||null, initial_medical_cost:mc||null, other_purchase_cost:oc||null, total_acquisition_cost:(pc+tc+mc+oc)||null, purchase_created_by:user?.full_name||'Farm Manager' };
      const res = await apiClient.put(`/cattle/${editingCattle.id}`, payload);
      setAllCattle(prev => prev.map(c => c.id===editingCattle.id ? {...c,...res.data} : c));
      showToastRef.current(`Purchase details updated for ${editingCattle.name}`, 'success');
      setEditingCattle(null); reset();
    } catch { showToastRef.current('Failed to update purchase details.', 'error'); }
    finally { setSaving(false); }
  };

  const exportCSV = () => {
    const headers = ['Tag ID','Name','Breed','Gender','Purchase Type','Purchase Date','Purchase Price','Transportation Cost','Initial Medical Cost','Other Cost','Total Acquisition Cost','Invoice Number','Purchase Reference','Purchase Location','Seller Name','Seller Contact','Seller Address','Previous Owner','Previous Owner Contact','Owner Name','Owner Phone','Health Status'];
    const rows = filtered.map(c => [c.tag_number,c.name,c.breed,c.gender,c.purchase_type||'',c.purchase_date||'',c.purchase_cost??'',c.transportation_cost??'',c.initial_medical_cost??'',c.other_purchase_cost??'',c.total_acquisition_cost??c.purchase_cost??'',c.invoice_number||'',c.purchase_reference||'',c.purchase_location||'',c.seller_name||'',c.seller_contact||'',c.seller_address||'',c.previous_owner||'',c.previous_owner_contact||'',c.owner_name||'',c.owner_phone||'',c.health_status]);
    const csv = [headers,...rows].map(r=>r.map(cell=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`farmease-purchases-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} purchase records`,'success');
  };

  return (
    <div className="space-y-5 animate-page-in">
      <Modal isOpen={!!editingCattle} onClose={()=>{setEditingCattle(null);reset();}} title={editingCattle?`Edit Purchase: ${editingCattle.name}`:''} maxWidth="2xl">
        {editingCattle&&(
          <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--accent-green-subtle)] border border-[var(--accent-green)]/20">
              <img src={editingCattle.image_url} alt={editingCattle.name} className="w-12 h-12 rounded-xl object-cover shrink-0"/>
              <div>
                <div className="font-mono text-xs font-bold text-[var(--accent-green)]">{editingCattle.tag_number}</div>
                <div className="font-bold text-sm text-[var(--text-primary)]">{editingCattle.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{editingCattle.breed} · {editingCattle.gender}</div>
              </div>
            </div>
            <div><label className="input-label">Purchase Type</label>
              <select {...register('purchase_type')} className="input-field">
                {PURCHASE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="input-label"><Calendar className="w-3 h-3 inline mr-1"/>Purchase Date</label><input {...register('purchase_date')} type="date" className="input-field"/></div>
              <div><label className="input-label"><MapPin className="w-3 h-3 inline mr-1"/>Purchase Location</label><input {...register('purchase_location')} type="text" placeholder="Chennai Cattle Market" className="input-field"/></div>
              <div><label className="input-label"><FileText className="w-3 h-3 inline mr-1"/>Invoice Number</label><input {...register('invoice_number')} type="text" placeholder="INV-2026-001" className="input-field"/></div>
              <div><label className="input-label"><Hash className="w-3 h-3 inline mr-1"/>Purchase Reference</label><input {...register('purchase_reference')} type="text" placeholder="REF-2026-001" className="input-field"/></div>
            </div>
            {!isBornOnFarm&&(
              <>
                <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-card)] space-y-3">
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Acquisition Cost Breakdown</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="input-label"><IndianRupee className="w-3 h-3 inline mr-1"/>Purchase Price (Rs)</label><input {...register('purchase_cost')} type="number" min="0" step="100" placeholder="85000" className="input-field"/>{errors.purchase_cost&&<p className="text-[11px] text-[var(--accent-rose)] mt-1">{errors.purchase_cost.message}</p>}</div>
                    <div><label className="input-label"><Truck className="w-3 h-3 inline mr-1"/>Transportation Cost (Rs)</label><input {...register('transportation_cost')} type="number" min="0" step="100" placeholder="2500" className="input-field"/>{errors.transportation_cost&&<p className="text-[11px] text-[var(--accent-rose)] mt-1">{errors.transportation_cost.message}</p>}</div>
                    <div><label className="input-label"><Stethoscope className="w-3 h-3 inline mr-1"/>Initial Medical Cost (Rs)</label><input {...register('initial_medical_cost')} type="number" min="0" step="100" placeholder="1500" className="input-field"/>{errors.initial_medical_cost&&<p className="text-[11px] text-[var(--accent-rose)] mt-1">{errors.initial_medical_cost.message}</p>}</div>
                    <div><label className="input-label"><Package className="w-3 h-3 inline mr-1"/>Other Cost (Rs)</label><input {...register('other_purchase_cost')} type="number" min="0" step="100" placeholder="500" className="input-field"/>{errors.other_purchase_cost&&<p className="text-[11px] text-[var(--accent-rose)] mt-1">{errors.other_purchase_cost.message}</p>}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--accent-green-subtle)] border border-[var(--accent-green)]/20">
                    <span className="text-xs font-bold text-[var(--accent-green)]">Total Acquisition Cost</span>
                    <span className="text-xl font-black text-[var(--accent-green)]" style={{fontFamily:'Outfit,sans-serif'}}>{fmtCurrency(modalTotal)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1"><Building2 className="w-3 h-3"/>Seller Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="input-label">Seller Name</label><input {...register('seller_name')} type="text" placeholder="Kumar Farms" className="input-field"/></div>
                    <div><label className="input-label"><Phone className="w-3 h-3 inline mr-1"/>Seller Contact</label><input {...register('seller_contact')} type="text" placeholder="+91 98765 43210" className="input-field"/></div>
                    <div className="sm:col-span-2"><label className="input-label">Seller Address</label><input {...register('seller_address')} type="text" placeholder="123 Farm Road, Coimbatore" className="input-field"/></div>
                    <div><label className="input-label">Previous Owner</label><input {...register('previous_owner')} type="text" placeholder="Rajan Cattle Co." className="input-field"/></div>
                    <div><label className="input-label">Previous Owner Contact</label><input {...register('previous_owner_contact')} type="text" placeholder="+91 98765 43211" className="input-field"/></div>
                  </div>
                </div>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="input-label"><User className="w-3 h-3 inline mr-1"/>Current Owner</label><input {...register('owner_name')} type="text" placeholder="Green Valley Farm" className="input-field"/></div>
              <div><label className="input-label"><Phone className="w-3 h-3 inline mr-1"/>Owner Phone</label><input {...register('owner_phone')} type="text" placeholder="+91 98765 43210" className="input-field"/></div>
            </div>
            <div><label className="input-label">Purchase Notes</label><textarea {...register('purchase_notes')} rows={2} placeholder="Additional notes..." className="input-field"/></div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-card)]">
              <button type="button" onClick={()=>{setEditingCattle(null);reset();}} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving?<span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</span>:<span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/>Save Purchase Details</span>}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[var(--accent-green)]"/>Purchase Registry</h1>
          <p className="page-subtitle">Track purchase history, acquisition costs and seller details for all cattle.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>fetchAllCattle(true)} disabled={refreshing} className="btn-icon" aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${refreshing?'animate-spin':''}`}/></button>
          <button onClick={()=>window.print()} className="btn-secondary"><Printer className="w-3.5 h-3.5"/>Print</button>
          <button onClick={exportCSV} className="btn-secondary"><Download className="w-3.5 h-3.5"/>Export CSV</button>
        </div>
      </div>

      {loading?(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="stat-card p-5 h-24 animate-shimmer"/>)}</div>
      ):(
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card accent-green p-5"><div className="flex items-start justify-between"><div><p className="section-label">Total Investment</p><p className="text-2xl font-black text-[var(--text-primary)] mt-1 leading-none" style={{fontFamily:'Outfit,sans-serif'}}>{fmtCurrency(kpi.total)}</p><p className="text-xs text-[var(--text-muted)] mt-1">{kpi.count} cattle</p></div><div className="icon-box icon-box-green w-10 h-10"><IndianRupee className="w-5 h-5"/></div></div></div>
            <div className="stat-card accent-sky p-5"><div className="flex items-start justify-between"><div><p className="section-label">Total Acquisition</p><p className="text-2xl font-black text-[var(--text-primary)] mt-1 leading-none" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.totalAcq>0?fmtCurrency(kpi.totalAcq):'—'}</p><p className="text-xs text-[var(--text-muted)] mt-1">incl. all costs</p></div><div className="icon-box icon-box-sky w-10 h-10"><TrendingUp className="w-5 h-5"/></div></div></div>
            <div className="stat-card accent-violet p-5"><div className="flex items-start justify-between"><div><p className="section-label">Avg. Purchase Price</p><p className="text-2xl font-black text-[var(--text-primary)] mt-1 leading-none" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.avgPrice>0?fmtCurrency(Math.round(kpi.avgPrice)):'—'}</p><p className="text-xs text-[var(--text-muted)] mt-1">per head</p></div><div className="icon-box icon-box-violet w-10 h-10"><Tag className="w-5 h-5"/></div></div></div>
            <div className="stat-card accent-amber p-5"><div className="flex items-start justify-between"><div><p className="section-label">Missing Purchase Info</p><p className="text-2xl font-black text-[var(--text-primary)] mt-1 leading-none" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.missing}</p><p className="text-xs text-[var(--text-muted)] mt-1">records incomplete</p></div><div className="icon-box icon-box-amber w-10 h-10"><AlertCircle className="w-5 h-5"/></div></div></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-premium p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-amber-500"/></div><div><p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Transportation</p><p className="text-lg font-black text-[var(--text-primary)]" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.totalTransp>0?fmtCurrency(kpi.totalTransp):'—'}</p></div></div>
            <div className="card-premium p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0"><Stethoscope className="w-4 h-4 text-purple-500"/></div><div><p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Initial Medical</p><p className="text-lg font-black text-[var(--text-primary)]" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.totalMed>0?fmtCurrency(kpi.totalMed):'—'}</p></div></div>
            <div className="card-premium p-4 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0"><IndianRupee className="w-4 h-4 text-emerald-500"/></div><div><p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Highest Purchase</p><p className="text-lg font-black text-[var(--text-primary)]" style={{fontFamily:'Outfit,sans-serif'}}>{kpi.highest>0?fmtCurrency(kpi.highest):'—'}</p></div></div>
          </div>
        </>
      )}

      <div className="card-premium p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="search-icon w-3.5 h-3.5"/>
          <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search Tag, Name, Seller, Invoice..." className="search-input w-full"/>
          {searchTerm&&<button onClick={()=>setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-3.5 h-3.5"/></button>}
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="relative"><select value={selectedBreed} onChange={e=>setSelectedBreed(e.target.value)} className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"><option value="all">All Breeds</option>{INDIAN_BREEDS.map(b=><option key={b} value={b}>{b}</option>)}</select><Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
          <div className="relative"><select value={selectedPurchaseType} onChange={e=>setSelectedPurchaseType(e.target.value)} className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"><option value="all">All Types</option>{PURCHASE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select><Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
          <div className="relative"><select value={filterHasPurchase} onChange={e=>setFilterHasPurchase(e.target.value as any)} className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"><option value="all">All Records</option><option value="yes">With Purchase Info</option><option value="no">Missing Info</option></select><Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
          <div className="flex items-center rounded-lg bg-[var(--bg-input)] p-1 border border-[var(--border-base)]">
            <button onClick={()=>setActiveView('table')} className={`p-1.5 rounded-md transition-colors ${activeView==='table'?'bg-[var(--bg-card)] text-[var(--accent-green)] shadow-sm':'text-[var(--text-muted)]'}`} aria-label="Table view"><Beef className="w-3.5 h-3.5"/></button>
            <button onClick={()=>setActiveView('charts')} className={`p-1.5 rounded-md transition-colors ${activeView==='charts'?'bg-[var(--bg-card)] text-[var(--accent-green)] shadow-sm':'text-[var(--text-muted)]'}`} aria-label="Charts view"><BarChart2 className="w-3.5 h-3.5"/></button>
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)]">{filtered.length} result{filtered.length!==1?'s':''}</span>
        </div>
      </div>

      {activeView==='charts'&&!loading&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-premium p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-[var(--accent-green)]"/>Purchases by Month (Rs 000s)</h3>
            {chartData.byMonth.length>0?(
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.byMonth} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)"/>
                  <XAxis dataKey="month" tick={{fontSize:10,fill:'var(--text-muted)'}}/>
                  <YAxis tick={{fontSize:10,fill:'var(--text-muted)'}}/>
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border-card)',borderRadius:'8px',fontSize:'11px'}} formatter={(v:number)=>[`Rs ${v}K`,'']}/>
                  <Legend wrapperStyle={{fontSize:'11px'}}/>
                  <Bar dataKey="cost" name="Purchase Price" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="acquisition" name="Total Acquisition" fill="#6366f1" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ):<div className="flex items-center justify-center h-[220px] text-[var(--text-muted)] text-xs italic">No monthly data yet.</div>}
          </div>
          <div className="card-premium p-5">
            <h3 className="section-title flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-[var(--accent-violet)]"/>Purchase Type Distribution</h3>
            {chartData.byType.length>0?(
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData.byType} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {chartData.byType.map((entry,index)=><Cell key={`cell-${index}`} fill={entry.fill}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border-card)',borderRadius:'8px',fontSize:'11px'}}/>
                </PieChart>
              </ResponsiveContainer>
            ):<div className="flex items-center justify-center h-[220px] text-[var(--text-muted)] text-xs italic">No type data yet.</div>}
          </div>
        </div>
      )}

      {activeView==='table'&&(
        <div className="card-premium overflow-hidden">
          {loading?(<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-3 border-[var(--accent-green)]/20 border-t-[var(--accent-green)] rounded-full animate-spin"/></div>):filtered.length===0?(
            <div className="empty-state py-16">
              <div className="empty-state-icon"><ShoppingCart className="w-6 h-6"/></div>
              <h3 className="section-title">No purchase records found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs text-center">{searchTerm||selectedBreed!=='all'||filterHasPurchase!=='all'||selectedPurchaseType!=='all'?'Try adjusting your filters.':'Add cattle with purchase details to see them here.'}</p>
              <Link to="/cattle" className="btn-primary mt-2"><Beef className="w-3.5 h-3.5"/>Go to Herd Directory</Link>
            </div>
          ):(
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th><button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={()=>toggleSort('name')}>Cattle <SortIcon col="name" sortKey={sortKey} sortDir={sortDir}/></button></th>
                  <th><button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={()=>toggleSort('breed')}>Breed <SortIcon col="breed" sortKey={sortKey} sortDir={sortDir}/></button></th>
                  <th>Purchase Type</th>
                  <th><button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={()=>toggleSort('purchase_date')}>Purchase Date <SortIcon col="purchase_date" sortKey={sortKey} sortDir={sortDir}/></button></th>
                  <th><button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={()=>toggleSort('purchase_cost')}>Purchase Price <SortIcon col="purchase_cost" sortKey={sortKey} sortDir={sortDir}/></button></th>
                  <th><button className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={()=>toggleSort('total_acquisition_cost')}>Total Acquisition <SortIcon col="total_acquisition_cost" sortKey={sortKey} sortDir={sortDir}/></button></th>
                  <th>Seller</th><th>Health</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {paginated.map(cattle=>{
                    const hasCost=!!(cattle.purchase_cost&&cattle.purchase_cost>0);
                    const totalAcq=cattle.total_acquisition_cost??cattle.purchase_cost??0;
                    return(
                      <tr key={cattle.id}>
                        <td><div className="flex items-center gap-3"><img src={cattle.image_url} alt={cattle.name} className="w-9 h-9 rounded-xl object-cover shrink-0"/><div><div className="font-mono text-[11px] font-bold" style={{color:'var(--accent-green)'}}>{cattle.tag_number}</div><div className="font-semibold text-[var(--text-primary)] text-sm">{cattle.name}</div><div className="text-[10px] text-[var(--text-muted)] capitalize">{cattle.gender} · {cattle.age||'—'}</div></div></div></td>
                        <td><span className="text-xs font-semibold text-[var(--text-secondary)]">{cattle.breed}</span></td>
                        <td>{cattle.purchase_type?<span className="badge-pill badge-green text-[10px]">{cattle.purchase_type}</span>:<span className="text-[10px] text-[var(--text-muted)] italic">—</span>}</td>
                        <td>{cattle.purchase_date?(<div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[var(--accent-sky)] shrink-0"/><span className="text-xs font-semibold">{fmtDate(cattle.purchase_date)}</span></div>):(<span className="text-xs text-[var(--text-muted)] italic flex items-center gap-1"><Clock className="w-3 h-3"/>Not recorded</span>)}</td>
                        <td>{hasCost?<span className="text-sm font-black" style={{color:'var(--accent-green)'}}>{fmtCurrency(cattle.purchase_cost!)}</span>:<span className="badge-pill badge-amber">Missing</span>}</td>
                        <td>{totalAcq>0?<span className="text-xs font-bold text-[var(--text-primary)]">{fmtCurrency(totalAcq)}</span>:<span className="text-xs text-[var(--text-muted)]">—</span>}</td>
                        <td><div><div className="text-xs font-semibold text-[var(--text-primary)]">{cattle.seller_name||cattle.owner_name||<span className="text-[var(--text-muted)] italic">Not recorded</span>}</div>{(cattle.seller_contact||cattle.owner_phone)&&<div className="text-[11px] text-[var(--text-muted)]">{cattle.seller_contact||cattle.owner_phone}</div>}</div></td>
                        <td><Badge variant={cattle.health_status}>{cattle.health_status.replace('_',' ')}</Badge></td>
                        <td className="text-right"><div className="flex items-center justify-end gap-1">
                          <Link to={`/cattle/${cattle.id}`} className="btn-icon w-7 h-7" aria-label="View profile"><Eye className="w-3.5 h-3.5"/></Link>
                          {['admin','farmer'].includes(user?.role||'')&&<button onClick={()=>openEdit(cattle)} className="btn-icon w-7 h-7" aria-label="Edit purchase"><Edit className="w-3.5 h-3.5"/></button>}
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading&&filtered.length>0&&activeView==='table'&&(
        <div className="flex items-center justify-between p-3.5 card-premium text-xs">
          <span className="text-[var(--text-muted)]">Showing <strong className="text-[var(--text-primary)]">{Math.min((currentPage-1)*ITEMS_PER_PAGE+1,filtered.length)}</strong> - <strong className="text-[var(--text-primary)]">{Math.min(currentPage*ITEMS_PER_PAGE,filtered.length)}</strong> of <strong className="text-[var(--text-primary)]">{filtered.length}</strong></span>
          <div className="flex items-center gap-1.5">
            <button disabled={currentPage<=1} onClick={()=>setCurrentPage(p=>p-1)} className="btn-icon disabled:opacity-40" aria-label="Previous"><ChevronLeft className="w-4 h-4"/></button>
            <span className="px-2 text-[var(--text-muted)]">Page <strong className="text-[var(--text-primary)]">{currentPage}</strong> of <strong className="text-[var(--text-primary)]">{totalPages}</strong></span>
            <button disabled={currentPage>=totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="btn-icon disabled:opacity-40" aria-label="Next"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      )}
    </div>
  );
};
