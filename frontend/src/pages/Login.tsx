import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Mail, Lock, ArrowRight, Sparkles,
  Leaf, Beef, Milk, Stethoscope, Heart, Eye, EyeOff,
} from 'lucide-react';
import { UserRole } from '../types';

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

const DEMO_ROLES: { role: UserRole; name: string; email: string; icon: React.ElementType; color: string }[] = [
  { role: 'admin',        name: 'Admin',       email: 'admin@farmease.com',  icon: ShieldCheck, color: 'from-violet-500 to-purple-600' },
  { role: 'farmer',       name: 'Farmer',      email: 'farmer@farmease.com', icon: Leaf,        color: 'from-emerald-500 to-teal-600' },
  { role: 'veterinarian', name: 'Veterinarian',email: 'vet@farmease.com',    icon: Stethoscope, color: 'from-sky-500 to-blue-600' },
  { role: 'worker',       name: 'Worker',      email: 'worker@farmease.com', icon: Beef,        color: 'from-amber-500 to-orange-600' },
];

/* ── Left panel feature bullets ── */
const PANEL_FEATURES = [
  { icon: Beef,        text: 'Herd Directory with QR Ear Tags' },
  { icon: Milk,        text: 'Real-Time Milk Yield Analytics' },
  { icon: Stethoscope, text: 'Veterinary Health & Vitals Tracker' },
  { icon: Heart,       text: '283-Day Calving Countdown' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@farmease.com', password: 'password123' },
  });

  const handleRoleSelect = (role: UserRole, email: string) => {
    setSelectedRole(role);
    setValue('email', email);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(data.email, data.password, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── Left visual panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/40 via-slate-950 to-teal-900/30" />
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-[60px]" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-black text-2xl text-white">FarmEase</span>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Smart SaaS v2.0</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-display font-black text-4xl text-white leading-tight">
              Smart Cattle & Dairy<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Management Platform
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs">
              Monitor your herd, track milk yields, manage health records, and grow your farm's profitability.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {PANEL_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{f.text}</span>
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8">
            {[['340+', 'Farms'], ['12K+', 'Cattle'], ['98%', 'Uptime']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-2xl text-white">{val}</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs text-slate-400 italic leading-relaxed">
            "FarmEase increased our milk revenue by 22% in the first quarter by identifying underperforming cattle early."
          </p>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">— Rajan Pillai, Green Valley Farm</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md space-y-6"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-black text-lg text-white">FarmEase</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your farm dashboard</p>
          </div>

          {/* Demo role selector */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role, r.email)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    {r.name}
                    {isSelected && <ShieldCheck className="w-3 h-3 text-emerald-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@farmease.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Register your farm →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
