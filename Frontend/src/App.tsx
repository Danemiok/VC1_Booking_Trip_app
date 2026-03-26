import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { AppRoutes } from './routes/AppRoutes';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AppContent = () => {
  const [view, setView] = useState('landing');
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [hotelBrowseDestination, setHotelBrowseDestination] = useState<any | null>(null);
  const [hotelBackView, setHotelBackView] = useState('landing');
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const isAdminUser = user?.role === 'admin';
  const isOwnerUser = user?.role === 'owner';
  
  // Initialize real-time dates
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  const startDateString = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const endDateString = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dateRangeString = `${startDateString} - ${endDateString}`;

  const [tripData, setTripData] = useState({
    title: "Adventure in Siem Reap",
    emoji: "KH",
    dates: dateRangeString,
    guests: "2 Adults",
    reference: "#TP-48291",
    destination: {
      id: null,
      name: "Siem Reap",
      location: "Siem Reap, Cambodia",
      description: "Discover Siem Reap at your own pace.",
      image: "https://images.unsplash.com/photo-1617405134513-384e2312d8f4?auto=format&fit=crop&q=80&w=1200",
      type: "destination",
      latitude: 13.367097,
      longitude: 103.84478
    },
    hotel: {
      name: "Raffles Grand Hotel d'Angkor",
      location: "1 Vithei Charles de Gaulle, Siem Reap, Cambodia",
      roomType: "Landmark Garden View Room",
      guests: "2 Adults",
      dailyPrice: 350.00,
      price: 0.00,
      nights: 7,
      status: "Not booked",
      isBooked: false,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    rental: {
      name: "Lexus LX570 SUV",
      pickup: "Siem Reap Angkor International (SAI)",
      features: "Automatic - Premium Interior",
      dailyPrice: 80.00,
      price: 0.00,
      days: 7,
      status: "Not booked",
      isBooked: false,
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800"
    }
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Booking Confirmed", message: "Your stay at Raffles Grand Hotel is confirmed for Oct 12.", time: "2h ago", type: "booking", read: false },
    { id: 2, title: "New Message", message: "Owner of Paradise Beach Resort sent you a message.", time: "5h ago", type: "message", read: false },
    { id: 3, title: "Price Drop", message: "Koh Rong ferry prices just dropped by 15%!", time: "1d ago", type: "alert", read: true },
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const openHotels = React.useCallback((originView?: string) => {
    setHotelBrowseDestination(null);
    setHotelBackView(originView || 'landing');
    setView('hotels');
  }, []);

  const handleSelectRecommendation = (item: any) => {
    if (item.type === 'hotel') {
      setSelectedHotel(item);
      setHotelBackView(view === 'hotels' ? hotelBackView : view);
      setView('hotel-details');
    } else {
      setSelectedRecommendation(item);
    }
  };

  const handleSelectDestination = (dest: any) => {
    if (dest.type === 'hotel') {
      setSelectedHotel(dest);
      setHotelBackView(view === 'hotels' ? hotelBackView : view);
      setView('hotel-details');
    } else {
      setSelectedDestination(dest);
      setHotelBrowseDestination(dest);
      setHotelBackView(view);
      setTripData((prev) => ({
        ...prev,
        title: `Adventure in ${dest?.name || prev?.destination?.name || 'Cambodia'}`,
        destination: {
          ...(prev?.destination || {}),
          id: dest?.id ?? prev?.destination?.id,
          name: String(dest?.name || prev?.destination?.name || '').trim(),
          location: String(dest?.location || prev?.destination?.location || '').trim(),
          description: String(dest?.description || prev?.destination?.description || '').trim(),
          image: dest?.image || prev?.destination?.image,
          type: dest?.type || prev?.destination?.type,
          latitude: dest?.latitude ?? dest?.lat ?? prev?.destination?.latitude ?? null,
          longitude: dest?.longitude ?? dest?.lng ?? prev?.destination?.longitude ?? null,
        }
      }));
      setView('hotels');
    }
  };
  const isAuthModalOpen = view === 'login' || view === 'register';
  const mainView = isAuthModalOpen ? 'landing' : view;
  const shouldShowFooter = !isAdminUser && user === null;
  const handleAuthSuccess = (nextView: string) => {
    setView(nextView);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authView = params.get('auth');
    const nextView = params.get('next_view');

    if (nextView) {
      setView(nextView);

      params.delete('next_view');
      params.delete('auth');

      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
      return;
    }

    if (authView === 'login' || authView === 'register') {
      setView(authView);
    }
  }, []);

  const goHome = React.useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setHotelBrowseDestination(null);
    setHotelBackView('landing');
    setView('landing');
  }, [location.pathname, navigate]);

  const openLoginModal = React.useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setView('login');
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      document.body.style.overflow = '';
      return; 
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setView('landing');
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {!isAdminUser && !isOwnerUser && (
        <Navbar
          onLoginClick={openLoginModal}
          user={user}
          onLogout={logout}
          onProfileClick={handleProfileClick}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onHotelsClick={() => openHotels(view)}
          onRentalsClick={() => setView('rentals')}
          onHomeClick={goHome}
          onBookingsClick={() => setView('bookings')}
          onTripPlannerClick={() => setView('trip-planner')}
          onActivitiesClick={() => setView('activities')}
          currentView={view}
        />
      )}

      {isAdminUser ? (
        <AppRoutes
          view={mainView}
          setView={setView}
          onSelectRecommendation={handleSelectRecommendation}
          onSelectDestination={handleSelectDestination}
          onPromotionsClick={() => setView('promotions')}
          onHotelsClick={() => openHotels(view)}
          onRentalsClick={() => setView('rentals')}
          onActivitiesClick={() => setView('activities')}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          activeProfileTab={activeProfileTab}
          selectedHotel={selectedHotel}
          browseDestination={hotelBrowseDestination}
          hotelBackView={hotelBackView}
          setSelectedHotel={setSelectedHotel}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={mainView}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={isOwnerUser ? undefined : "pt-24"}
          >
            <AppRoutes
              view={mainView}
              setView={setView}
              onSelectRecommendation={handleSelectRecommendation}
              onSelectDestination={handleSelectDestination}
              onPromotionsClick={() => setView('promotions')}
              onHotelsClick={() => openHotels(view)}
              onRentalsClick={() => setView('rentals')}
              onActivitiesClick={() => setView('activities')}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              activeProfileTab={activeProfileTab}
              selectedHotel={selectedHotel}
              browseDestination={hotelBrowseDestination}
              hotelBackView={hotelBackView}
              setSelectedHotel={setSelectedHotel}
              selectedActivityIds={selectedActivityIds}
              setSelectedActivityIds={setSelectedActivityIds}
              tripData={tripData}
              setTripData={setTripData}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {shouldShowFooter && <Footer onLoginClick={openLoginModal} user={user} />}

      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[1px]"
            onClick={goHome}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              className="w-full max-w-[1000px]"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'login' ? (
                <Login
                  onSwitchToRegister={() => setView('register')}
                  onBack={goHome}
                  onSuccess={handleAuthSuccess}
                  onClose={goHome}
                />
              ) : (
                <Register
                  onSwitchToLogin={() => setView('login')}
                  onBack={goHome}
                  onSuccess={handleAuthSuccess}
                  onClose={goHome}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const App = () => {
  return (
    <>
        <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      
    </>
  );
};

export default App;
