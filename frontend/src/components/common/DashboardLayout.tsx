import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileSidebarOpen]);

  return (
    <div
      className="min-h-screen flex text-[var(--text-primary)] transition-colors duration-300"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Subtle ambient decoration (light mode appropriate) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-48 w-[480px] h-[480px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-16 w-[360px] h-[360px] bg-sky-500/[0.04] dark:bg-sky-500/[0.06] rounded-full blur-[100px]" />
      </div>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex md:shrink-0 relative z-40">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar drawer */}
            <motion.div
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar
                isMobile
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)} />

        <main className="flex-1 p-4 sm:p-5 lg:p-7 max-w-[1600px] w-full mx-auto has-bottom-nav md:pb-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <MobileBottomNav />
    </div>
  );
};
