import React from 'react';
import { Link } from 'react-router-dom';
import { Beef, ShieldCheck, Heart, Award, ArrowLeft } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <header className="h-20 border-b border-slate-800 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="font-black text-lg text-white">FarmEase SaaS</span>
      </header>

      <main className="px-6 py-16 max-w-4xl mx-auto space-y-8 flex-1">
        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            About FarmEase
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Empowering Modern Cattle Ranchers & Veterinary Care
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            FarmEase was founded to transform dairy farm operations through data-driven insights, automated health alerts, 283-day calving predictors, and pedigree tracking for native Indian and global breeds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Our Mission</h3>
            <p className="text-xs text-slate-400">To increase milk yield efficiency and improve livestock health through accessible SaaS technology.</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
            <Award className="w-6 h-6 text-teal-400" />
            <h3 className="font-bold text-base text-white">Native Breed Conservation</h3>
            <p className="text-xs text-slate-400">Dedicated pedigree tracking for Gir, Kangayam, Sahiwal, Ongole, Hallikar, and Red Sindhi breeds.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 p-6 text-center text-xs text-slate-500">
        © 2026 FarmEase SaaS Inc. All rights reserved.
      </footer>
    </div>
  );
};
