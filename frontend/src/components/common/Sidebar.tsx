import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Beef,
  Milk,
  Stethoscope,
  Heart,
  Boxes,
  DollarSign,
  CheckSquare,
  Users,
  Settings,
  Calendar as CalendarIcon,
  Leaf,
  ScanLine,
  Sparkles,
  X,
  LogOut,
  BarChart2,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: 'green' | 'rose' | 'sky' | 'amber';
  roleRequired?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Farm Operations',
    items: [
      { to: '/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
      { to: '/ai-insights', label: 'AI Insights',      icon: Sparkles,      badge: 'AI', badgeColor: 'sky' },
      { to: '/qr-scanner',  label: 'QR Scanner',        icon: ScanLine,      badge: 'Scan', badgeColor: 'sky' },
      { to: '/cattle',      label: 'Cattle',            icon: Beef },
      { to: '/milk',        label: 'Milk Records',      icon: Milk },
      { to: '/health',      label: 'Health & Vet',      icon: Stethoscope,   badge: '1', badgeColor: 'rose' },
      { to: '/breeding',    label: 'Breeding',          icon: Heart },
      { to: '/calendar',    label: 'Farm Calendar',     icon: CalendarIcon },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/inventory',  label: 'Feed & Inventory',  icon: Boxes },
      { to: '/financials', label: 'Finance',           icon: DollarSign },
      { to: '/purchases',  label: 'Purchases',         icon: ShoppingCart },
      { to: '/tasks',      label: 'Tasks',             icon: CheckSquare },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users',    label: 'Users',    icon: Users,    roleRequired: 'admin' },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const badgeStyles: Record<string, string> = {
  green:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rose:   'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  sky:    'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  amber:  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <aside
      className="bg-[#0B1329] border-r border-slate-800/80 h-screen flex flex-col z-40 shrink-0 select-none shadow-xl"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          {/* Clean logo mark */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <Leaf className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-black text-white text-base leading-tight tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              FarmEase
            </div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
              Smart Cattle SaaS
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation Groups ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => {
          const visible = group.items.filter(
            (item) => !item.roleRequired || user?.role === item.roleRequired
          );
          if (!visible.length) return null;

          return (
            <div key={group.label}>
              {/* Group label with subtle line */}
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{group.label}</span>
                <div className="flex-1 h-px bg-slate-800/60" />
              </div>

              {/* Items */}
              <nav className="space-y-1">
                {visible.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                        active
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800/90 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700/80'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.5 : 2} />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${badgeStyles[item.badgeColor || 'green']}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Active chevron */}
                      {active && !item.badge && (
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-200 shrink-0 opacity-80" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* ── User Footer — executive dark card ── */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-800/80 shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 shadow-md group cursor-default">
          <div className="flex items-center gap-2.5">
            {/* Avatar with emerald ring */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #0d9488)',
                  padding: '2px',
                  borderRadius: '0.625rem',
                  margin: '-2px',
                }}
              />
              <img
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'FE')}&backgroundColor=059669&textColor=ffffff`
                }
                alt={user?.full_name || 'User'}
                className="relative w-8 h-8 rounded-lg object-cover border-2 border-slate-900"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {user?.full_name || 'Farm User'}
              </div>
              <div className="text-[10px] font-semibold text-emerald-400 capitalize mt-0.5">
                {user?.role || 'farmer'}
              </div>
            </div>

            {/* Stats icon */}
            <BarChart2 className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-emerald-400 transition-colors" />
          </div>

          {/* Logout button */}
          <button
            onClick={() => logout?.()}
            className="mt-3 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all duration-200 group/btn"
            aria-label="Sign out"
          >
            <LogOut className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};
