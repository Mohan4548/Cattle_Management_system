import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/common/DashboardLayout';

// Public Marketing & Informational Pages
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Protected SaaS App Pages
import { Dashboard } from './pages/Dashboard';
import { AIInsights } from './pages/AIInsights';
import { HerdDirectory } from './pages/HerdDirectory';
import { CattleProfile } from './pages/CattleProfile';
import { MilkYield } from './pages/MilkYield';
import { HealthCare } from './pages/HealthCare';
import { BreedingTracker } from './pages/BreedingTracker';
import { Inventory } from './pages/Inventory';
import { Financials } from './pages/Financials';
import { TaskBoard } from './pages/TaskBoard';
import { FarmCalendar } from './pages/FarmCalendar';
import { UsersAdmin } from './pages/UsersAdmin';
import { Settings } from './pages/Settings';
import { Purchases } from './pages/Purchases';
import { NotFound } from './pages/NotFound';
import { QRScannerPage } from './pages/QRScannerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Marketing & Informational Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />

                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected SaaS App Routes with Layout */}
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/dashboard"
                      element={
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/ai-insights"
                      element={
                        <DashboardLayout>
                          <AIInsights />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/cattle"
                      element={
                        <DashboardLayout>
                          <HerdDirectory />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/cattle/:id"
                      element={
                        <DashboardLayout>
                          <CattleProfile />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/milk"
                      element={
                        <DashboardLayout>
                          <MilkYield />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/health"
                      element={
                        <DashboardLayout>
                          <HealthCare />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/breeding"
                      element={
                        <DashboardLayout>
                          <BreedingTracker />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <DashboardLayout>
                          <Inventory />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/financials"
                      element={
                        <DashboardLayout>
                          <Financials />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/purchases"
                      element={
                        <DashboardLayout>
                          <Purchases />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <DashboardLayout>
                          <TaskBoard />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <DashboardLayout>
                          <FarmCalendar />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <DashboardLayout>
                          <UsersAdmin />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/qr-scanner"
                      element={
                        <DashboardLayout>
                          <QRScannerPage />
                        </DashboardLayout>
                      }
                    />
                  </Route>

                  {/* Fallback & 404 */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
