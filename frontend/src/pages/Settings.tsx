import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Bell, 
  History, 
  Save, 
  CheckCircle2, 
  Lock, 
  Smartphone,
  Sparkles
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  user_name: string;
  user_email: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  ip_address: string;
}

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'rbac' | 'audit'>('profile');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [language, setLanguage] = useState<string>('en');

  // Farm Profile State
  const [farmConfig, setFarmConfig] = useState({
    farmName: 'FarmEase Green Valley Organic Farm',
    registrationNumber: 'IN-KA-88902-CATTLE',
    ownerName: 'Dr. Sarah Jenkins',
    phone: '+91 98765 43210',
    email: 'admin@farmease.com',
    location: 'Coimbatore, Tamil Nadu, India',
    totalAcreage: '120 Acres',
    totalCapacity: '250 Head of Cattle',
  });

  // Push Notification Preferences State
  const [notifications, setNotifications] = useState({
    milkLoggingReminders: true,
    vaccinationDueAlerts: true,
    lowFeedStockAlerts: true,
    emergencyVetAlerts: true,
    dailyFinancialSummaries: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/users/audit-logs');
      setAuditLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleSaveFarmProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[var(--accent-green)]" />
            Settings
          </h1>
          <p className="page-subtitle">
            Farm profile, notifications, permissions, and audit logs.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[var(--accent-green-subtle)] border border-[var(--accent-green)]/30 text-[var(--accent-green-dark)] font-bold text-xs flex items-center gap-2 animate-success">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
          Farm Profile & Notification preferences saved successfully!
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tab-underline-bar overflow-x-auto">
        {([
          { key: 'profile',       label: 'Farm Profile',     icon: Building2 },
          { key: 'notifications', label: 'Notifications',    icon: Bell },
          { key: 'rbac',          label: 'Roles & Access',   icon: ShieldCheck },
          { key: 'audit',         label: 'Audit Logs',       icon: History },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`tab-underline-item flex items-center gap-1.5 ${activeTab === key ? 'active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Farm Profile ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveFarmProfile} className="space-y-5">
          <div className="card-premium p-6 space-y-4">
            <h3 className="section-title flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent-green)]" /> Farm Identity Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmConfig.farmName}
                  onChange={(e) => setFarmConfig({ ...farmConfig, farmName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Government Reg. Number</label>
                <input
                  type="text"
                  value={farmConfig.registrationNumber}
                  onChange={(e) => setFarmConfig({ ...farmConfig, registrationNumber: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Primary Farm Manager</label>
                <input
                  type="text"
                  value={farmConfig.ownerName}
                  onChange={(e) => setFarmConfig({ ...farmConfig, ownerName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={farmConfig.phone}
                  onChange={(e) => setFarmConfig({ ...farmConfig, phone: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Farm Location / Address</label>
                <input
                  type="text"
                  value={farmConfig.location}
                  onChange={(e) => setFarmConfig({ ...farmConfig, location: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Total Acreage</label>
                <input
                  type="text"
                  value={farmConfig.totalAcreage}
                  onChange={(e) => setFarmConfig({ ...farmConfig, totalAcreage: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Localization & Theme Customization */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-500" /> Language & System Theme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">System Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-teal-400"
                >
                  <option value="en">English (US / Global)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="es">Spanish (Español)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Appearance Theme</label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold flex items-center justify-between"
                >
                  <span>Current Theme: <strong>{theme.toUpperCase()} MODE</strong></span>
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" /> Reminder Center & Push Notification Toggles
          </h3>

          <div className="space-y-3">
            {[
              { key: 'milkLoggingReminders', label: 'Morning & Evening Milk Production Reminders', desc: 'Alert workers at 06:00 AM and 05:00 PM for yield logging.' },
              { key: 'vaccinationDueAlerts', label: 'Vaccination & Deworming Due Alerts', desc: 'Push alert 3 days prior to scheduled booster dates.' },
              { key: 'lowFeedStockAlerts', label: 'Low Feed Stock Threshold Notifications', desc: 'Alert when fodder inventory drops below reorder point.' },
              { key: 'emergencyVetAlerts', label: 'Emergency Veterinary Case Alerts', desc: 'Instant push alerts for sick or quarantined cattle cases.' },
            ].map((item) => (
              <div key={item.key} className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.label}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: RBAC User Roles Matrix */}
      {activeTab === 'rbac' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Role-Based Access Control (RBAC) Permissions Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Module Action</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Farmer</th>
                  <th className="p-3 text-center">Veterinarian</th>
                  <th className="p-3 text-center">Worker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {[
                  { action: 'View Dashboard & KPIs', admin: true, farmer: true, vet: true, worker: true },
                  { action: 'Register & Edit Cattle Profiles', admin: true, farmer: true, vet: true, worker: false },
                  { action: 'Delete Cattle Record', admin: true, farmer: false, vet: false, worker: false },
                  { action: 'Log Health Treatments & Prescriptions', admin: true, farmer: true, vet: true, worker: false },
                  { action: 'Log Daily Milk & Feed Yields', admin: true, farmer: true, vet: false, worker: true },
                  { action: 'Financial Ledger & CSV Export', admin: true, farmer: true, vet: false, worker: false },
                  { action: 'User Roles & System Settings', admin: true, farmer: false, vet: false, worker: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.action}</td>
                    <td className="p-3 text-center font-bold text-emerald-500">{row.admin ? '✓ Allowed' : '—'}</td>
                    <td className="p-3 text-center font-bold text-emerald-500">{row.farmer ? '✓ Allowed' : '—'}</td>
                    <td className="p-3 text-center font-bold text-indigo-400">{row.vet ? '✓ Allowed' : '—'}</td>
                    <td className="p-3 text-center font-bold text-slate-400">{row.worker ? '✓ Allowed' : '— Restricted'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Operational Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Module</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{a.user_name}</td>
                  <td className="p-3.5">
                    <Badge variant={a.role === 'admin' ? 'healthy' : 'medium'}>{a.role}</Badge>
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-400">{a.action}</td>
                  <td className="p-3.5 font-mono text-slate-400">{a.module}</td>
                  <td className="p-3.5 font-mono">{a.timestamp}</td>
                  <td className="p-3.5 font-mono text-slate-500 text-right">{a.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
