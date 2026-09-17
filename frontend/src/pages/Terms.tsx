import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <header className="h-20 border-b border-slate-800 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="font-black text-lg text-white">Terms of Service</span>
      </header>

      <main className="px-6 py-16 max-w-4xl mx-auto space-y-6 text-xs text-slate-400 leading-relaxed flex-1">
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p>Effective Date: August 9, 2026</p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. SaaS Subscription Agreement</h2>
          <p>By registering for FarmEase, you agree to access features according to your selected subscription tier (Starter, Professional, or Enterprise).</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Acceptable Use & RBAC Compliance</h2>
          <p>Users must adhere to assigned Role-Based Access Control (RBAC) permissions. Admin credentials must be kept secure.</p>
        </section>
      </main>

      <footer className="border-t border-slate-800 p-6 text-center text-xs text-slate-500">
        © 2026 FarmEase SaaS Inc. All rights reserved.
      </footer>
    </div>
  );
};
