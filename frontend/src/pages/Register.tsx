import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Phone, ArrowRight, Shield,
  Leaf, Eye, EyeOff, CheckCircle2, Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email:     z.string().email('Please enter a valid email address'),
  password:  z.string().min(6, 'Password must be at least 6 characters'),
  phone:     z.string().optional(),
  role:      z.enum(['admin', 'farmer', 'veterinarian', 'worker']),
});
type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'farmer',       label: 'Farmer / Owner',     desc: 'Full herd & financial access' },
  { value: 'admin',        label: 'System Admin',        desc: 'All permissions & user mgmt' },
  { value: 'veterinarian', label: 'Veterinarian',        desc: 'Health & medical records' },
  { value: 'worker',       label: 'Field Worker',        desc: 'Tasks & milk logging' },
];

const PERKS = [
  '14-day free trial, no credit card',
  'Import from existing spreadsheets',
  'RBAC access controls for your team',
  'Dedicated onboarding support',
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'farmer' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await registerAuth(data);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-900/40 via-slate-950 to-emerald-900/30" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-[80px]" />
          <div className="absolute bottom-10 -left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.45)]">
            <Leaf className="w-5.5 h-5.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-xl text-white">FarmEase</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="font-display font-black text-4xl text-white leading-tight">
              Start Your Free<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                Farm Dashboard
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xs">
              Set up your complete cattle management system in under 5 minutes. No technical expertise required.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{p}</span>
              </div>
            ))}
          </div>

          {/* Decorative card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">14-Day Free Trial Includes</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['All Modules', 'Unlimited Records', 'QR Generator', 'CSV Exports'].map((f) => (
                <div key={f} className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-slate-600">
          © 2026 FarmEase SaaS Inc. — Smart Cattle Management Platform
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-[60px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md space-y-5"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-black text-lg text-white">FarmEase</span>
          </div>

          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">Start your 14-day free trial today</p>
          </div>

          {/* Role picker */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Select your role</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setSelectedRole(r.value); setValue('role', r.value); }}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>{r.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('role')} value={selectedRole} />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('full_name')}
                  type="text"
                  placeholder="Dr. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                />
              </div>
              {errors.full_name && <p className="text-[11px] text-rose-400 mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@farm.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('phone')}
                  type="text"
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
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
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Farm Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in →
            </Link>
          </p>

          <p className="text-center text-[10px] text-slate-600">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-slate-500 hover:text-slate-400">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-slate-500 hover:text-slate-400">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
