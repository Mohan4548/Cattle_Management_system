/**
 * FarmEase – CattleQuickCard Component
 * Phase 3: Smart QR Scanner & Digital Profile Access
 *
 * Animated popup that appears after a successful QR scan.
 * Shows minimal cattle info and auto-navigates after 2 seconds.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Beef,
  Heart,
  Milk,
  Syringe,
  Fingerprint,
  X,
} from 'lucide-react';
import type { ScannedCattleInfo } from '../types/index';

interface CattleQuickCardProps {
  cattle: ScannedCattleInfo;
  autoNavigateDelay?: number; // ms, default 2500
  onClose: () => void;
}

const HEALTH_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  healthy:          { bg: 'bg-emerald-500/15', text: 'text-emerald-500', label: 'Healthy' },
  sick:             { bg: 'bg-rose-500/15',    text: 'text-rose-500',    label: 'Sick' },
  under_treatment:  { bg: 'bg-amber-500/15',   text: 'text-amber-500',  label: 'Under Treatment' },
  quarantined:      { bg: 'bg-red-500/15',     text: 'text-red-500',    label: 'Quarantined' },
  pregnant:         { bg: 'bg-purple-500/15',  text: 'text-purple-500', label: 'Pregnant' },
};

const MILK_STAGE: Record<string, { label: string; icon: string }> = {
  early:   { label: 'Early Lactation', icon: '🟢' },
  mid:     { label: 'Mid Lactation',   icon: '🟡' },
  late:    { label: 'Late Lactation',  icon: '🟠' },
  dry:     { label: 'Dry Period',      icon: '⚪' },
  heifer:  { label: 'Heifer',         icon: '🔵' },
  bull:    { label: 'Bull',            icon: '⚫' },
};

export const CattleQuickCard: React.FC<CattleQuickCardProps> = ({
  cattle,
  autoNavigateDelay = 2500,
  onClose,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(Math.ceil(autoNavigateDelay / 1000));
  const [navigating, setNavigating] = useState(false);

  const healthInfo = HEALTH_COLORS[cattle.health_status] ?? HEALTH_COLORS.healthy;
  const milkInfo = MILK_STAGE[cattle.lactation_stage] ?? MILK_STAGE.mid;

  const goToProfile = () => {
    setNavigating(true);
    onClose();
    navigate(`/cattle/${cattle.cattle_id}`);
  };

  // Countdown timer & auto-navigate
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          goToProfile();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        {/* Card */}
        <motion.div
          initial={{ y: 80, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 80, scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800"
        >
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-5 pb-14">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">QR Scan Successful!</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Digital ID badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/20 border border-white/30">
              <Fingerprint className="w-3 h-3 text-white" />
              <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                {cattle.digital_identity_id}
              </span>
            </div>
          </div>

          {/* Cattle Photo + Name (overlapping header) */}
          <div className="relative -mt-10 px-5 pb-5">
            <div className="flex items-end gap-4 mb-4">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                {cattle.image_url ? (
                  <img
                    src={cattle.image_url}
                    alt={cattle.cattle_name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                    <Beef className="w-8 h-8 text-emerald-400" />
                  </div>
                )}
                {/* Status dot */}
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${cattle.health_status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>

              {/* Name + Tag */}
              <div className="flex-1 min-w-0 mb-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {cattle.cattle_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white font-mono text-[10px] font-bold border border-white/10">
                    {cattle.cattle_tag}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Breed */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Beef className="w-2.5 h-2.5" /> Breed
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">{cattle.breed}</p>
              </div>

              {/* Age */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <span className="text-[8px]">🎂</span> Age
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{cattle.age ?? 'N/A'}</p>
              </div>

              {/* Health */}
              <div className={`p-2.5 rounded-xl ${healthInfo.bg} border border-current/20`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" /> Health
                </span>
                <p className={`text-xs font-bold ${healthInfo.text} mt-0.5`}>{healthInfo.label}</p>
              </div>

              {/* Milk Stage */}
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Milk className="w-2.5 h-2.5" /> Milk Status
                </span>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                  {milkInfo.icon} {milkInfo.label}
                </p>
              </div>
            </div>

            {/* Auto-navigate countdown ring */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Syringe className="w-2.5 h-2.5" /> Opening profile in {countdown}s...
                </span>
                <span className="text-emerald-500">Auto-navigating</span>
              </div>
              <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoNavigateDelay / 1000, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Open Profile Button */}
            <button
              onClick={goToProfile}
              disabled={navigating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-60 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/30"
            >
              {navigating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Open Full Profile
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
