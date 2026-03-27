import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DestinationModal } from './components/common/DestinationModal';
import { RecommendationModal } from './components/common/RecommendationModal';
import { HelpCenterLayout } from './components/layout/HelpCenterLayout';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const resolveInitialView = (): string => {
  if (typeof window === 'undefined') return 'landing';

  const params = new URLSearchParams(window.location.search);
  const nextView = params.get('next_view')?.trim();
  if (nextView) return nextView;

  const authTab = params.get('auth');
  if (authTab === 'login' || authTab === 'register') return authTab;

  return 'landing';
};

const AppContent = () => {
  const [view, setView] = useState<string>(() => resolveInitialView());
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();
  const previousUserRef = useRef(user);

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
    title: 'Adventure in Siem Reap',
    emoji: 'KH',
    dates: dateRangeString,
    startDate,
    endDate,
    guests: '2 Adults',
    reference: '#TP-48291',
    destination: {
      id: null,
      name: 'Siem Reap',
      location: 'Siem Reap, Cambodia',
      description: 'Discover Siem Reap at your own pace.',
      image: 'https://images.unsplash.com/photo-1617405134513-384e2312d8f4?auto=format&fit=crop&q=80&w=1200',
      type: 'destination',
      latitude: 13.367097,
      longitude: 103.84478,
    },
    hotel: {
      name: "Raffles Grand Hotel d'Angkor",
      location: '1 Vithei Charles de Gaulle, Siem Reap, Cambodia',
      roomType: 'Landmark Garden View Room',
      guests: '2 Adults',
      dailyPrice: 350.0,
      price: 0.0,
      nights: 7,
      status: 'Not booked',
      isBooked: false,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    },
    rental: {
      name: 'Lexus LX570 SUV',
      pickup: 'Siem Reap Angkor International (SAI)',
      features: 'Automatic - Premium Interior',
      dailyPrice: 80.0,
      price: 0.0,
      days: 7,
      status: 'Not booked',
      isBooked: false,
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
    },
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Booking Confirmed', message: 'Your stay at Raffles Grand Hotel is confirmed for Oct 12.', time: '2h ago', type: 'booking', read: false },
    { id: 2, title: 'New Message', message: 'Owner of Paradise Beach Resort sent you a message.', time: '5h ago', type: 'message', read: false },
    { id: 3, title: 'Price Drop', message: 'Koh Rong ferry prices just dropped by 15%!', time: '1d ago', type: 'alert', read: true },
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        },
      }));
      setView('hotels');
    }
  };

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };

  const handleTripPlannerClick = () => setView('trip-planner');

  const handleTourGuidesClick = () => {
    setView('landing');
    setTimeout(() => {
      const element = document.getElementById('recommended-for-you');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLogout = () => {
    void logout();
    setView('landing');
  };

  // Auto-route users who just logged in to their dashboards
  useEffect(() => {
    if (!user) return;
    if (view !== 'login' && view !== 'register') return;

    const nextView =
      user.role === 'admin'
        ? 'admin-dashboard'
        : user.role === 'owner'
        ? 'owner-dashboard'
        : 'customer-dashboard';
    setView(nextView);
  }, [user, view]);

  // Handle logout view reset
  useEffect(() => {
    if (previousUserRef.current && !user) {
      setSelectedRecommendation(null);
      setSelectedDestination(null);
      setSelectedHotel(null);
      setView('landing');
    }
    previousUserRef.current = user;
  }, [user]);

  // Scroll to top whenever the view changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const showCustomerChrome = !isAdminUser && !isOwnerUser;

  return (
    <HelpCenterLayout>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        {showCustomerChrome && (
          <Navbar
            onLoginClick={() => setView('login')}
            user={user}
            onLogout={handleLogout}
            onProfileClick={handleProfileClick}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onHotelsClick={() => openHotels(view)}
            onRentalsClick={() => setView('rentals')}
            onHomeClick={() => setView('landing')}
            onBookingsClick={() => setView('bookings')}
            onTripPlannerClick={handleTripPlannerClick}
            onActivitiesClick={() => setView('activities')}
            currentView={view}
          />
        )}

        <AppRoutes
          view={view}
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

        {showCustomerChrome && (
          <Footer
            onLoginClick={() => setView('login')}
            onHomeClick={() => setView('landing')}
            onTripPlannerClick={handleTripPlannerClick}
            onBookingsClick={() => setView('bookings')}
            onHotelsClick={() => setView('hotels')}
            onRentalsClick={() => setView('rentals')}
            onActivitiesClick={() => setView('activities')}
            onTourGuidesClick={handleTourGuidesClick}
            user={user}
          />
        )}

        <AnimatePresence>
          {selectedRecommendation && (
            <RecommendationModal item={selectedRecommendation} onClose={() => setSelectedRecommendation(null)} />
          )}
          {selectedDestination && (
            <DestinationModal dest={selectedDestination} onClose={() => setSelectedDestination(null)} />
          )}
        </AnimatePresence>
      </div>
    </HelpCenterLayout>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
