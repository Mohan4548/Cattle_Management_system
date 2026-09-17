import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

/* ── Features List ── */
const FEATURES = [
  {
    icon: Beef,
    title: 'Herd Directory & Breeds',
    desc: 'Auto Tag IDs, QR ear tags, and profiles for Gir, Kangayam, Sahiwal, Ongole and native breeds.',
  },
  {
    icon: Milk,
    title: 'Milk Yield & Quality Metrics',
    desc: 'Track morning & evening yields, FAT% / SNF% quality scores, milk rate pricing, and performance logs.',
  },
  {
    icon: Stethoscope,
    title: 'Veterinary Health & Vitals',
    desc: 'Vaccination schedules, deworming cycles, doctor visit logs, and vitals trend monitoring.',
  },
  {
    icon: Heart,
    title: '283-Day Calving Predictor',
    desc: 'Insemination tracking, 283-day gestation countdown, calf registration, and pedigree history.',
  },
  {
    icon: DollarSign,
    title: 'Purchase & P&L Financials',
    desc: 'Track purchases, feed costs, medicine expenses, sales ledger, and printable P&L statements.',
  },
  {
    icon: QrCode,
    title: 'QR Digital Ear Tag System',
    desc: 'Unique permanent Digital IDs (CAT-2026-XXXXXX) with scannable QR ear tags for quick field checks.',
  },
];

/* ── How It Works Steps ── */
const STEPS = [
  {
    step: '01',
    title: 'Register Your Cattle',
    desc: 'Create digital cattle profiles with ear tag IDs, breed classifications, age, and initial medical history.',
  },
  {
    step: '02',
    title: 'Track Daily Operations',
    desc: 'Log milk yield, vaccination dates, health checks, feed expenses, and breeding cycles in real time.',
  },
  {
    step: '03',
    title: 'Monitor & Manage',
    desc: 'View clear herd analytics, financial ROI, automated health reminders, and digital audit documents.',
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0E1712] text-[#1C2420] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-[#163E2B]/20 selection:text-[#163E2B]">
      {/* ─── Header / Navbar ─── */}
      <header className="h-20 border-b border-[#E5E2D7] dark:border-slate-800/80 sticky top-0 bg-[#FAF8F5]/90 dark:bg-[#0E1712]/90 backdrop-blur-md z-50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#163E2B] text-white flex items-center justify-center shadow-sm group-hover:bg-[#113222] transition-colors">
              <Leaf className="w-5 h-5 text-emerald-300" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-[#1C2420] dark:text-white leading-tight">
                FarmEase
              </span>
              <span className="text-[10px] font-semibold text-[#526258] dark:text-slate-400 tracking-wider uppercase">
                Cattle Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#526258] dark:text-slate-400">
            <a href="#features" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <Link to="/about" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1C2420] dark:text-slate-200 hover:text-[#163E2B] dark:hover:text-white hover:bg-[#EAE7DC]/60 dark:hover:bg-slate-800 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#163E2B] hover:bg-[#113222] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="px-6 pt-12 pb-20 lg:pt-16 lg:pb-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#163E2B]/10 dark:bg-emerald-500/10 border border-[#163E2B]/20 dark:border-emerald-500/30 text-[#163E2B] dark:text-emerald-400 text-xs font-semibold tracking-wide">
              <Shield className="w-3.5 h-3.5 text-[#163E2B] dark:text-emerald-400" />
              Professional Livestock Management Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C2420] dark:text-white leading-[1.12]">
              Smart Cattle Management,{' '}
              <span className="text-[#163E2B] dark:text-emerald-400">Simplified.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#526258] dark:text-slate-300 max-w-2xl leading-relaxed">
              Manage cattle health, purchases, vaccinations, breeding, milk records and farm operations from one connected platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-xl bg-[#163E2B] hover:bg-[#113222] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-white dark:bg-[#15221B] border border-[#E5E2D7] dark:border-slate-700 hover:border-[#163E2B]/40 text-[#1C2420] dark:text-slate-200 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Launch Live Demo
              </Link>
            </div>

            {/* Quick Farm Metrics */}
            <div className="pt-8 border-t border-[#E5E2D7] dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#1C2420] dark:text-white">Healthy Cattle</div>
                <div className="text-xs text-[#526258] dark:text-slate-400 font-medium">Digital Herd Profiles</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#1C2420] dark:text-white">Vaccinations</div>
                <div className="text-xs text-[#526258] dark:text-slate-400 font-medium">Scheduled Alerts</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#1C2420] dark:text-white">Milk Records</div>
                <div className="text-xs text-[#526258] dark:text-slate-400 font-medium">Daily Production Log</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#1C2420] dark:text-white">QR Ear Tags</div>
                <div className="text-xs text-[#526258] dark:text-slate-400 font-medium">Instant Field Verification</div>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E2D7] dark:border-slate-800 bg-white dark:bg-[#142019] shadow-md">
              <img
                src="/hero-farm.jpg"
                alt="Healthy cattle grazing on modern farm"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-5 bg-white dark:bg-[#142019] border-t border-[#E5E2D7] dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#1C2420] dark:text-white">
                      Farm System Online
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#163E2B]/10 dark:bg-emerald-500/10 text-[#163E2B] dark:text-emerald-400">
                    ID: CAT-2026-0891
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#526258] dark:text-slate-300">
                  <div className="bg-[#FAF8F5] dark:bg-[#1C2B22] p-2.5 rounded-lg border border-[#E5E2D7] dark:border-slate-700/60">
                    <span className="block text-[11px] text-[#526258] dark:text-slate-400">Breed</span>
                    <strong className="text-[#1C2420] dark:text-white font-semibold">Gir / Indian Native</strong>
                  </div>
                  <div className="bg-[#FAF8F5] dark:bg-[#1C2B22] p-2.5 rounded-lg border border-[#E5E2D7] dark:border-slate-700/60">
                    <span className="block text-[11px] text-[#526258] dark:text-slate-400">Daily Milk Yield</span>
                    <strong className="text-[#163E2B] dark:text-emerald-400 font-semibold">18.5 Liters / Day</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="px-6 py-20 bg-white dark:bg-[#111C15] border-y border-[#E5E2D7] dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#163E2B] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#163E2B]/10 dark:bg-emerald-500/10">
              Core Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C2420] dark:text-white tracking-tight">
              Everything Needed to Run a Commercial Farm
            </h2>
            <p className="text-sm text-[#526258] dark:text-slate-300">
              Integrated agricultural tools designed for livestock managers, dairy operations, and veterinary care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-[#FAF8F5] dark:bg-[#15221B] border border-[#E5E2D7] dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-[#163E2B]/40 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#163E2B]/10 dark:bg-emerald-500/10 text-[#163E2B] dark:text-emerald-400 flex items-center justify-center group-hover:bg-[#163E2B] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1C2420] dark:text-white mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#526258] dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#163E2B] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#163E2B]/10 dark:bg-emerald-500/10">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C2420] dark:text-white tracking-tight">
              How FarmEase Works
            </h2>
            <p className="text-sm text-[#526258] dark:text-slate-300">
              Three straightforward steps to organize and modernize your livestock management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white dark:bg-[#142019] border border-[#E5E2D7] dark:border-slate-800 rounded-2xl p-7 space-y-4 relative"
              >
                <div className="w-10 h-10 rounded-xl bg-[#163E2B] text-white font-bold text-sm flex items-center justify-center">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg text-[#1C2420] dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-[#526258] dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust & Practical Benefits Section ─── */}
      <section className="px-6 py-20 bg-white dark:bg-[#111C15] border-y border-[#E5E2D7] dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#163E2B] dark:text-emerald-400 px-3 py-1 rounded-full bg-[#163E2B]/10 dark:bg-emerald-500/10">
              Enterprise Ready
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1C2420] dark:text-white tracking-tight">
              Everything Your Farm Needs in One Place
            </h2>
            <p className="text-sm text-[#526258] dark:text-slate-300">
              Built to replace fragmented spreadsheets and paper binders with clean digital infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="bg-[#FAF8F5] dark:bg-[#15221B] border border-[#E5E2D7] dark:border-slate-800 rounded-2xl p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#163E2B]/10 dark:bg-emerald-500/10 text-[#163E2B] dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1C2420] dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-[#526258] dark:text-slate-300 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ─── */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
        <div className="bg-[#163E2B] text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/50 mx-auto flex items-center justify-center text-emerald-200">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Take Control of Your Cattle Records
          </h2>
          <p className="text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Manage your farm with one simple, professional platform. Organize health histories, milk production, and digital identity tags effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-[#163E2B] hover:bg-emerald-50 font-bold text-sm transition-colors shadow-sm"
            >
              Get Started Now
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors border border-emerald-700/60"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#E5E2D7] dark:border-slate-800/80 px-6 py-10 bg-white dark:bg-[#0B120E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#526258] dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#163E2B] text-white flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <span>© 2026 FarmEase Systems. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/about" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#163E2B] dark:hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
