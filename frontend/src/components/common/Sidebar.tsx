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
      { to: '/dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
      { to: '/qr-scanner', label: 'QR Scanner',        icon: ScanLine,      badge: 'Scan', badgeColor: 'green' },
      { to: '/cattle',     label: 'Cattle',            icon: Beef },
      { to: '/milk',       label: 'Milk Records',      icon: Milk },
      { to: '/health',     label: 'Health & Vet',      icon: Stethoscope,   badge: '1', badgeColor: 'rose' },
      { to: '/breeding',   label: 'Breeding',          icon: Heart },
      { to: '/calendar',   label: 'Farm Calendar',     icon: CalendarIcon },
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
  green:  'bg-[var(--accent-green-subtle)] text-[var(--accent-green-dark)] border border-[var(--accent-green)]/25',
  rose:   'bg-[var(--accent-rose-subtle)]  text-[var(--accent-rose)]  border border-[var(--accent-rose)]/25',
  sky:    'bg-[var(--accent-sky-subtle)]   text-[var(--accent-sky)]   border border-[var(--accent-sky)]/25',
  amber:  'bg-[var(--accent-amber-subtle)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/25',
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <aside
      className="sidebar-base h-screen flex flex-col z-40 shrink-0 select-none"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-[var(--border-card)] shrink-0">
        <div className="flex items-center gap-3">
          {/* Animated logo mark */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #0d9488, #38bdf8)',
              backgroundSize: '200% 200%',
              animation: 'aurora-border 6s ease infinite, glow-pulse 3s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.45)',
            }}
          >
            <Leaf className="text-white" strokeWidth={2.5} style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <div className="font-black text-[var(--text-primary)] text-sm leading-none tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              FarmEase
            </div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase mt-0.5" style={{
              background: 'linear-gradient(90deg, var(--accent-green), var(--accent-teal))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smart Farm
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
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
                <span className="section-label text-[10px]">{group.label}</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--border-card), transparent)' }} />
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
                      className={`nav-item group ${active ? 'active' : ''}`}
                      style={active ? {
                        background: 'linear-gradient(135deg, var(--accent-green-subtle), rgba(22, 62, 43, 0.08))',
                        borderLeft: '3px solid #163E2B',
                        paddingLeft: 'calc(0.75rem - 3px)',
                      } : {}}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                            active
                              ? 'text-white'
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] group-hover:text-[#163E2B]'
                          }`}
                          style={active ? {
                            background: '#163E2B',
                            boxShadow: '0 2px 8px rgba(22, 62, 43, 0.3)',
                          } : {}}
                        >
                          <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.5 : 2} />
                        </div>
                        <span className="truncate text-[0.8125rem]">{item.label}</span>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${badgeStyles[item.badgeColor || 'green']}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Active chevron */}
                      {active && !item.badge && (
                        <ChevronRight className="w-3 h-3 text-[var(--accent-green)] shrink-0 opacity-60" />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* ── User Footer — glassmorphism ── */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--border-card)] shrink-0">
        <div
          className="p-3.5 rounded-xl transition-all duration-200 hover:shadow-[var(--shadow-sm)] group cursor-default"
          style={{
            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-card))',
            border: '1px solid var(--border-card)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))',
                  padding: '2px',
                  borderRadius: '0.625rem',
                  margin: '-2px',
                }}
              />
              <img
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'FE')}&backgroundColor=16a34a&textColor=ffffff`
                }
                alt={user?.full_name || 'User'}
                className="relative w-8 h-8 rounded-lg object-cover"
                style={{ border: '2px solid var(--bg-card)' }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate leading-tight">
                {user?.full_name || 'Farm User'}
              </div>
              <div
                className="text-[10px] font-semibold capitalize mt-0.5"
                style={{
                  background: 'linear-gradient(90deg, var(--accent-green), var(--accent-teal))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {user?.role || 'farmer'}
              </div>
            </div>

            {/* Stats icon */}
            <BarChart2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 group-hover:text-[var(--accent-green)] transition-colors" />
          </div>

          {/* Logout button */}
          <button
            onClick={() => logout?.()}
            className="mt-3 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent-rose)] hover:bg-[var(--accent-rose-subtle)] transition-all duration-200 group/btn"
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
