import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VesselsPage from './pages/VesselsPage';
import BookingsPage from './pages/BookingsPage';
import UsersPage from './pages/UsersPage';
import BlockedDatesPage from './pages/BlockedDatesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import FinancialPage from './pages/FinancialPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import MyFinancialsPage from './pages/MyFinancialsPage';
import FinancialHistoryPage from './pages/FinancialHistoryPage';
import WeeklyBlocksPage from './pages/WeeklyBlocksPage';
import TwoFactorPage from './pages/TwoFactorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FinancialPriorityPage from './pages/FinancialPriorityPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import AppLayout from './components/layout/AppLayout';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="vessels" element={<VesselsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="my-financials" element={<MyFinancialsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />

            {/* Admin Only Routes */}
            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="blocked-dates"
              element={
                <ProtectedRoute adminOnly>
                  <BlockedDatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute adminOnly>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="financial"
              element={
                <ProtectedRoute adminOnly>
                  <FinancialPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notification-management"
              element={
                <ProtectedRoute adminOnly>
                  <NotificationManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="subscription-plans"
              element={
                <ProtectedRoute adminOnly>
                  <SubscriptionPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="financial-history/:userVesselId"
              element={
                <ProtectedRoute adminOnly>
                  <FinancialHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="weekly-blocks"
              element={
                <ProtectedRoute adminOnly>
                  <WeeklyBlocksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="two-factor"
              element={
                <ProtectedRoute>
                  <TwoFactorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="financial-priority"
              element={
                <ProtectedRoute adminOnly>
                  <FinancialPriorityPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;

