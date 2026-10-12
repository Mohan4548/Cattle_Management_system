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
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
  rose:   'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
  sky:    'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60',
  amber:  'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <aside
      className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col z-40 shrink-0 select-none shadow-xs"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Enterprise Brand Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Refined enterprise logo */}
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Leaf className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
              FarmEase
            </div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">
              Enterprise Livestock
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation Groups ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => {
          const visible = group.items.filter(
            (item) => !item.roleRequired || user?.role === item.roleRequired
          );
          if (!visible.length) return null;

          return (
            <div key={group.label}>
              {/* Group label */}
              <div className="px-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {group.label}
                </span>
              </div>

              {/* Items */}
              <nav className="space-y-0.5">
                {visible.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                          strokeWidth={active ? 2.4 : 1.9}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${badgeStyles[item.badgeColor || 'green']}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator dot */}
                      {active && !item.badge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* ── User Footer — Professional clean account panel ── */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            {/* Clean avatar */}
            <img
              src={
                user?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'FE')}&backgroundColor=047857&textColor=ffffff`
              }
              alt={user?.full_name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.full_name || 'Farm User'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                {user?.role || 'Operator'}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={() => logout?.()}
              title="Sign out"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
