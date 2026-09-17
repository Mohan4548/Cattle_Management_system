import React from 'react';
import { Link } from 'react-router-dom';
import { Beef, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center">
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-glow">
        <Beef className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-black tracking-tight text-white">404</h1>
      <h2 className="text-xl font-bold mt-2 text-slate-200">Page Not Found</h2>
      <p className="text-xs text-slate-400 mt-2 max-w-sm">
        The page or cattle record you are searching for does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};
