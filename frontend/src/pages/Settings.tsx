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
  Sparkles,
  Sliders,
  Database,
  Download,
  Trash2,
  RefreshCw,
  Cpu,
  Bot,
  Volume2,
  SlidersHorizontal,
  Wifi,
  QrCode,
  DollarSign,
  Thermometer,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  AlertTriangle
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
  
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'operations' | 'devices' | 'notifications' | 'backup' | 'rbac' | 'audit'>('profile');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [language, setLanguage] = useState<string>('en');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Settings saved successfully!');

  // 1. Farm Profile State
  const [farmConfig, setFarmConfig] = useState(() => {
    const saved = localStorage.getItem('farmease_farm_config');
    return saved ? JSON.parse(saved) : {
      farmName: 'FarmEase Green Valley Organic Farm',
      registrationNumber: 'IN-KA-88902-CATTLE',
      ownerName: 'Dr. Sarah Jenkins',
      phone: '+91 98765 43210',
      email: 'admin@farmease.com',
      location: 'Coimbatore, Tamil Nadu, India',
      totalAcreage: '120 Acres',
      totalCapacity: '250 Head of Cattle',
    };
  });

  // 2. AI Intelligence Settings State
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('farmease_ai_config');
    return saved ? JSON.parse(saved) : {
      sensitivity: 'balanced', // high, balanced, strict
      voiceAudioEnabled: true,
      voiceLanguage: 'en-US',
      dailyBriefingBanner: true,
      defaultTargetYield: 18,
      provider: 'built-in', // built-in or gemini
      geminiApiKey: '',
      autoAnomalyDetection: true,
    };
  });

  // 3. Operational Thresholds State
  const [operationsConfig, setOperationsConfig] = useState(() => {
    const saved = localStorage.getItem('farmease_ops_config');
    return saved ? JSON.parse(saved) : {
      gestationDays: 283,
      feverThresholdC: 39.5,
      milkPricePerLiter: 40.0,
      dryPeriodDays: 60,
      calfTagPrefix: 'FE-CALF-',
      temperatureUnit: 'C', // C or F
    };
  });

  // 4. Device & Hardware Integration State
  const [deviceConfig, setDeviceConfig] = useState(() => {
    const saved = localStorage.getItem('farmease_device_config');
    return saved ? JSON.parse(saved) : {
      soundOnQrScan: true,
      continuousScanMode: false,
      autoRedirectProfile: true,
      bluetoothMilkerSync: true,
      connectedPhoneAdb: true,
    };
  });

  // 5. Notification & WhatsApp Alert State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('farmease_notif_config');
    return saved ? JSON.parse(saved) : {
      milkLoggingReminders: true,
      vaccinationDueAlerts: true,
      lowFeedStockAlerts: true,
      emergencyVetAlerts: true,
      dailyFinancialSummaries: false,
      whatsappEmergencyEnabled: true,
      whatsappNumber: '+91 98765 43210',
      calvingAlertHoursBefore: 24,
    };
  });

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

  const handleSave = (msg = 'Settings saved successfully!') => {
    localStorage.setItem('farmease_farm_config', JSON.stringify(farmConfig));
    localStorage.setItem('farmease_ai_config', JSON.stringify(aiConfig));
    localStorage.setItem('farmease_ops_config', JSON.stringify(operationsConfig));
    localStorage.setItem('farmease_device_config', JSON.stringify(deviceConfig));
    localStorage.setItem('farmease_notif_config', JSON.stringify(notifications));

    setSaveMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // 1-Click JSON Backup Export
  const handleExportFullBackup = async () => {
    try {
      const [cattleRes, milkRes] = await Promise.all([
        apiClient.get('/cattle'),
        apiClient.get('/milk'),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: 'FarmEase v2.5 Enterprise',
        farm: farmConfig,
        settings: {
          ai: aiConfig,
          operations: operationsConfig,
          notifications,
        },
        cattle: cattleRes.data || [],
        milkLogs: milkRes.data || [],
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `farmease_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      handleSave('Full Farm Database Backup exported successfully!');
    } catch (err) {
      alert('Failed to generate full backup.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-500" />
            System & Farm Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure AI intelligence, herd operations, connected devices, alerts, and system backups.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" /> Save All Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {([
          { key: 'profile',       label: 'Farm Profile',     icon: Building2 },
          { key: 'ai',            label: 'AI & Copilot',     icon: Sparkles },
          { key: 'operations',    label: 'Herd Parameters',  icon: SlidersHorizontal },
          { key: 'devices',       label: 'Devices & USB',    icon: Smartphone },
          { key: 'notifications', label: 'Alerts & WhatsApp',icon: Bell },
          { key: 'backup',        label: 'Backup & Export',  icon: Database },
          { key: 'rbac',          label: 'Roles & Access',   icon: ShieldCheck },
          { key: 'audit',         label: 'Audit Logs',       icon: History },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === key
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Farm Profile & Identity ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" /> Farm Identity Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Farm Name</label>
                <input
                  type="text"
                  value={farmConfig.farmName}
                  onChange={(e) => setFarmConfig({ ...farmConfig, farmName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Government Registration Number</label>
                <input
                  type="text"
                  value={farmConfig.registrationNumber}
                  onChange={(e) => setFarmConfig({ ...farmConfig, registrationNumber: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Primary Farm Manager</label>
                <input
                  type="text"
                  value={farmConfig.ownerName}
                  onChange={(e) => setFarmConfig({ ...farmConfig, ownerName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Phone</label>
                <input
                  type="text"
                  value={farmConfig.phone}
                  onChange={(e) => setFarmConfig({ ...farmConfig, phone: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Farm Location / Address</label>
                <input
                  type="text"
                  value={farmConfig.location}
                  onChange={(e) => setFarmConfig({ ...farmConfig, location: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Total Acreage</label>
                <input
                  type="text"
                  value={farmConfig.totalAcreage}
                  onChange={(e) => setFarmConfig({ ...farmConfig, totalAcreage: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Localization & Appearance Theme */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-500" /> Language & Interface Appearance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">System Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
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
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Appearance Theme</label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-between text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-750 transition"
                >
                  <span>Current Theme: <strong>{theme.toUpperCase()} MODE</strong></span>
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: AI Intelligence & Copilot Configuration ── */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                AI Veterinary & Agritech Diagnostics Sensitivity
              </h3>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
                Active Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust how aggressively the AI flags health anomalies, temperature deviations, and disease risk factors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { key: 'high', label: 'Sensitive (Early Warning)', desc: 'Flags subtle deviations (>39.2°C) and early warnings for high-value dairy cows.' },
                { key: 'balanced', label: 'Balanced (Standard)', desc: 'Standard veterinary threshold (39.5°C fever threshold, routine lactation monitoring).' },
                { key: 'strict', label: 'Conservative (High Threshold)', desc: 'Only triggers high-risk alerts for confirmed acute symptoms and severe vitals.' }
              ].map(opt => (
                <div
                  key={opt.key}
                  onClick={() => setAiConfig({ ...aiConfig, sensitivity: opt.key })}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                    aiConfig.sensitivity === opt.key
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    {opt.label}
                    {aiConfig.sensitivity === opt.key && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] mt-1 opacity-80 leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Voice & Assistant Features */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-500" />
              AI Copilot Voice & Daily Briefing Controls
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Voice Readout Audio (Text-to-Speech)</h4>
                  <p className="text-[11px] text-slate-400">Speak AI responses aloud when answering veterinary questions in Copilot.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.voiceAudioEnabled}
                  onChange={e => setAiConfig({ ...aiConfig, voiceAudioEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Automated Morning AI Farm Briefing</h4>
                  <p className="text-[11px] text-slate-400">Display automatic summary of daily tasks, sick animals, and calving alerts on Dashboard.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.dailyBriefingBanner}
                  onChange={e => setAiConfig({ ...aiConfig, dailyBriefingBanner: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Automatic Vitals Anomaly Detection</h4>
                  <p className="text-[11px] text-slate-400">Continuously analyze logged temperature and heart rate logs for sudden spikes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.autoAnomalyDetection}
                  onChange={e => setAiConfig({ ...aiConfig, autoAnomalyDetection: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Google Gemini 1.5 Flash Cloud Integration */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-emerald-900/20 border border-blue-500/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Google Gemini 1.5 Flash Model
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                      Multimodal Vision + Text
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Powers conversational farm advice and visual photo disease diagnostics.
                  </p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm w-fit"
              >
                Get Free Gemini API Key &rarr;
              </a>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Gemini API Key (Optional — Free from Google AI Studio)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={aiConfig.geminiApiKey}
                  onChange={e => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="flex-1 p-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleSave('Gemini API key updated!')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Save Key
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 If left blank, FarmEase runs seamlessly using the built-in offline Agritech Clinical Knowledge Engine with 0 external latency!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Operational Thresholds & Parameters ── */}
      {activeTab === 'operations' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
            Dairy & Biological Herd Operational Parameters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize veterinary constants used throughout gestation predictions, revenue metrics, and fever alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Average Gestation Period (Days)
              </label>
              <input
                type="number"
                min={270}
                max={300}
                value={operationsConfig.gestationDays}
                onChange={e => setOperationsConfig({ ...operationsConfig, gestationDays: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default 283 days for standard bovine breeds</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Fever Alarm Trigger (°C)
              </label>
              <input
                type="number"
                step={0.1}
                min={38.5}
                max={41.0}
                value={operationsConfig.feverThresholdC}
                onChange={e => setOperationsConfig({ ...operationsConfig, feverThresholdC: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Normal bovine temperature is 38.5°C – 39.2°C</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Standard Milk Price per Liter (₹ / $)
              </label>
              <input
                type="number"
                step={0.5}
                min={1}
                value={operationsConfig.milkPricePerLiter}
                onChange={e => setOperationsConfig({ ...operationsConfig, milkPricePerLiter: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Used to calculate real-time milk revenue</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Dry Period Notice (Days Before Calving)
              </label>
              <input
                type="number"
                min={30}
                max={90}
                value={operationsConfig.dryPeriodDays}
                onChange={e => setOperationsConfig({ ...operationsConfig, dryPeriodDays: Number(e.target.value) })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 60-day dry period before calving</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Calf Registration Tag Prefix
              </label>
              <input
                type="text"
                value={operationsConfig.calfTagPrefix}
                onChange={e => setOperationsConfig({ ...operationsConfig, calfTagPrefix: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Prefix applied when registering new calves</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Connected Devices & Hardware ── */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          {/* Connected Phone Status Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    Samsung Galaxy F17 (`RZGL51HH4XM`)
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                      USB Connected
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">Android Debug Bridge (ADB) Hardware Link</p>
                </div>
              </div>

              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" title="Device Online" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">Connection Protocol</span>
                <span className="font-bold text-white font-mono">USB / ADB v37.0.1</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">USB Debugging</span>
                <span className="font-bold text-emerald-400">Authorized & Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">Camera Integration</span>
                <span className="font-bold text-white">Supported</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[10px] block">Live Telemetry</span>
                <span className="font-bold text-emerald-400">Connected</span>
              </div>
            </div>
          </div>

          {/* QR & Scanner Behavior Settings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-500" />
              Barn QR Scanner & Hardware Preferences
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Beep Sound on Successful QR Scan</h4>
                  <p className="text-[11px] text-slate-400">Play an audible audio confirmation chime in the barn when a tag is scanned.</p>
                </div>
                <input
                  type="checkbox"
                  checked={deviceConfig.soundOnQrScan}
                  onChange={e => setDeviceConfig({ ...deviceConfig, soundOnQrScan: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Auto-Navigate to Profile on Scan</h4>
                  <p className="text-[11px] text-slate-400">Instantly open digital identity passport upon camera reticle lock.</p>
                </div>
                <input
                  type="checkbox"
                  checked={deviceConfig.autoRedirectProfile}
                  onChange={e => setDeviceConfig({ ...deviceConfig, autoRedirectProfile: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Bluetooth Milk Analyzer / Scale Auto-Sync</h4>
                  <p className="text-[11px] text-slate-400">Auto-fill morning/evening yields from Bluetooth digital parlor milk meters.</p>
                </div>
                <input
                  type="checkbox"
                  checked={deviceConfig.bluetoothMilkerSync}
                  onChange={e => setDeviceConfig({ ...deviceConfig, bluetoothMilkerSync: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 5: Notification & WhatsApp Emergency Dispatch ── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              WhatsApp Emergency Veterinary & Calving Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive automated WhatsApp messages directly on your phone when an emergency disease condition or calving is detected.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Manager WhatsApp Emergency Phone Number
                </label>
                <input
                  type="text"
                  value={notifications.whatsappNumber}
                  onChange={e => setNotifications({ ...notifications, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Calving Dispatch Notice
                </label>
                <select
                  value={notifications.calvingAlertHoursBefore}
                  onChange={e => setNotifications({ ...notifications, calvingAlertHoursBefore: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  <option value={12}>12 Hours before expected delivery</option>
                  <option value={24}>24 Hours before expected delivery</option>
                  <option value={48}>48 Hours before expected delivery</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-emerald-700 dark:text-emerald-300">Enable Automated WhatsApp Emergency Dispatch</h4>
                <p className="text-[11px] text-emerald-600/80">Sends formatted veterinary alerts with cow tag number and first-aid instructions.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.whatsappEmergencyEnabled}
                onChange={e => setNotifications({ ...notifications, whatsappEmergencyEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Standard In-App & Email Toggles */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Standard Push Notification Triggers
            </h3>

            {[
              { key: 'milkLoggingReminders', label: 'Morning & Evening Milk Yield Reminders', desc: 'Alert at 06:00 AM and 05:00 PM for shift collection logging.' },
              { key: 'vaccinationDueAlerts', label: 'Vaccination & Deworming Due Alerts', desc: 'Alert 3 days prior to scheduled booster protocols.' },
              { key: 'lowFeedStockAlerts', label: 'Low Feed Stock Threshold Alerts', desc: 'Alert when fodder inventory drops below 7 days consumption.' },
              { key: 'emergencyVetAlerts', label: 'Emergency Veterinary Health Alerts', desc: 'Push alert for fever >39.5°C or active emergency cases.' },
            ].map(item => (
              <div key={item.key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.label}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 6: Backup, Export & System Maintenance ── */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Full Farm Database Backup (JSON Export)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Download a comprehensive cryptographic snapshot of your cattle registry, milk harvests, breeding ledger, and settings.
                </p>
              </div>

              <button
                onClick={handleExportFullBackup}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Backup File (.json)
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-500" />
              Spreadsheet & Accounting CSV Exports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export tabular datasets compatible with Excel, Google Sheets, or government dairy audit formats.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Herd Directory (.csv)</h4>
                  <p className="text-[11px] text-slate-400">Complete cattle records, tag IDs, and lineage</p>
                </div>
                <button
                  onClick={async () => {
                    const res = await apiClient.get('/cattle');
                    const items = res.data || [];
                    const csv = "Tag,Name,Breed,Status,DOB,Weight\n" + items.map((c: any) => `"${c.tag_number || c.tag_id}","${c.name}","${c.breed}","${c.health_status}","${c.date_of_birth}","${c.weight_kg}"`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `herd_directory_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Download CSV
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Milk Production Ledger (.csv)</h4>
                  <p className="text-[11px] text-slate-400">Morning & evening shift collections and liters</p>
                </div>
                <button
                  onClick={async () => {
                    const res = await apiClient.get('/milk');
                    const items = res.data || [];
                    const csv = "Date,Tag,Cattle,Session,Liters,Fat,SNF\n" + items.map((m: any) => `"${m.date || m.log_date}","${m.cattle_tag || ''}","${m.cattle_name || ''}","${m.session}","${m.quantity_liters || m.quantity || ''}","${m.fat_percentage || ''}","${m.snf_percentage || ''}"`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `milk_production_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 7: RBAC User Roles Matrix ── */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Role-Based Access Control (RBAC) Permissions Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Module Action</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Farmer</th>
                  <th className="p-3 text-center">Veterinarian</th>
                  <th className="p-3 text-center">Worker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { action: 'View Dashboard & KPIs', admin: true, farmer: true, vet: true, worker: true },
                  { action: 'Use FarmEase AI Copilot', admin: true, farmer: true, vet: true, worker: true },
                  { action: 'Register & Edit Cattle Profiles', admin: true, farmer: true, vet: true, worker: false },
                  { action: 'Delete Cattle Record', admin: true, farmer: false, vet: false, worker: false },
                  { action: 'Log Health Treatments & Prescriptions', admin: true, farmer: true, vet: true, worker: false },
                  { action: 'Log Daily Milk & Feed Yields', admin: true, farmer: true, vet: false, worker: true },
                  { action: 'Financial Ledger & CSV Export', admin: true, farmer: true, vet: false, worker: false },
                  { action: 'User Roles & System Settings', admin: true, farmer: false, vet: false, worker: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
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

      {/* ── Tab 8: Security & Audit Logs ── */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Module</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.length > 0 ? (
                auditLogs.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{a.user_name}</td>
                    <td className="p-3.5">
                      <Badge variant={a.role === 'admin' ? 'healthy' : 'medium'}>{a.role}</Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-500">{a.action}</td>
                    <td className="p-3.5 font-mono text-slate-400">{a.module}</td>
                    <td className="p-3.5 font-mono">{a.timestamp}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-right">{a.ip_address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
