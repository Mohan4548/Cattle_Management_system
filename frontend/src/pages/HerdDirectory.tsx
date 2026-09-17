import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Cattle } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BulkQRPanel } from '../modules/digitalIdentity/components/BulkQRPanel';
import { QRViewModal } from '../modules/digitalIdentity/components/QRViewModal';
import { useDigitalIdentity } from '../modules/digitalIdentity/hooks/useDigitalIdentity';
import type { DigitalIdentity } from '../modules/digitalIdentity/types/index';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Beef,
  Calendar,
  Scale,
  Eye,
  Edit,
  Trash2,
  Dna,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Upload,
  SkipForward,
  User,
  Ruler,
  Palette,
  ShieldAlert,
  DollarSign,
  QrCode,
  CheckCircle2,
  Clock,
  Zap,
  ShoppingCart,
  MapPin,
  Phone,
  FileText,
  Hash,
  Truck,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PURCHASE_TYPES = ['Purchased', 'Transferred', 'Inherited', 'Rescued', 'Born on Farm'] as const;


const INDIAN_BREEDS = [
  'Kangayam',
  'Gir',
  'Sahiwal',
  'Ongole',
  'Hallikar',
  'Red Sindhi',
  'Tharparkar',
  'Hariana',
  'Holstein Friesian',
  'Jersey',
  'Brown Swiss',
  'Angus',
  'Guernsey',
];

// ─── QR Status Cell (list view) ───────────────────────────────────────────────
interface QRStatusCellProps {
  cattle: Cattle;
  onViewQR: (identity: DigitalIdentity) => void;
}

const QRStatusCell: React.FC<QRStatusCellProps> = ({ cattle, onViewQR }) => {
  const { identity, loading } = useDigitalIdentity(cattle.id, { autoFetch: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity || !identity.qr_generated) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-[10px] text-amber-500 font-bold">Pending</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${identity.qr_status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
      <button
        onClick={() => onViewQR(identity)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold transition-colors border border-emerald-500/20"
        title={`View QR for ${cattle.name}`}
      >
        <QrCode className="w-3 h-3" />
        View QR
      </button>
    </div>
  );
};

const cattleSchema = z.object({
  tag_number: z.string().optional(),
  name: z.string().min(2, 'Nickname is required'),
  breed: z.string().min(1, 'Please select a breed'),
  gender: z.enum(['female', 'male']),
  date_of_birth: z.string().min(4, 'Date of birth is required'),
  weight_kg: z.coerce.number().min(1, 'Weight must be greater than 0'),
  height_cm: z.coerce.number().optional(),
  color: z.string().optional(),
  horn_type: z.string().optional(),
  health_status: z.enum(['healthy', 'sick', 'under_treatment', 'quarantined', 'pregnant']),
  lactation_stage: z.enum(['early', 'mid', 'late', 'dry', 'heifer', 'bull']),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
  image_url: z.string().optional(),
  notes: z.string().optional(),
  // ─── Extended Purchase Fields ──────────────────────────────────────────────
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
});

type CattleFormData = z.infer<typeof cattleSchema>;

export const HerdDirectory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 6 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedPurchaseTypeFilter, setSelectedPurchaseTypeFilter] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);

  // Photo Upload / Skip toggle
  const [photoOption, setPhotoOption] = useState<'upload' | 'skip'>('skip');

  // Purchase section toggle
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);

  // Phase 2: QR quick-view modal
  const [qrViewCattle, setQrViewCattle] = useState<{ identity: DigitalIdentity; name: string } | null>(null);
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CattleFormData>({
    resolver: zodResolver(cattleSchema),
    defaultValues: {
      gender: 'female',
      breed: 'Gir',
      health_status: 'healthy',
      lactation_stage: 'mid',
      weight_kg: 500,
      height_cm: 135,
      color: 'Reddish Brown',
      horn_type: 'Short Curved',
      date_of_birth: '2023-01-15',
      purchase_type: 'Purchased',
    },
  });

  const selectedDOB = watch('date_of_birth');
  const selectedPurchaseType = watch('purchase_type');
  const watchedPurchaseCost = watch('purchase_cost');
  const watchedTransportCost = watch('transportation_cost');
  const watchedMedicalCost = watch('initial_medical_cost');
  const watchedOtherCost = watch('other_purchase_cost');

  const isBornOnFarm = selectedPurchaseType === 'Born on Farm';

  // Auto-calculate total acquisition cost
  const totalAcquisitionCost = (
    (Number(watchedPurchaseCost) || 0) +
    (Number(watchedTransportCost) || 0) +
    (Number(watchedMedicalCost) || 0) +
    (Number(watchedOtherCost) || 0)
  );

  const fmtInr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  // Auto calculate age preview
  const calculateAgePreview = (dobStr: string) => {
    if (!dobStr) return '0 yrs 0 mos';
    const b = new Date(dobStr);
    const now = new Date();
    let y = now.getFullYear() - b.getFullYear();
    let m = now.getMonth() - b.getMonth();
    if (m < 0) { y--; m += 12; }
    return `${y} yrs ${m} mos`;
  };

  const fetchCattle = async (page = 1) => {
    try {
      const res = await apiClient.get('/cattle', {
        params: {
          search: searchTerm,
          breed: selectedBreed,
          health_status: selectedStatus,
          purchase_type: selectedPurchaseTypeFilter !== 'all' ? selectedPurchaseTypeFilter : undefined,
          page,
          limit: pagination.itemsPerPage,
        },
      });
      if (res.data?.data) {
        setCattleList(res.data.data);
        setPagination(res.data.pagination);
      } else if (Array.isArray(res.data)) {
        setCattleList(res.data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchCattle(pagination.currentPage);
  }, [searchTerm, selectedBreed, selectedStatus, selectedPurchaseTypeFilter, selectedPriceRange, pagination.currentPage]);

  const handleCreateOrUpdateCattle = async (data: CattleFormData) => {
    try {
      if (editingCattle) {
        const res = await apiClient.put(`/cattle/${editingCattle.id}`, data);
        setCattleList(prev => prev.map(c => c.id === editingCattle.id ? res.data : c));
        setEditingCattle(null);
      } else {
        const res = await apiClient.post('/cattle', {
          ...data,
          // If skip is selected or empty image_url, image_url set to undefined to trigger default photo assignment!
          image_url: photoOption === 'skip' ? undefined : data.image_url,
        });
        setCattleList(prev => [res.data, ...prev]);
        setIsAddModalOpen(false);
      }
      reset();
    } catch (err) {
      alert('Error saving cattle record.');
    }
  };

  const handleEdit = (item: Cattle) => {
    setEditingCattle(item);
    setValue('name', item.name);
    setValue('tag_number', item.tag_number);
    setValue('breed', item.breed);
    setValue('gender', item.gender);
    setValue('date_of_birth', item.date_of_birth);
    setValue('weight_kg', item.weight_kg);
    setValue('height_cm', item.height_cm);
    setValue('color', item.color);
    setValue('horn_type', item.horn_type);
    setValue('health_status', item.health_status);
    setValue('lactation_stage', item.lactation_stage);
    setValue('owner_name', item.owner_name);
    setValue('owner_phone', item.owner_phone);
    setValue('purchase_type', item.purchase_type || 'Purchased');
    setValue('purchase_date', item.purchase_date);
    setValue('purchase_cost', item.purchase_cost);
    setValue('invoice_number', item.invoice_number);
    setValue('purchase_reference', item.purchase_reference);
    setValue('purchase_location', item.purchase_location);
    setValue('seller_name', item.seller_name);
    setValue('seller_contact', item.seller_contact);
    setValue('seller_address', item.seller_address);
    setValue('previous_owner', item.previous_owner);
    setValue('previous_owner_contact', item.previous_owner_contact);
    setValue('transportation_cost', item.transportation_cost);
    setValue('initial_medical_cost', item.initial_medical_cost);
    setValue('other_purchase_cost', item.other_purchase_cost);
    setValue('purchase_notes', item.purchase_notes);
    setValue('notes', item.notes);
    if (item.purchase_type) setShowPurchaseSection(true);
  };

  const handleDeleteCattle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cattle record?')) return;
    try {
      await apiClient.delete(`/cattle/${id}`);
      setCattleList(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Failed to delete cattle record.');
    }
  };

  return (
    <div className="space-y-5">
      {/* QR Quick-View Modal — preserved */}
      {qrViewCattle && (
        <QRViewModal
          identity={qrViewCattle.identity}
          cattleName={qrViewCattle.name}
          onClose={() => setQrViewCattle(null)}
        />
      )}

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Beef className="w-5 h-5 text-[var(--accent-green)]" />
            Cattle
          </h1>
          <p className="page-subtitle">
            Manage all your cattle in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin: Bulk QR button */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowBulkPanel(prev => !prev)}
              className={`btn-secondary text-xs ${showBulkPanel ? 'bg-[var(--accent-violet-subtle)] text-[var(--accent-violet)] border-[var(--accent-violet)]/30' : ''}`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Bulk QR
            </button>
          )}

          {['admin', 'farmer'].includes(user?.role || '') && (
            <button
              onClick={() => {
                setEditingCattle(null);
                reset();
                setIsAddModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Cattle
            </button>
          )}
        </div>
      </div>

      {/* Admin: Bulk QR Panel */}
      {showBulkPanel && user?.role === 'admin' && (
        <BulkQRPanel
          cattleCount={pagination.totalItems}
          pendingCount={cattleList.filter(c => !c.qr_status || c.qr_status === 'pending').length}
          onComplete={() => fetchCattle(pagination.currentPage)}
        />
      )}

      {/* ── Filter Bar ── */}
      <div className="card-premium p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="search-icon w-3.5 h-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Tag ID, Name, Owner..."
            className="search-input w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Breed Filter */}
          <div className="relative">
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Breeds</option>
              {INDIAN_BREEDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Health Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Health</option>
              <option value="healthy">Healthy</option>
              <option value="pregnant">Pregnant</option>
              <option value="under_treatment">Under Treatment</option>
              <option value="sick">Sick</option>
            </select>
            <Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Purchase Type Filter */}
          <div className="relative">
            <select
              value={selectedPurchaseTypeFilter}
              onChange={(e) => setSelectedPurchaseTypeFilter(e.target.value)}
              className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Acquisitions</option>
              {PURCHASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="py-2 pl-3 pr-7 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-base)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">Any Price</option>
              <option value="0-50000">&lt; ₹50K</option>
              <option value="50000-100000">₹50K – ₹1L</option>
              <option value="100000-200000">₹1L – ₹2L</option>
              <option value="200000+"> &gt; ₹2L</option>
            </select>
            <Filter className="w-3 h-3 text-[var(--text-muted)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Toggle */}

          <div className="flex items-center rounded-lg bg-[var(--bg-input)] p-1 border border-[var(--border-base)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-card)] text-[var(--accent-green)] shadow-sm' : 'text-[var(--text-muted)]'}`}
              aria-label="Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-card)] text-[var(--accent-green)] shadow-sm' : 'text-[var(--text-muted)]'}`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid View ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cattleList.map((item) => (
            <div
              key={item.id}
              className="card-premium glass-card-hover overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-40 w-full overflow-hidden bg-[var(--bg-tertiary)]">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white font-mono text-xs font-bold">
                      {item.tag_number}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={item.health_status}>
                      {item.health_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>
                        {item.breed}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="section-label block">Age</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{item.age || '1 yr'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-card)] text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                      <span>{item.weight_kg} kg</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                      <span>{item.height_cm || 135} cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                      <span>{item.color || 'Brown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-violet)]" />
                      <span>{item.horn_type || 'Short'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              {/* Card Footer Actions */}
              <div className="p-3 bg-[var(--bg-tertiary)] border-t border-[var(--border-card)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cattle/${item.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--accent-green-subtle)] hover:bg-[var(--accent-green)] hover:text-white text-[var(--accent-green-dark)] font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Profile
                  </Link>
                  {/* QR Status Chip */}
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                    item.qr_status === 'active'
                      ? 'badge-pill badge-green'
                      : 'badge-pill badge-amber'
                  }`}>
                    <QrCode className="w-3 h-3" />
                    {item.qr_status === 'active' ? 'QR Active' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-icon w-7 h-7"
                    aria-label="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteCattle(item.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--accent-rose)] hover:bg-[var(--accent-rose-subtle)] transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List / Table View ── */
        <div className="card-premium overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag ID / Name</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Weight</th>
                <th>Health</th>
                <th>Owner</th>
                <th className="text-center">QR</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cattleList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="font-mono text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>{item.tag_number}</div>
                        <div className="font-semibold text-[var(--text-primary)]">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-[var(--text-secondary)]">{item.breed}</td>
                  <td className="font-semibold">{item.age || '1 yr'}</td>
                  <td>{item.weight_kg} kg</td>
                  <td>
                    <Badge variant={item.health_status}>{item.health_status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="text-[var(--text-muted)]">{item.owner_name || 'Green Valley Farm'}</td>
                  {/* QR Status Column — preserved */}
                  <td className="text-center">
                    <QRStatusCell cattle={item} onViewQR={(identity) => setQrViewCattle({ identity, name: item.name })} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/cattle/${item.id}`} className="btn-icon w-7 h-7" aria-label="View profile">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleEdit(item)} className="btn-icon w-7 h-7" aria-label="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteCattle(item.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--accent-rose)] hover:bg-[var(--accent-rose-subtle)] transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between p-3.5 card-premium text-xs">
        <span className="text-[var(--text-muted)]">
          Page <strong className="text-[var(--text-primary)]">{pagination.currentPage}</strong> of{' '}
          <strong className="text-[var(--text-primary)]">{pagination.totalPages}</strong>{' '}
          <span className="hidden sm:inline">({pagination.totalItems} total cattle)</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled={pagination.currentPage <= 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            className="btn-icon disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            className="btn-icon disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Register / Edit Cattle Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingCattle}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCattle(null);
        }}
        title={editingCattle ? `Edit Cattle: ${editingCattle.name}` : 'Register New Cattle'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdateCattle)} className="space-y-4">
          {/* Top Section: Photo Selector with Skip Option */}
          {!editingCattle && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Cattle Photo Option
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoOption('upload')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      photoOption === 'upload' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    Custom URL
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoOption('skip')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      photoOption === 'skip' ? 'bg-amber-500 text-white shadow-glow' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Skip (Auto Assign Cow Photo)
                  </button>
                </div>
              </div>

              {photoOption === 'upload' ? (
                <div>
                  <input
                    {...register('image_url')}
                    type="text"
                    placeholder="Paste image URL (https://...)"
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-amber-500 font-semibold italic">
                  ✨ Photo upload skipped! System will automatically assign a high-res professional cow image.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Nickname / Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="Ganga"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-0.5">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Cattle Breed (Indian & Global)</label>
              <select
                {...register('breed')}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-emerald-500"
              >
                <optgroup label="Native Indian Breeds">
                  <option value="Gir">Gir</option>
                  <option value="Kangayam">Kangayam</option>
                  <option value="Sahiwal">Sahiwal</option>
                  <option value="Ongole">Ongole</option>
                  <option value="Hallikar">Hallikar</option>
                  <option value="Red Sindhi">Red Sindhi</option>
                  <option value="Tharparkar">Tharparkar</option>
                  <option value="Hariana">Hariana</option>
                </optgroup>
                <optgroup label="Global Dairy & Beef Breeds">
                  <option value="Holstein Friesian">Holstein Friesian</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Brown Swiss">Brown Swiss</option>
                  <option value="Angus">Angus</option>
                  <option value="Guernsey">Guernsey</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Gender</label>
              <select
                {...register('gender')}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 capitalize"
              >
                <option value="female">Female (Dairy / Calving)</option>
                <option value="male">Male (Bull / Draught)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold">Date of Birth</label>
                <span className="text-[10px] font-bold text-emerald-500">
                  Auto Age: {calculateAgePreview(selectedDOB)}
                </span>
              </div>
              <input
                {...register('date_of_birth')}
                type="date"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Weight (kg)</label>
              <input
                {...register('weight_kg')}
                type="number"
                placeholder="540"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Height (cm)</label>
              <input
                {...register('height_cm')}
                type="number"
                placeholder="138"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Coat Color</label>
              <input
                {...register('color')}
                type="text"
                placeholder="Reddish Brown with Speckles"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Horn Type</label>
              <input
                {...register('horn_type')}
                type="text"
                placeholder="Curved Backward, Polled, Short"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Current Health Status</label>
              <select
                {...register('health_status')}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <option value="healthy">Healthy</option>
                <option value="pregnant">Pregnant</option>
                <option value="under_treatment">Under Treatment</option>
                <option value="sick">Sick</option>
                <option value="quarantined">Quarantined</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Lactation Stage</label>
              <select
                {...register('lactation_stage')}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <option value="early">Early Lactation</option>
                <option value="mid">Mid Lactation</option>
                <option value="late">Late Lactation</option>
                <option value="dry">Dry Period</option>
                <option value="heifer">Heifer</option>
                <option value="bull">Bull</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Owner Name</label>
              <input
                {...register('owner_name')}
                type="text"
                placeholder="Green Valley Farm Co."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Owner Phone</label>
              <input
                {...register('owner_phone')}
                type="text"
                placeholder="+91 98765 43210"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* ── Purchase Information Section ── */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPurchaseSection(p => !p)}
              className="w-full flex items-center justify-between p-4 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                Purchase Information
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">Optional</span>
              </span>
              {showPurchaseSection
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showPurchaseSection && (
              <div className="p-4 space-y-4">

                {/* Purchase Type */}
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3 text-emerald-500" />
                    Purchase Type
                  </label>
                  <select
                    {...register('purchase_type')}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    {PURCHASE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {isBornOnFarm && (
                    <p className="text-[11px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                      ✨ Born on Farm selected — purchase price &amp; seller fields are optional.
                    </p>
                  )}
                </div>

                {/* Purchase Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-500" /> Purchase Date
                    </label>
                    <input
                      {...register('purchase_date')}
                      type="date"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" /> Purchase Location
                    </label>
                    <input
                      {...register('purchase_location')}
                      type="text"
                      placeholder="Chennai Cattle Market"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Invoice & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-sky-500" /> Invoice Number
                    </label>
                    <input
                      {...register('invoice_number')}
                      type="text"
                      placeholder="INV-2026-001"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-sky-500" /> Purchase Reference
                    </label>
                    <input
                      {...register('purchase_reference')}
                      type="text"
                      placeholder="REF-2026-001"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Costs — hidden for Born on Farm */}
                {!isBornOnFarm && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Acquisition Cost Breakdown</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-emerald-500" /> Purchase Price (₹)
                          </label>
                          <input
                            {...register('purchase_cost')}
                            type="number" min="0" step="100" placeholder="85000"
                            className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                          {errors.purchase_cost && <p className="text-[11px] text-rose-400 mt-0.5">{errors.purchase_cost.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-amber-500" /> Transportation Cost (₹)
                          </label>
                          <input
                            {...register('transportation_cost')}
                            type="number" min="0" step="100" placeholder="2500"
                            className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                          {errors.transportation_cost && <p className="text-[11px] text-rose-400 mt-0.5">{errors.transportation_cost.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-purple-500" /> Initial Medical Cost (₹)
                          </label>
                          <input
                            {...register('initial_medical_cost')}
                            type="number" min="0" step="100" placeholder="1500"
                            className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                          {errors.initial_medical_cost && <p className="text-[11px] text-rose-400 mt-0.5">{errors.initial_medical_cost.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-rose-500" /> Other Cost (₹)
                          </label>
                          <input
                            {...register('other_purchase_cost')}
                            type="number" min="0" step="100" placeholder="500"
                            className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                          {errors.other_purchase_cost && <p className="text-[11px] text-rose-400 mt-0.5">{errors.other_purchase_cost.message}</p>}
                        </div>
                      </div>

                      {/* Total Acquisition Cost */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total Acquisition Cost</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {fmtInr(totalAcquisitionCost)}
                        </span>
                      </div>
                    </div>

                    {/* Seller Information */}
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3" /> Seller Information
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Seller Name</label>
                          <input
                            {...register('seller_name')}
                            type="text" placeholder="Kumar Farms"
                            className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-sky-500" /> Seller Contact
                          </label>
                          <input
                            {...register('seller_contact')}
                            type="text" placeholder="+91 98765 43210"
                            className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold mb-1">Seller Address</label>
                          <input
                            {...register('seller_address')}
                            type="text" placeholder="123 Farm Road, Coimbatore, TN"
                            className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Previous Owner</label>
                          <input
                            {...register('previous_owner')}
                            type="text" placeholder="Rajan Cattle Co."
                            className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Previous Owner Contact</label>
                          <input
                            {...register('previous_owner_contact')}
                            type="text" placeholder="+91 98765 43211"
                            className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Purchase Notes */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Purchase Notes</label>
                  <textarea
                    {...register('purchase_notes')}
                    rows={2}
                    placeholder="Any additional notes about the purchase..."
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  />
                </div>

              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Remarks & Pedigree Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Purebred A2 milk line..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingCattle(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-glow"
            >
              {editingCattle ? 'Update Cattle Record' : 'Register Cattle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
