import React from 'react';
import { Cattle } from '../../types';
import { Dna, Heart, Shield } from 'lucide-react';

interface FamilyTreeProps {
  cattle: Cattle;
  allCattle: Cattle[];
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ cattle, allCattle }) => {
  // Locate parent objects if they exist in store
  const damObj = allCattle.find(c => c.tag_number === cattle.dam_tag || c.name.includes(cattle.dam_tag || 'FE-045'));
  const sireObj = allCattle.find(c => c.tag_number === cattle.sire_tag || c.name.includes(cattle.sire_tag || 'BULL-92'));

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 via-slate-900/60 to-slate-950 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-500" />
            Genetic Lineage & Family Tree Diagram
          </h3>
          <p className="text-xs text-slate-500">Visual pedigree lineage mapping parents and grandparents</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-400 font-mono text-xs font-bold border border-purple-500/30">
          Pedigree: {cattle.tag_number}
        </span>
      </div>

      {/* Pedigree Hierarchy Tree */}
      <div className="flex flex-col items-center justify-center space-y-8 py-4">
        {/* Layer 1: Grandparents */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl text-center">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold block text-[9px] uppercase">Maternal Granddam</span>
            <p className="font-bold text-purple-300 truncate">GD-012 (Gir)</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold block text-[9px] uppercase">Maternal Grandsire</span>
            <p className="font-bold text-indigo-300 truncate">GS-GIR-01</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold block text-[9px] uppercase">Paternal Granddam</span>
            <p className="font-bold text-purple-300 truncate">GD-JER-88</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold block text-[9px] uppercase">Paternal Grandsire</span>
            <p className="font-bold text-indigo-300 truncate">GS-KANG-99</p>
          </div>
        </div>

        {/* Connector Lines Layer 1 -> Layer 2 */}
        <div className="w-full max-w-md h-4 border-t-2 border-r-2 border-l-2 border-purple-500/30 -my-4 rounded-t-xl" />

        {/* Layer 2: Parents (Dam & Sire) */}
        <div className="grid grid-cols-2 gap-8 sm:gap-16 w-full max-w-md text-center">
          {/* Dam (Mother) */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1.5 shadow-lg">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Dam (Mother) ♀
            </span>
            <h4 className="font-black text-sm text-white">{damObj?.name || cattle.dam_tag || 'FE-045 (Gir)'}</h4>
            <p className="text-[10px] text-slate-400 font-mono">High Yield Lineage</p>
          </div>

          {/* Sire (Father) */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5 shadow-lg">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Sire (Father) ♂
            </span>
            <h4 className="font-black text-sm text-white">{sireObj?.name || cattle.sire_tag || 'BULL-92 (Jersey)'}</h4>
            <p className="text-[10px] text-slate-400 font-mono">Genetic Merit Grade A</p>
          </div>
        </div>

        {/* Connector Line Layer 2 -> Layer 3 */}
        <div className="w-16 h-6 border-b-2 border-r-2 border-l-2 border-purple-500/40 -my-4 rounded-b-xl" />

        {/* Layer 3: Selected Cattle / Calf Node */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500 shadow-glow text-center max-w-xs w-full space-y-2">
          <img
            src={cattle.image_url}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover mx-auto ring-4 ring-emerald-500/40 shadow-xl"
          />
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-white">
              Target Cattle Node
            </span>
            <h3 className="text-base font-black text-white mt-1">{cattle.name}</h3>
            <p className="text-xs font-mono text-emerald-400 font-bold">{cattle.tag_number} • {cattle.breed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
