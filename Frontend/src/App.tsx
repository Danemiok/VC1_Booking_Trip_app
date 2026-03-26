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
  if (nextView) {
    return nextView;
  }

  const authTab = params.get('auth');
  if (authTab === 'login' || authTab === 'register') {
    return authTab;
  }

  return 'landing';
};

const AppContent = () => {
  const [view, setView] = useState<string>(() => resolveInitialView());
  const [activeProfileTab, setActiveProfileTab] = useState<any>('profile');
  const { user, logout } = useAuth();
  const previousUserRef = useRef(user);

  const handleProfileClick = (tab?: any) => {
    if (tab) setActiveProfileTab(tab);
    setView('profile');
  };
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);

  // Initialize real-time dates
  const today = new Date('2026-03-03T00:34:03-08:00');
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  const startDateString = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const endDateString = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dateRangeString = `${startDateString} - ${endDateString}`;

  const [tripData, setTripData] = useState({
    title: "Adventure in Siem Reap",
    emoji: "🇰🇭",
    dates: dateRangeString,
    startDate: startDate,
    endDate: endDate,
    guests: "2 Adults",
    reference: "#TP-48291",
    destination: {
      name: "Siem Reap",
      country: "Cambodia",
      description: "Gateway to Angkor Wat and Khmer heritage.",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800"
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
      features: "Automatic • Premium Interior",
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

  const handleSelectRecommendation = (item: any) => {
    if (item.type === 'hotel') {
      setSelectedHotel(item);
      setView('hotel-details');
    } else {
      setSelectedRecommendation(item);
    }
  };

  const handleSelectDestination = (dest: any) => {
    if (dest.type === 'hotel') {
      setSelectedHotel(dest);
      setView('hotel-details');
    } else {
      setSelectedDestination(dest);
    }
  };

  const handleTripPlannerClick = () => {
    setView('trip-planner');
  };

  const handleTourGuidesClick = () => {
    // Navigate to landing page and scroll to "Recommended for You" section
    setView('landing');
    
    // Scroll to the recommended section after component mounts
    setTimeout(() => {
      const element = document.getElementById('recommended-for-you');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLogout = () => {
    void logout();
    setView('landing');
  };

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

  useEffect(() => {
    // Redirect to home after logout, regardless of where logout was triggered.
    if (previousUserRef.current && !user) {
      setSelectedRecommendation(null);
      setSelectedDestination(null);
      setSelectedHotel(null);
      setView('landing');
    }

    previousUserRef.current = user;
  }, [user]);

  return (
    <HelpCenterLayout>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Navbar 
          onLoginClick={() => setView('login')}
          user={user}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onHotelsClick={() => setView('hotels')}
          onRentalsClick={() => setView('rentals')}
          onHomeClick={() => setView('landing')}
          onBookingsClick={() => setView('bookings')}
          onTripPlannerClick={handleTripPlannerClick}
          onActivitiesClick={() => setView('activities')}
          currentView={view}
        />

        <AppRoutes 
          view={view}
          setView={setView}
          onSelectRecommendation={handleSelectRecommendation}
          onSelectDestination={handleSelectDestination}
          onPromotionsClick={() => setView('promotions')}
          onHotelsClick={() => setView('hotels')}
          onRentalsClick={() => setView('rentals')}
          onActivitiesClick={() => setView('activities')}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          activeProfileTab={activeProfileTab}
          selectedHotel={selectedHotel}
          setSelectedHotel={setSelectedHotel}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />

        <Footer
          onLoginClick={() => setView('login')}
          onHomeClick={() => {
            setView('landing');
          }}
          onTripPlannerClick={() => {
            setView('trip-planner');
          }}
          onBookingsClick={() => {
            setView('bookings');
          }}
          onHotelsClick={() => setView('hotels')}
          onRentalsClick={() => setView('rentals')}
          onActivitiesClick={() => setView('activities')}
          onTourGuidesClick={handleTourGuidesClick}
          user={user}
        />

        <AnimatePresence>
          {selectedRecommendation && (
            <RecommendationModal 
              item={selectedRecommendation} 
              onClose={() => setSelectedRecommendation(null)} 
            />
          )}
          {selectedDestination && (
            <DestinationModal 
              dest={selectedDestination} 
              onClose={() => setSelectedDestination(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </HelpCenterLayout>
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
