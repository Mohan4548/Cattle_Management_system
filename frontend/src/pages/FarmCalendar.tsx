import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Cattle } from '../types';
import { FarmMap } from '../components/common/FarmMap';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Syringe, 
  Baby, 
  Boxes, 
  Sun,
  MapPin,
  Save
} from 'lucide-react';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  author: string;
}

const INITIAL_DIARY: DiaryEntry[] = [
  { id: 'd-1', date: '2026-08-09', title: 'Morning Chilling Plant Servicing & Milk Testing', content: 'Morning milking completed across Barn A. Milk chiller temp stable at 3.8°C. Average FAT 4.4%.', author: 'Dr. Sarah Jenkins' },
  { id: 'd-2', date: '2026-08-08', title: 'Alfalfa Fodder Batch Delivery Inspection', content: 'Received 180 bales of premium Alfalfa Hay. Checked moisture content (14%). Passed quality check.', author: 'John Miller' },
];

export const FarmCalendar: React.FC = () => {
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [diaryLogs, setDiaryLogs] = useState<DiaryEntry[]>(INITIAL_DIARY);
  const [activeView, setActiveView] = useState<'calendar' | 'map' | 'diary'>('calendar');

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fetchCattle = async () => {
    try {
      const res = await apiClient.get('/cattle');
      setCattleList(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchCattle();
  }, []);

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    const entry: DiaryEntry = {
      id: `d-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      content: newContent,
      author: 'Dr. Sarah Jenkins',
    };
    setDiaryLogs([entry, ...diaryLogs]);
    setNewTitle('');
    setNewContent('');
  };

  const calendarEvents = [
    { date: '2026-08-09', title: 'Morning & Evening Milking Logs', type: 'milk', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { date: '2026-08-11', title: 'Dairy Concentrate Mix 18% Delivery (50 Bags)', type: 'feed', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { date: '2026-08-15', title: 'Anthrax & Blackleg Booster Vaccination (Veera)', type: 'vaccine', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { date: '2026-08-20', title: 'Fenbendazole Deworming (Lakshmi)', type: 'deworm', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { date: '2027-01-18', title: 'Ganga Expected Calving Date (Gestation 283 Days)', type: 'calving', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-500" />
            Smart Farm Calendar, Spatial Map & Digital Diary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated operational schedule, pasture spatial layout, and manager digital logbook.
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveView('calendar')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeView === 'calendar' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Operational Schedule
        </button>

        <button
          onClick={() => setActiveView('map')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeView === 'map' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" /> Pasture Location Map
        </button>

        <button
          onClick={() => setActiveView('diary')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeView === 'diary' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Digital Farm Diary ({diaryLogs.length})
        </button>
      </div>

      {/* Tab 1: Operational Schedule */}
      {activeView === 'calendar' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">August 2026 Operational Schedule</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarEvents.map((evt, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${evt.color} space-y-1.5 text-xs`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{evt.title}</span>
                  <span className="font-mono text-[10px]">{evt.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Pasture Location Map */}
      {activeView === 'map' && (
        <FarmMap cattleList={cattleList} />
      )}

      {/* Tab 3: Digital Farm Diary */}
      {activeView === 'diary' && (
        <div className="space-y-6">
          <form onSubmit={handleAddDiary} className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Log Farm Manager Note
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Log Title (e.g., Milking Chiller Temperature Log...)"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
              />

              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Detailed farm observations, weather notes, feed checks..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-glow">
              + Save Log Entry
            </button>
          </form>

          <div className="space-y-4">
            {diaryLogs.map((d) => (
              <div key={d.id} className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{d.title}</h4>
                  <span className="font-mono text-slate-400">{d.date}</span>
                </div>
                <p className="text-slate-400">{d.content}</p>
                <span className="text-[10px] font-bold text-emerald-400 block pt-1">Logged by: {d.author}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
