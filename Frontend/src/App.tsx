import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PATH_TO_TAB, TAB_TO_PATH } from './components/layout/menuBar';
import {
  AuditLogs,
  Bookings,
  Dashboard,
  Destinations,
  Finances,
  AdminProfile,
  OwnerManagement,
  OwnerDetailsPage,
  Settings,
  UserManagement,
  ViewAllApplications,
} from './pages/admin';
import { useTheme } from './theme';
import { AdminNotification } from './components/common/NotificationDropdown';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = React.useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = React.useState<string | null>(null);

  const safeNavigate = React.useCallback((path: string) => {
    if (hasUnsavedProfileChanges && location.pathname === '/profile' && path !== '/profile') {
      setPendingNavigationPath(path);
      return;
    }

    navigate(path);
  }, [hasUnsavedProfileChanges, location.pathname, navigate]);

  const cancelPendingNavigation = () => {
    setPendingNavigationPath(null);
  };

  const confirmPendingNavigation = () => {
    if (!pendingNavigationPath) {
      return;
    }

    setHasUnsavedProfileChanges(false);
    navigate(pendingNavigationPath);
    setPendingNavigationPath(null);
  };

  const activeTab = PATH_TO_TAB[location.pathname] ?? 'dashboard';

  const setActiveTab = (tab: string) => {
    const path = TAB_TO_PATH[tab];
    if (path) {
      safeNavigate(path);
    }
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    if (notification.id === '1') {
      safeNavigate('/owners/details');
    }
  };

  const openAdminProfile = () => {
    safeNavigate('/profile');
  };

  const getTitle = () => {
    if (location.pathname === '/owners/applications') {
      return 'Owner Applications';
    }
    if (location.pathname === '/owners/details') {
      return 'Owner Details';
    }

    switch (activeTab) {
      case 'dashboard': return 'Executive Overview';
      case 'users': return 'User Management';
      case 'owners': return 'Owners Management';
      case 'destinations': return 'Destinations Management';
      case 'bookings': return 'Bookings Management';
      case 'finances': return 'Finances Management';
      case 'logs': return 'System Audit Logs';
      case 'settings': return 'System Settings';
      case 'profile': return 'Admin Profile';
      case 'ownerRequestDetail': return 'Owner Request Detail';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onProfileClick={openAdminProfile} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getTitle()}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNotificationClick={handleNotificationClick}
          onProfileClick={openAdminProfile}
        />
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      onOpenTotalUsersDetails={() => safeNavigate('/users')}
                      onOpenTotalOwnersDetails={() => safeNavigate('/owners')}
                      onOpenTotalBookingsDetails={() => safeNavigate('/bookings')}
                      onOpenSystemIncomeDetails={() => safeNavigate('/finances')}
                      onOpenOwnerApplicationsDetails={() => safeNavigate('/owners/applications')}
                    />
                  }
                />
                <Route path="/users" element={<UserManagement />} />
                <Route
                  path="/owners"
                  element={
                    <OwnerManagement
                      onViewAllApplications={() => safeNavigate('/owners/applications')}
                      onViewOwnerDetails={() => safeNavigate('/owners/details')}
                    />
                  }
                />
                <Route path="/owners/applications" element={<ViewAllApplications onBack={() => safeNavigate('/owners')} onViewDetails={() => safeNavigate('/owners/details')} />} />
                <Route path="/owners/details" element={<OwnerDetailsPage onBack={() => safeNavigate('/owners')} />} />
                <Route path="/owners/request-detail" element={<OwnerDetailsPage onBack={() => safeNavigate('/owners')} />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/logs" element={<AuditLogs />} />
                <Route path="/profile" element={<AdminProfile onDirtyChange={setHasUnsavedProfileChanges} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {pendingNavigationPath && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40" onClick={cancelPendingNavigation} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unsaved Changes</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                You have unsaved profile changes. If you leave this page now, your edits will be lost.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={cancelPendingNavigation}
                  className="h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPendingNavigation}
                  className="h-10 px-4 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
