import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { AdminNotification } from '../components/common/NotificationDropdown';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import VisitorHome from '../pages/public/VisitorHome';
import CustomerDashboard from '../pages/customer/Dashboard';
import Destinations from '../pages/customer/Destinations';
import TripPlanner from '../pages/customer/TripPlanner';
import BookingHistory from '../pages/customer/BookingHistory';
import GroupInvite from '../pages/customer/GroupInvite';
import Payment from '../pages/customer/Payment';
import OwnerDashboard from '../pages/owner/Dashboard';
import OwnerDestinations from '../pages/owner/Destinations';
import OwnerTransport from '../pages/owner/Transport';
import OwnerBookings from '../pages/owner/Bookings';
import OwnerMessages from '../pages/owner/Messages';
import OwnerPromotions from '../pages/owner/Promotions';
import OwnerCreatePromotion from '../pages/owner/CreatePromotion';
import OwnerAnalytics from '../pages/owner/Analytics';
import OwnerFinancials from '../pages/owner/Financials';
import OwnerSettings from '../pages/owner/Settings';
import OwnerRegisterVehicle from '../pages/owner/RegisterVehicle';
import OwnerPropertyDetail from '../pages/owner/PropertyDetail';
import OwnerAddRoom from '../pages/owner/AddRoom';
import OwnerAddProperty from '../pages/owner/AddProperty';
import OwnerEditProperty from '../pages/owner/EditProperty';
import { useLocation } from 'react-router-dom';
import OwnerSidebar from '../components/layout/owner/Sidebar';
import {
  Dashboard as AdminDashboard,
  UserManagement,
  OwnerManagement,
  OwnerDetailsPage,
  ViewAllApplications,
  OwnerApplicationDetails,
  Destinations as AdminDestinations,
  Bookings as AdminBookings,
  Finances,
  AuditLogs,
  Settings,
  AdminProfile,
} from '../pages/admin';

interface AppRoutesProps {
  view: string;
  setView: (view: string) => void;
  onSelectRecommendation: (item: any) => void;
  onSelectDestination: (dest: any) => void;
  onPromotionsClick: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onActivitiesClick: () => void;
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  activeProfileTab: any;
  selectedHotel: any | null;
  setSelectedHotel: (hotel: any | null) => void;
  selectedActivityIds: number[];
  setSelectedActivityIds: (ids: number[]) => void;
  tripData: any;
  setTripData: (data: any) => void;
}

type AdminView =
  | 'dashboard'
  | 'users'
  | 'owners'
  | 'owners-applications'
  | 'owners-applications-details'
  | 'owners-details'
  | 'destinations'
  | 'bookings'
  | 'finances'
  | 'logs'
  | 'settings'
  | 'profile';

const normalizeAdminView = (view: string): AdminView => {
  switch (view) {
    case 'users':
    case 'owners':
    case 'owners-applications':
    case 'owners-applications-details':
    case 'owners-details':
    case 'destinations':
    case 'bookings':
    case 'finances':
    case 'logs':
    case 'settings':
    case 'profile':
      return view;
    case 'admin-dashboard':
    case 'landing':
    default:
      return 'dashboard';
  }
};

const getOwnerTitle = (pathname: string): string => {
  if (pathname.startsWith('/transport')) return 'Transport';
  if (pathname.startsWith('/bookings')) return 'Bookings';
  if (pathname.startsWith('/messages')) return 'Messages';
  if (pathname.startsWith('/promotions')) return 'Promotions';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/financials')) return 'Financials';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/destinations')) return 'Destinations';
  return 'Overview Dashboard';
};

const OwnerShell: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const renderOwnerPage = () => {
    const path = location.pathname;

    if (path === '/' || path === '/owner') return <OwnerDashboard />;
    if (path.startsWith('/destinations') && path.includes('/add-room')) return <OwnerAddRoom />;
    if (path.startsWith('/destinations') && path.includes('/edit')) return <OwnerEditProperty />;
    if (path.startsWith('/destinations') && path.includes('/new')) return <OwnerAddProperty />;
    if (path.startsWith('/destinations') && path !== '/destinations') return <OwnerPropertyDetail />;
    if (path.startsWith('/destinations')) return <OwnerDestinations />;

    if (path.startsWith('/transport/new')) return <OwnerRegisterVehicle />;
    if (path.startsWith('/transport')) return <OwnerTransport />;
    if (path.startsWith('/bookings')) return <OwnerBookings />;
    if (path.startsWith('/messages')) return <OwnerMessages />;
    if (path.startsWith('/promotions/new')) return <OwnerCreatePromotion />;
    if (path.startsWith('/promotions')) return <OwnerPromotions />;
    if (path.startsWith('/analytics')) return <OwnerAnalytics />;
    if (path.startsWith('/financials')) return <OwnerFinancials />;
    if (path.startsWith('/settings')) return <OwnerSettings />;

    return <OwnerDashboard />;
  };

  const title = getOwnerTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200">
      <OwnerSidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header
          title={title}
          isDark={isDarkMode}
          toggleTheme={toggleDarkMode}
          onNotificationClick={() => {}}
          onProfileClick={() => {}}
          onLogoutClick={onLogout}
          user={user}
        />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {renderOwnerPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const getAdminTitle = (view: AdminView): string => {
  switch (view) {
    case 'dashboard':
      return 'Executive Overview';
    case 'users':
      return 'User Management';
    case 'owners':
      return 'Owners Management';
    case 'owners-applications':
      return 'Owner Applications';
    case 'owners-applications-details':
      return 'Owner Application Details';
    case 'owners-details':
      return 'Owner Details';
    case 'destinations':
      return 'Destinations Management';
    case 'bookings':
      return 'Bookings Management';
    case 'finances':
      return 'Finances Management';
    case 'logs':
      return 'System Audit Logs';
    case 'settings':
      return 'System Settings';
    case 'profile':
      return 'Admin Profile';
    default:
      return 'Executive Overview';
  }
};

const AdminShell: React.FC<{ view: string; setView: (view: string) => void; onLogout: () => void }> = ({
  view,
  setView,
  onLogout,
}) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const normalizedView = normalizeAdminView(view);
  const activeTab = normalizedView.startsWith('owners') ? 'owners' : normalizedView;
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = React.useState(false);
  const [pendingNavigationView, setPendingNavigationView] = React.useState<string | null>(null);

  const safeSetView = React.useCallback(
    (nextView: string) => {
      if (hasUnsavedProfileChanges && normalizedView === 'profile' && nextView !== 'profile') {
        setPendingNavigationView(nextView);
        return;
      }
      setView(nextView);
    },
    [hasUnsavedProfileChanges, normalizedView, setView],
  );

  const cancelPendingNavigation = () => setPendingNavigationView(null);
  const confirmPendingNavigation = () => {
    if (!pendingNavigationView) return;
    setHasUnsavedProfileChanges(false);
    setView(pendingNavigationView);
    setPendingNavigationView(null);
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    if (notification.id === '1') {
      safeSetView('owners-details');
    }
  };

  const renderAdminPage = () => {
    switch (normalizedView) {
      case 'dashboard':
        return (
          <AdminDashboard
            onOpenTotalUsersDetails={() => safeSetView('users')}
            onOpenTotalOwnersDetails={() => safeSetView('owners')}
            onOpenTotalBookingsDetails={() => safeSetView('bookings')}
            onOpenSystemIncomeDetails={() => safeSetView('finances')}
            onOpenOwnerApplicationsDetails={() => safeSetView('owners-applications')}
          />
        );
      case 'users':
        return <UserManagement />;
      case 'owners':
        return (
          <OwnerManagement
            onViewAllApplications={() => safeSetView('owners-applications')}
            onViewOwnerDetails={() => safeSetView('owners-details')}
          />
        );
      case 'owners-applications':
        return (
          <ViewAllApplications
            onBack={() => safeSetView('owners')}
            onViewDetails={() => safeSetView('owners-applications-details')}
          />
        );
      case 'owners-applications-details':
        return <OwnerApplicationDetails onBack={() => safeSetView('owners-applications')} />;
      case 'owners-details':
        return <OwnerDetailsPage onBack={() => safeSetView('owners')} />;
      case 'destinations':
        return <AdminDestinations />;
      case 'bookings':
        return <AdminBookings />;
      case 'finances':
        return <Finances />;
      case 'logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <AdminProfile onDirtyChange={setHasUnsavedProfileChanges} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => safeSetView(tab)}
        onProfileClick={() => safeSetView('profile')}
        onLogout={onLogout}
        user={user}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getAdminTitle(normalizedView)}
          isDark={isDarkMode}
          toggleTheme={toggleDarkMode}
          onNotificationClick={handleNotificationClick}
          onProfileClick={() => safeSetView('profile')}
          onLogoutClick={onLogout}
          user={user}
        />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={normalizedView}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {renderAdminPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {pendingNavigationView && (
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
};

export const AppRoutes: React.FC<AppRoutesProps> = ({ view, setView }) => {
  const { user, logout } = useAuth();

  if (user?.role === 'admin') {
    return <AdminShell view={view} setView={setView} onLogout={logout} />;
  }

  if (user?.role === 'owner') {
    return <OwnerShell onLogout={logout} />;
  }

  switch (view) {
    case 'login':
      return (
        <Login
          onSwitchToRegister={() => setView('register')}
          onBack={() => setView('landing')}
          onSuccess={(nextView) => setView(nextView)}
        />
      );
    case 'register':
      return (
        <Register
          onSwitchToLogin={() => setView('login')}
          onBack={() => setView('landing')}
          onSuccess={(nextView) => setView(nextView)}
        />
      );
    case 'hotels':
    case 'destinations':
    case 'hotel-details':
      return <Destinations />;
    case 'rentals':
    case 'activities':
    case 'promotions':
    case 'trip-planner':
    case 'group-planning':
      return <TripPlanner />;
    case 'bookings':
      return <BookingHistory />;
    case 'group-invite':
      return <GroupInvite />;
    case 'payment':
      return <Payment />;
    case 'customer-dashboard':
      return user ? <CustomerDashboard /> : <VisitorHome />;
    case 'landing':
    default:
      if (!user) return <VisitorHome />;
      return <CustomerDashboard />;
  }
};
