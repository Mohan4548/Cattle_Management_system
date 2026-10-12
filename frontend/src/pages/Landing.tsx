import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beef,
  Milk,
  Stethoscope,
  Heart,
  DollarSign,
  ArrowRight,
  Leaf,
  QrCode,
  TrendingUp,
  Shield,
  Calendar,
  FileText,
  Activity,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Scan,
  Radio,
  Sliders,
  Award,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';

/* ── Animation Variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* ── Live Ticker Feed Items ── */
const TICKER_ITEMS = [
  '🐄 Gir Purebred Registry (Avg 18.5L/day)',
  '🐃 Murrah High-FAT Buffalo Records (8.2% FAT)',
  '🐂 Kangayam Pure Lineage Pedigrees',
  '🌾 Sahiwal Dairy Benchmarks',
  '🏷️ ISO-Compliant QR Ear Tags',
  '🥛 Cooperative Dairy Rate Calculator (FAT & SNF)',
  '🩺 283-Day Bovine Gestation Radar',
  '📊 Automated Feed-to-Milk Margin Tracker',
];



/* ── Features List ── */
const FEATURES = [
  {
    icon: Beef,
    title: 'Herd Directory & Breeds',
    desc: 'Auto Tag IDs, QR ear tags, and profiles for Gir, Kangayam, Sahiwal, Ongole and native breeds.',
    badge: 'Breed Intelligence',
    color: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    icon: Milk,
    title: 'Milk Yield & Quality Metrics',
    desc: 'Track morning & evening yields, FAT% / SNF% quality scores, milk rate pricing, and performance logs.',
    badge: 'Daily Production',
    color: 'from-sky-500/10 to-blue-500/10',
  },
  {
    icon: Stethoscope,
    title: 'Veterinary Health & Vitals',
    desc: 'Vaccination schedules, deworming cycles, doctor visit logs, and vitals trend monitoring.',
    badge: 'Clinical Tracking',
    color: 'from-amber-500/10 to-orange-500/10',
  },
  {
    icon: Heart,
    title: '283-Day Calving Predictor',
    desc: 'Insemination tracking, 283-day gestation countdown, calf registration, and pedigree history.',
    badge: 'Breeding Science',
    color: 'from-rose-500/10 to-pink-500/10',
  },
  {
    icon: DollarSign,
    title: 'Purchase & P&L Financials',
    desc: 'Track purchases, feed costs, medicine expenses, sales ledger, and printable P&L statements.',
    badge: 'Farm Economics',
    color: 'from-emerald-500/10 to-green-500/10',
  },
  {
    icon: QrCode,
    title: 'QR Digital Ear Tag System',
    desc: 'Unique permanent Digital IDs (CAT-2026-XXXXXX) with scannable QR ear tags for quick field checks.',
    badge: 'Field Ready',
    color: 'from-purple-500/10 to-indigo-500/10',
  },
];

/* ── How It Works Steps ── */
const STEPS = [
  {
    step: '01',
    title: 'Register Your Cattle',
    desc: 'Create digital cattle profiles with ear tag IDs, breed classifications, age, and initial medical history.',
    icon: Beef,
    highlight: 'One-click ear tag assignment',
  },
  {
    step: '02',
    title: 'Track Daily Operations',
    desc: 'Log milk yield, vaccination dates, health checks, feed expenses, and breeding cycles in real time.',
    icon: Activity,
    highlight: 'Instant offline & mobile logging',
  },
  {
    step: '03',
    title: 'Monitor & Manage',
    desc: 'View clear herd analytics, financial ROI, automated health reminders, and digital audit documents.',
    icon: TrendingUp,
    highlight: 'Real-time profit & health insights',
  },
];

/* ── Practical Benefits ── */
const BENEFITS = [
  {
    icon: FileText,
    title: 'Centralized Digital Records',
    desc: 'Replace paper logs with secure digital records accessible anytime from mobile or desktop.',
  },
  {
    icon: Activity,
    title: 'Preventive Health Tracking',
    desc: 'Automated reminders for vaccinations, deworming, and routine veterinary inspections.',
  },
  {
    icon: QrCode,
    title: 'Instant QR Ear Tag Scans',
    desc: 'Scan cattle ear tags in seconds to view health logs, milk history, and ownership records.',
  },
  {
    icon: Shield,
    title: 'Ownership & Purchase Docs',
    desc: 'Store digital bills, seller details, medical certificates, and ownership transfer history.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Yield & ROI',
    desc: 'Analyze milk production trends, feed costs, and revenue per cattle to maximize profitability.',
  },
  {
    icon: Calendar,
    title: 'Breeding & Calving Alerts',
    desc: 'Track artificial insemination dates and 283-day calving countdowns to prepare timely care.',
  },
];

/* ── Interactive Demo Tabs Data ── */
const DEMO_TABS = [
  {
    id: 'milk',
    label: 'Milk Yield Intelligence',
    icon: Milk,
    content: {
      tag: 'DAILY HARVEST',
      title: 'Automated Yield Recording & Fat Scoring',
      metric: '32.4 L',
      subtext: 'Today Total Yield (Gir + Kangayam batches)',
      chartData: [
        { label: 'Mon', val: 28 },
        { label: 'Tue', val: 30 },
        { label: 'Wed', val: 31 },
        { label: 'Thu', val: 29 },
        { label: 'Fri', val: 34 },
        { label: 'Sat', val: 32 },
        { label: 'Today', val: 35 },
      ],
      stat1: { label: 'FAT Content', val: '4.8%' },
      stat2: { label: 'SNF Ratio', val: '8.9%' },
      stat3: { label: 'Market Rate', val: '₹48.00 / L' },
      detail: 'Morning and evening sessions synced with automated dairy cooperative payout projections.',
    },
  },
  {
    id: 'qr',
    label: 'QR Ear Tag Identity',
    icon: QrCode,
    content: {
      tag: 'INSTANT FIELD VERIFICATION',
      title: 'Tamper-Proof Scannable Cattle Digital Passport',
      metric: 'CAT-2026-0891',
      subtext: 'Purebred Gir Cow • Age 3.8 Yrs • Tag Grade A',
      chartData: [
        { label: 'Immunity', val: 98 },
        { label: 'Rumination', val: 92 },
        { label: 'Activity', val: 88 },
        { label: 'Hydration', val: 95 },
      ],
      stat1: { label: 'Vaccination', val: 'Up to Date' },
      stat2: { label: 'Lactation', val: 'Stage 2 (Prime)' },
      stat3: { label: 'Last Scan', val: 'Today, 09:30 AM' },
      detail: 'Instant QR scanning directly from mobile camera without special scanner hardware.',
    },
  },
  {
    id: 'health',
    label: 'Veterinary Radar',
    icon: Stethoscope,
    content: {
      tag: 'CLINICAL MONITORING',
      title: 'Proactive Health Alerts & Gestation Tracking',
      metric: '99.4%',
      subtext: 'Herd Wellness Index across 48 livestock',
      chartData: [
        { label: 'Vital A', val: 90 },
        { label: 'Vital B', val: 85 },
        { label: 'Vital C', val: 96 },
        { label: 'Vital D', val: 92 },
      ],
      stat1: { label: 'FMD Vaccine', val: 'Due in 6 Days' },
      stat2: { label: 'Deworming', val: 'Completed' },
      stat3: { label: 'Calving Alert', val: '14 Days to Due' },
      detail: 'Auto-schedules Dr. visits and alerts farm staff before health issues affect yield.',
    },
  },
  {
    id: 'financials',
    label: 'Farm ROI & P&L',
    icon: DollarSign,
    content: {
      tag: 'LIVE ECONOMICS',
      title: 'Feed-to-Milk Ratio & Net Profit Margins',
      metric: '+28.4%',
      subtext: 'Quarterly Operating Margin Improvement',
      chartData: [
        { label: 'Jan', val: 110 },
        { label: 'Feb', val: 124 },
        { label: 'Mar', val: 132 },
        { label: 'Apr', val: 142 },
      ],
      stat1: { label: 'Monthly Rev', val: '₹1,42,800' },
      stat2: { label: 'Feed Costs', val: '₹46,200' },
      stat3: { label: 'Net Profit', val: '₹96,600' },
      detail: 'Track feed expenses per cow against milk revenue for data-backed culling & investment.',
    },
  },
];

/* ── FAQ Data ── */
const FAQS = [
  {
    q: 'How does the QR Ear Tag system work in the field?',
    a: 'Each cattle profile generates a unique permanent Digital ID and high-resolution printable QR code. Farm workers can scan the tag with any standard smartphone camera or our built-in QR scanner to instantly bring up the animal’s medical history, pedigree, and milk yield.',
  },
  {
    q: 'Can I track native Indian breeds like Gir, Kangayam, and Sahiwal?',
    a: 'Yes! FarmEase has native breed templates specifically calibrated for Indian zebu breeds including Gir, Kangayam, Sahiwal, Red Sindhi, and Murrah buffaloes with localized yield benchmarks and gestation profiles.',
  },
  {
    q: 'Does it support multiple workers and veterinarians?',
    a: 'Absolutely. FarmEase includes role-based access control for Farm Owners, Managers, Milkers, and Visiting Veterinarians so everyone sees the exact tools they need.',
  },
  {
    q: 'Can I use FarmEase offline or in low connectivity barns?',
    a: 'Yes, FarmEase is built with local caching and offline-tolerant workflows so milk yield and vitals can be entered in the barn and synced automatically once connected.',
  },
];

export const Landing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('milk');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [herdSize, setHerdSize] = useState<number>(20);
  const [simulatedScanActive, setSimulatedScanActive] = useState<boolean>(false);


  const triggerSimulatedScan = () => {
    setSimulatedScanActive(true);
    setTimeout(() => {
      setSimulatedScanActive(false);
    }, 2500);
  };

  const currentTab = DEMO_TABS.find((t) => t.id === activeTab) || DEMO_TABS[0];

  /* ROI Calculations */
  const estDailyYield = herdSize * 15; // 15L avg per cow
  const estMonthlyRev = estDailyYield * 30 * 46; // ₹46/L
  const estFeedCost = herdSize * 1800; // ₹1800/cow/mo
  const estNetProfit = estMonthlyRev - estFeedCost;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-[#059669]/20 selection:text-[#059669] relative overflow-hidden">
      {/* ─── Ambient Animated Background Blobs ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -35, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 -right-32 w-[34rem] h-[34rem] rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-emerald-600/5 dark:bg-emerald-400/10 blur-3xl"
        />
      </div>

      {/* ─── Header / Navbar ─── */}
      <header className="h-20 border-b border-[#E2E8F0] dark:border-slate-800/80 sticky top-0 bg-[#F8FAFC]/85 dark:bg-[#0B0F19]/85 backdrop-blur-md z-50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo with interactive bounce */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-md group-hover:bg-[#047857] transition-colors"
            >
              <Leaf className="w-5 h-5 text-emerald-300" strokeWidth={2.2} />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-[#0F172A] dark:text-white leading-tight">
                FarmEase
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400 tracking-wider uppercase">
                Cattle Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B] dark:text-slate-400">
            <a href="#features" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Live Preview
            </a>
            <a href="#roi-calculator" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>ROI Calculator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </a>
            <a href="#how-it-works" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#faqs" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              FAQs
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0F172A] dark:text-slate-200 hover:text-[#059669] dark:hover:text-white hover:bg-[#EAE7DC]/60 dark:hover:bg-slate-800 transition-all"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                Get Started <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="px-6 pt-10 pb-16 lg:pt-14 lg:pb-20 max-w-7xl mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Animated live pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10 border border-[#059669]/20 dark:border-emerald-500/30 text-[#059669] dark:text-emerald-400 text-xs font-semibold tracking-wide shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Smart Cattle OS & Field Intelligence 2026</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            {/* Hero Main Heading with glowing gradient text */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-[1.12]">
              Smart Cattle Management,{' '}
              <span className="bg-gradient-to-r from-[#059669] via-emerald-600 to-teal-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Simplified & Automated.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-300 max-w-2xl leading-relaxed">
              Digitize your entire dairy & livestock operations. Manage pedigree breeding, automated 283-day calving alerts, daily milk quality logs, and QR ear tags in one unified platform.
            </p>

            {/* Interactive CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group w-full"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 rounded-xl bg-white dark:bg-[#15221B] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#059669]/50 hover:bg-[#F8FAFC] dark:hover:bg-[#1C2B22] text-[#0F172A] dark:text-slate-200 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 w-full"
                >
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Launch Live Demo
                </Link>
              </motion.div>
            </div>

            {/* Quick Live Farm Metrics Cards with hover lift */}
            <div className="pt-8 border-t border-[#E2E8F0] dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div whileHover={{ y: -4 }} className="space-y-0.5 p-2 rounded-xl transition-colors">
                <div className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <span>99.4%</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Herd Health Rate</div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="space-y-0.5 p-2 rounded-xl transition-colors">
                <div className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <span>283-Day</span>
                </div>
                <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Calving Predictor</div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="space-y-0.5 p-2 rounded-xl transition-colors">
                <div className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <span>+18.5%</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Average Milk Gain</div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="space-y-0.5 p-2 rounded-xl transition-colors">
                <div className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <span>Instant</span>
                  <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">QR Tag Scan</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Hero Interactive Visual Card (HIGH-TECH BIOMETRICS HUD) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Glow ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-75" />

            {/* Continuous Floating Container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#142019] shadow-2xl"
            >
              {/* Cattle Hero Image with Animated HUD & Biometrics Reticle */}
              <div className="relative overflow-hidden group">
                <img
                  src="/hero-farm.jpg"
                  alt="Healthy cattle grazing on modern farm"
                  className="w-full h-84 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Laser Scanning Line */}
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#10b981] opacity-90 pointer-events-none z-10"
                />

                {/* Simulated Radar Reticle Targeting Corner Brackets over ear tag */}
                <div className="absolute top-12 left-10 w-24 h-24 pointer-events-none z-20">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-2 border border-dashed border-emerald-400/50 rounded-lg flex items-center justify-center text-[9px] font-mono text-emerald-300"
                  >
                    TAG-LOCK
                  </motion.div>
                </div>

                {/* Interactive Scan Trigger Button */}
                <button
                  onClick={triggerSimulatedScan}
                  className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-emerald-900/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulatedScanActive ? 'animate-spin text-white' : ''}`} />
                  <span>{simulatedScanActive ? 'Scanning...' : 'Test Scan Tag'}</span>
                </button>

                {/* Floating Top Left Badge: Live Ear Tag */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>CAT-2026-0891</span>
                </motion.div>

                {/* Interactive Flash Overlay when scan triggered */}
                <AnimatePresence>
                  {simulatedScanActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-500/30 backdrop-blur-[2px] z-25 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-black/80 px-4 py-2 rounded-xl text-white text-xs font-bold border border-emerald-400 flex items-center gap-2 shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Digital Tag Verified: Gir Cow Purebred
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Biometric Pulse Line (ECG Animated Heartbeat) */}
                <div className="absolute bottom-16 left-4 right-4 z-20 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    <span className="font-mono text-[11px] text-slate-200">HR: 72 bpm</span>
                  </div>
                  {/* Animated ECG SVG wave */}
                  <svg className="w-24 h-5 stroke-emerald-400 fill-none" viewBox="0 0 100 20">
                    <motion.path
                      d="M 0 10 L 20 10 L 25 2 L 30 18 L 35 10 L 45 10 L 50 4 L 55 16 L 60 10 L 100 10"
                      strokeWidth="2"
                      strokeLinecap="round"
                      animate={{
                        pathOffset: [0, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </svg>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">Temp: 38.6°C</span>
                </div>

                {/* Floating Bottom Left Badge: Fresh Yield */}
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-3 left-4 z-20 bg-white/95 dark:bg-[#121E17]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs shadow-lg flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Milk className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] dark:text-white">18.5 L</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">+14%</span>
                  </div>
                </motion.div>

                {/* Floating Bottom Right Badge: Vitals */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-3 right-4 z-20 bg-white/95 dark:bg-[#121E17]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-[#0F172A] dark:text-white">Vitals Optimal</span>
                </motion.div>
              </div>

              {/* Card Meta Details */}
              <div className="p-4 bg-white dark:bg-[#142019] border-t border-[#E2E8F0] dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      Field Sensor Hub Active
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#059669]/10 dark:bg-emerald-500/10 text-[#059669] dark:text-emerald-400">
                    Gir Native Purebred
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B] dark:text-slate-300">
                  <div className="bg-[#F8FAFC] dark:bg-[#1C2B22] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700/60">
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400">Lactation Stage</span>
                    <strong className="text-[#0F172A] dark:text-white font-semibold">2nd Calving (Peak)</strong>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#1C2B22] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700/60">
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400">Next Vaccination</span>
                    <strong className="text-[#059669] dark:text-emerald-400 font-semibold">FMD Due in 12d</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Infinite Marquee Ticker (NEW CONTINUOUS ANIMATION) ─── */}
      <section className="border-y border-[#E2E8F0] dark:border-slate-800/80 bg-white/70 dark:bg-[#111C15]/70 py-4 overflow-hidden relative backdrop-blur-sm">
        <div className="flex w-max space-x-8 animate-marquee">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center gap-8 text-xs font-semibold text-[#64748B] dark:text-slate-300 whitespace-nowrap"
          >
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Interactive Live Preview Module with Animated Bar Chart ─── */}
      <section id="interactive-demo" className="px-6 py-20 bg-white dark:bg-[#111C15] border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3.5 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Interactive Simulation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Experience the Farm Management Dashboard
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300">
              Switch through live operational modules below to preview how FarmEase handles your daily farm chores.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            {DEMO_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 relative ${
                    isActive
                      ? 'bg-[#059669] text-white shadow-md'
                      : 'bg-[#F8FAFC] dark:bg-[#15221B] text-[#64748B] dark:text-slate-300 hover:text-[#059669] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-800'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 border-2 border-emerald-400/30 rounded-xl pointer-events-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Animated Tab Content Box */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-[#F8FAFC] dark:bg-[#142019] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0] dark:border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                      {currentTab.content.tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
                      {currentTab.content.title}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      {currentTab.content.detail}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1A2A21] px-5 py-3 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm text-right shrink-0">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#059669] dark:text-emerald-400">
                      {currentTab.content.metric}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      {currentTab.content.subtext}
                    </div>
                  </div>
                </div>

                {/* Animated Mini Graph Bar Simulation */}
                <div className="py-5 border-b border-[#E2E8F0]/60 dark:border-slate-800/60">
                  <div className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-Time Trajectory Trend</span>
                  </div>
                  <div className="flex items-end gap-3 h-24 bg-white dark:bg-[#16241C] p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                    {currentTab.content.chartData.map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(bar.val / 150) * 100}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.08 }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-md min-h-[6px]"
                        />
                        <span className="text-[10px] text-[#64748B] dark:text-slate-400">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Detailed Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-[#18261E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800"
                  >
                    <div className="text-xs text-[#64748B] dark:text-slate-400 mb-1">
                      {currentTab.content.stat1.label}
                    </div>
                    <div className="text-lg font-bold text-[#0F172A] dark:text-white">
                      {currentTab.content.stat1.val}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-[#18261E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800"
                  >
                    <div className="text-xs text-[#64748B] dark:text-slate-400 mb-1">
                      {currentTab.content.stat2.label}
                    </div>
                    <div className="text-lg font-bold text-[#0F172A] dark:text-white">
                      {currentTab.content.stat2.val}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-[#18261E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800"
                  >
                    <div className="text-xs text-[#64748B] dark:text-slate-400 mb-1">
                      {currentTab.content.stat3.label}
                    </div>
                    <div className="text-lg font-bold text-[#059669] dark:text-emerald-400">
                      {currentTab.content.stat3.val}
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 pt-4 border-t border-[#E2E8F0]/60 dark:border-slate-800/60">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Automated data validation active
                  </span>
                  <Link
                    to="/dashboard"
                    className="font-semibold text-[#059669] dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Open Live Module <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Interactive Farm Profit & Yield ROI Calculator (NEW HIGH-IMPACT SECTION) ─── */}
      <section id="roi-calculator" className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3.5 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10 inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Dynamic Herd Profitability Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Calculate Your Farm Revenue Potential
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300">
              Drag the slider to adjust your herd count and see real-time projected milk output, gross revenue, and estimated profits.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-[#131F18] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
            {/* Slider Control */}
            <div className="space-y-4 pb-8 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Beef className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Current Active Herd Size
                </span>
                <span className="text-2xl font-black text-[#059669] dark:text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-xl">
                  {herdSize} Cattle
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={herdSize}
                onChange={(e) => setHerdSize(parseInt(e.target.value))}
                className="w-full h-2.5 bg-[#F8FAFC] dark:bg-[#1B2920] rounded-lg appearance-none cursor-pointer accent-[#059669] dark:accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] text-[#64748B] dark:text-slate-400">
                <span>Small Farm (5 Cattle)</span>
                <span>Commercial Dairy (50 Cattle)</span>
                <span>Mega Herd (100 Cattle)</span>
              </div>
            </div>

            {/* Live Calculated Output Grid with motion number animations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#18261E] border border-[#E2E8F0] dark:border-slate-800 text-center"
              >
                <div className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Daily Herd Milk Yield</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white">
                  {estDailyYield.toLocaleString()} L
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  ~{(estDailyYield * 30).toLocaleString()} L / Month
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#18261E] border border-[#E2E8F0] dark:border-slate-800 text-center"
              >
                <div className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Gross Monthly Revenue</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white">
                  ₹{estMonthlyRev.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  At benchmark ₹46 / Liter
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-center"
              >
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                  Est. Net Monthly Profit
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#059669] dark:text-emerald-300">
                  ₹{estNetProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
                  After feed & care expenses
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section (ANIMATED CARDS) ─── */}
      <section id="features" className="px-6 py-20 bg-white dark:bg-[#111C15] border-y border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10">
              Core Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Everything Needed to Run a Commercial Farm
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300">
              Integrated agricultural tools designed for livestock managers, dairy operations, and veterinary care.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#F8FAFC] dark:bg-[#15221B] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-[#059669]/40 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  {/* Subtle hover gradient glow */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                  <div className="flex items-center justify-between">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className="w-12 h-12 rounded-xl bg-[#059669]/10 dark:bg-emerald-500/10 text-[#059669] dark:text-emerald-400 flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-colors shadow-sm"
                    >
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </motion.div>
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 px-2.5 py-1 rounded-full bg-white dark:bg-[#1A2820] border border-[#E2E8F0] dark:border-slate-700/60">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#0F172A] dark:text-white mb-1.5 group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works (ANIMATED PIPELINE WITH PULSE CONNECTORS) ─── */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              How FarmEase Works
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300">
              Three straightforward steps to organize and modernize your livestock management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-[#142019] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-7 space-y-4 relative hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#059669] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {step.step}
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <StepIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      ✓ {step.highlight}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Practical Benefits Section ─── */}
      <section className="px-6 py-20 bg-white dark:bg-[#111C15] border-y border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10">
              Enterprise Ready
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Everything Your Farm Needs in One Place
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-300">
              Built to replace fragmented spreadsheets and paper binders with clean digital infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-[#F8FAFC] dark:bg-[#15221B] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#059669]/10 dark:bg-emerald-500/10 text-[#059669] dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                    {benefit.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Animated FAQ Accordion ─── */}
      <section id="faqs" className="px-6 py-20 max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/10">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-300">
            Clear answers to help you get the most out of FarmEase.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <motion.div
                key={index}
                className="border border-[#E2E8F0] dark:border-slate-800 rounded-2xl bg-white dark:bg-[#142019] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-[#0F172A] dark:text-white hover:text-[#059669] dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 ml-4"
                  >
                    <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-6 pb-5 text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed border-t border-[#E2E8F0]/50 dark:border-slate-800/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Final CTA Banner ─── */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full relative">
        <motion.div
          whileHover={{ scale: 1.008 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#132219] rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-xl border-2 border-[#E2E8F0] dark:border-emerald-800/40 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow Blobs inside the card */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl pointer-events-none" />

          {/* Leaf Icon with gentle glow */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-2xl bg-[#059669] text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-900/20"
          >
            <Leaf className="w-7 h-7 text-emerald-300" strokeWidth={2.2} />
          </motion.div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 px-3.5 py-1 rounded-full bg-[#059669]/10 dark:bg-emerald-500/15 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Modern Livestock Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-tight">
              Take Complete Control of{' '}
              <span className="bg-gradient-to-r from-[#059669] via-emerald-600 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                Your Cattle Records
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed">
              Replace paper logbooks and scattered notes with one unified, professional platform. Organize health histories, daily milk logs, 283-day gestation alerts, and scannable QR ear tags in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 relative z-10">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <a
                href="#interactive-demo"
                className="px-8 py-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1A2C21] hover:bg-[#EAE7DC]/60 dark:hover:bg-[#22392B] text-[#059669] dark:text-emerald-300 font-bold text-sm transition-all border border-[#E2E8F0] dark:border-emerald-700/40 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Explore Interactive Demo</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E2E8F0] dark:border-slate-800/80 px-6 py-10 bg-white dark:bg-[#0B120E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#059669] text-white flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <span>© 2026 FarmEase Systems. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/about" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
