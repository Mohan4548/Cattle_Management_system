import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Beef, ScanLine, CheckSquare, User } from 'lucide-react';

interface BottomNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: BottomNavItem[] = [
  { to: '/dashboard', label: 'Home',   icon: LayoutDashboard },
  { to: '/cattle',    label: 'Cattle', icon: Beef },
  // QR center button is rendered separately
  { to: '/tasks',     label: 'Tasks',  icon: CheckSquare },
  { to: '/settings',  label: 'Profile', icon: User },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <nav className="bottom-nav md:hidden" role="navigation" aria-label="Mobile navigation">
      {/* Home */}
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={active ? 2.5 : 1.75}
            />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {/* QR Center Button */}
      <NavLink
        to="/qr-scanner"
        className="bottom-nav-qr"
        aria-label="QR Scanner"
      >
        <div className="bottom-nav-qr-btn" aria-hidden="true">
          <ScanLine className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <span className="bottom-nav-qr-label">Scan</span>
      </NavLink>

      {/* Tasks & Profile */}
      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={active ? 2.5 : 1.75}
            />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
