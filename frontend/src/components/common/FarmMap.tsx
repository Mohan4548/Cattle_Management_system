import React, { useState } from 'react';
import { Cattle } from '../../types';
import { MapPin, Beef, ShieldAlert, CheckCircle2, Navigation, Layers } from 'lucide-react';

interface FarmMapProps {
  cattleList: Cattle[];
}

export const FarmMap: React.FC<FarmMapProps> = ({ cattleList }) => {
  const [selectedZone, setSelectedZone] = useState<string>('barn-a');

  const zones = [
    { id: 'barn-a', name: 'Barn A - Main Dairy Parlor', count: 3, capacity: 50, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400', desc: 'Active milking cows with automated chilling pipeline' },
    { id: 'barn-b', name: 'Barn B - Heifer & Bull Pen', count: 1, capacity: 40, color: 'border-indigo-500 bg-indigo-500/10 text-indigo-400', desc: 'Young heifers and breeding stud bulls' },
    { id: 'grazing-1', name: 'Pasture Field 1 (Organic Grass)', count: 2, capacity: 100, color: 'border-amber-500 bg-amber-500/10 text-amber-400', desc: 'Open grazing pasture with rotational fencing' },
    { id: 'calving-pen', name: 'Maternity Calving Pen', count: 1, capacity: 10, color: 'border-purple-500 bg-purple-500/10 text-purple-400', desc: 'Specialized pre-calving monitoring pen' },
    { id: 'quarantine', name: 'Isolation & Treatment Bay', count: 1, capacity: 10, color: 'border-rose-500 bg-rose-500/10 text-rose-400', desc: 'Veterinary care bay for medical observation' },
  ];

  const currentZoneObj = zones.find(z => z.id === selectedZone);

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-500" />
            Interactive Farm Pasture Map & Location Layout
          </h3>
          <p className="text-xs text-slate-500">Live spatial distribution across barns, pastures, and maternity pens</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          Green Valley Pastures (120 Acres)
        </span>
      </div>

      {/* Visual Farm Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
              selectedZone === zone.id ? zone.color + ' shadow-glow scale-[1.02]' : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {zone.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900/80 text-white">
                {zone.count}/{zone.capacity}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">{zone.desc}</p>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(zone.count / zone.capacity) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Zone Detail View */}
      {currentZoneObj && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Beef className="w-4 h-4 text-emerald-400" />
            Cattle Assigned to {currentZoneObj.name} ({currentZoneObj.count} Head)
          </h4>
          <p className="text-slate-400 text-[11px]">
            Real-time GPS ear tag location telemetry active. No movement anomalies detected.
          </p>
        </div>
      )}
    </div>
  );
};
