import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bell,
  QrCode,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Settings,
  LogOut,
  User,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const PAGE_TITLES: Record<string, { title: string; crumb: string }> = {
  '/dashboard':  { title: 'Dashboard',          crumb: 'Dashboard' },
  '/cattle':     { title: 'Cattle',             crumb: 'Cattle' },
  '/milk':       { title: 'Milk Records',       crumb: 'Milk Records' },
  '/health':     { title: 'Health & Vet',       crumb: 'Health' },
  '/breeding':   { title: 'Breeding',           crumb: 'Breeding' },
  '/inventory':  { title: 'Feed & Inventory',   crumb: 'Inventory' },
  '/financials': { title: 'Finance',            crumb: 'Finance' },
  '/purchases':  { title: 'Purchase Registry',  crumb: 'Purchases' },
  '/tasks':      { title: 'Tasks',              crumb: 'Tasks' },
  '/calendar':   { title: 'Farm Calendar',      crumb: 'Calendar' },
  '/users':      { title: 'Users',              crumb: 'Users' },
  '/settings':   { title: 'Settings',           crumb: 'Settings' },
  '/qr-scanner': { title: 'QR Scanner',         crumb: 'QR Scanner' },
};

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Emergency Visit Needed',
    desc: 'Lakshmi (FE-103) — Mastitis check requested.',
    time: '10m ago',
    type: 'urgent' as const,
    read: false,
  },
  {
    id: '2',
    title: 'Milk Logged Today',
    desc: 'Morning yield: 38.5 L recorded.',
    time: '1h ago',
    type: 'success' as const,
    read: false,
  },
  {
    id: '3',
    title: 'Vaccination Due Tomorrow',
    desc: 'Anthrax booster for Veera (Hallikar).',
    time: '3h ago',
    type: 'warning' as const,
    read: true,
  },
];

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]     = useState('');
  const [isListening, setIsListening]     = useState(false);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [isNotifOpen, setIsNotifOpen]     = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pageInfo = Object.entries(PAGE_TITLES).find(
    ([path]) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
  )?.[1];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Network detection
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Voice search
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice Search requires Chrome or Edge browser.');
      return;
    }
    if (isListening) { setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart  = () => setIsListening(true);
    recognition.onresult = (e: any) => { setSearchQuery(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror  = () => setIsListening(false);
    recognition.onend    = () => setIsListening(false);
    recognition.start();
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const notifIcon = {
    urgent:  <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-rose)]" />,
    success: <CheckCircle2  className="w-3.5 h-3.5 text-[var(--accent-green)]" />,
    warning: <Info          className="w-3.5 h-3.5 text-[var(--accent-amber)]" />,
  };

  const notifBg = {
    urgent:  'bg-[var(--accent-rose-subtle)]  border-[var(--accent-rose)]/20',
    success: 'bg-[var(--accent-green-subtle)] border-[var(--accent-green)]/20',
    warning: 'bg-[var(--accent-amber-subtle)] border-[var(--accent-amber)]/20',
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 gap-3"
      style={{
        height: 'var(--navbar-height)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-card)',
        boxShadow: '0 1px 0 rgba(34,197,94,0.06), 0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Left: Hamburger + Breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden btn-icon shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        {pageInfo && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="hidden sm:block text-xs text-[var(--text-muted)] font-medium shrink-0">
              FarmEase
            </span>
            <ChevronRight className="hidden sm:block w-3 h-3 text-[var(--text-muted)] shrink-0" />
            <h1 className="text-sm font-bold text-[var(--text-primary)] truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {pageInfo.title}
            </h1>
          </div>
        )}
      </div>

      {/* ── Center: Search ── */}
      <div className="relative flex-1 max-w-xs hidden md:block">
        <div
          className="relative flex items-center rounded-xl transition-all duration-200"
          style={{
            background: 'var(--bg-input)',
            border: `1.5px solid ${isListening ? 'var(--accent-green)' : 'var(--border-base)'}`,
            boxShadow: isListening ? '0 0 0 3px var(--accent-green-glow)' : undefined,
          }}
        >
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isListening ? 'Listening…' : 'Search cattle, logs…'}
            className="w-full py-2 pl-8 pr-9 bg-transparent text-[13px] font-normal text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${
              isListening ? 'text-[var(--accent-rose)] animate-pulse' : 'text-[var(--text-muted)] hover:text-[var(--accent-green)]'
            }`}
            title="Voice search"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5">

        {/* Online status indicator */}
        <div className={`
          hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300
          ${isOnline
            ? 'bg-[var(--accent-green-subtle)] text-[var(--accent-green-dark)] border-[var(--accent-green)]/22'
            : 'bg-[var(--accent-rose-subtle)]  text-[var(--accent-rose)]  border-[var(--accent-rose)]/22 animate-pulse'
          }
        `}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* QR Scanner shortcut */}
        <button
          onClick={() => navigate('/qr-scanner')}
          title="Open QR Scanner"
          className="btn-icon"
          style={{ color: 'var(--accent-green)', borderColor: 'rgba(21,163,74,0.3)', background: 'var(--accent-green-subtle)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-green)';
            (e.currentTarget as HTMLElement).style.color = 'white';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-green)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-green)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-green-subtle)';
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-green)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(21,163,74,0.3)';
            (e.currentTarget as HTMLElement).style.boxShadow = '';
          }}
          aria-label="QR Scanner"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Role switcher */}
        <div className="relative hidden sm:block">
          <select
            value={user?.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="py-1.5 pl-2.5 pr-6 text-[11px] rounded-lg font-semibold cursor-pointer bg-[var(--bg-tertiary)] border border-[var(--border-base)] text-[var(--text-secondary)] focus:outline-none appearance-none hover:border-[var(--border-strong)] transition-colors"
          >
            <option value="admin">Admin</option>
            <option value="farmer">Farmer</option>
            <option value="veterinarian">Veterinarian</option>
            <option value="worker">Worker</option>
          </select>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="btn-icon"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4 text-[var(--accent-amber)]" />
            : <Moon className="w-4 h-4 text-[var(--accent-violet)]" />
          }
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="btn-icon relative"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] font-black flex items-center justify-center ring-2 ring-[var(--bg-primary)]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-rose), #be123c)',
                  animation: 'notif-pulse 2s ease-in-out infinite',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isNotifOpen && (
            <div
              className="absolute right-0 top-12 w-80 card-premium z-50 overflow-hidden"
              style={{ animation: 'slide-up 0.22s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-card)]"
                style={{ background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-card))' }}>
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge-pill badge-rose">{unreadCount} new</span>
                  )}
                </div>
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold transition-colors hover:opacity-80"
                  style={{ color: 'var(--accent-green)' }}
                >
                  Mark all read
                </button>
              </div>

              {/* Notification list */}
              <div className="divide-y divide-[var(--border-card)] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? 'notif-read' : 'notif-unread'}`}
                  >
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${notifBg[n.type]}`}>
                      {notifIcon[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">{n.title}</p>
                        <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap mt-0.5">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel footer */}
              <div className="px-4 py-2.5 border-t border-[var(--border-card)]"
                style={{ background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-card))' }}>
                <button className="text-[11px] font-semibold w-full text-center transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-green)]">
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative pl-2 border-l border-[var(--border-card)]">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
            aria-label="User profile"
          >
            {/* Avatar with gradient ring */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))',
                  margin: '-2px',
                  borderRadius: '0.55rem',
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
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-[var(--text-primary)] leading-none truncate max-w-[7rem]">
                {user?.full_name}
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
                {user?.role}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] hidden md:block" />
          </button>

          {/* Profile Panel */}
          {isProfileOpen && (
            <div
              className="absolute right-0 top-12 w-52 card-premium z-50 overflow-hidden"
              style={{ animation: 'slide-up 0.22s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
              {/* Profile header with gradient */}
              <div
                className="px-4 py-4 border-b border-[var(--border-card)]"
                style={{ background: 'linear-gradient(135deg, var(--accent-green-subtle), var(--bg-card))' }}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      user?.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'FE')}&backgroundColor=16a34a&textColor=ffffff`
                    }
                    alt={user?.full_name || 'User'}
                    className="w-9 h-9 rounded-lg object-cover"
                    style={{ border: '2px solid var(--accent-green)', boxShadow: '0 0 10px var(--accent-green-glow)' }}
                  />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{user?.full_name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate max-w-[120px]">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 group">
                  <User className="w-3.5 h-3.5 group-hover:text-[var(--accent-green)] transition-colors" />
                  My Profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 group"
                >
                  <Settings className="w-3.5 h-3.5 group-hover:text-[var(--accent-green)] transition-colors" />
                  Settings
                </button>
                <div className="border-t border-[var(--border-card)] my-1" />
                <button
                  onClick={() => logout?.()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--accent-rose)] hover:bg-[var(--accent-rose-subtle)] transition-all duration-200 group"
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
