import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dashboard as CustomerDashboard } from '../pages/customer/Dashboard';
import { Destinations } from '../pages/customer/Destinations';
import { TripPlanner } from '../pages/customer/TripPlanner';
import { BookingHistory } from '../pages/customer/BookingHistory';
import { GroupInvite } from '../pages/customer/GroupInvite';
import { GroupPlanning } from '../pages/customer/GroupPlanning';
import { Payment } from '../pages/customer/Payment';
import OwnerDashboard from '../pages/owner/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Profile } from '../pages/customer/Profile';
import { HotelDetails, type HotelReservationSelection } from '../pages/customer/HotelDetails';
import { Rentals } from '../pages/customer/Rentals';
import { Activities } from '../pages/customer/Activities';
import { Promotions } from '../pages/customer/Promotions';
import { ALL_HOTELS } from '../data/hotels';

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
  onSearch?: (query: string, dates: { start: Date | null, end: Date | null }, guests: { adults: number, children: number }) => void;
  returnToPlanner?: boolean;
  setReturnToPlanner?: (val: boolean) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ 
  view, 
  setView, 
  onSelectRecommendation, 
  onSelectDestination,
  onPromotionsClick,
  onHotelsClick,
  onRentalsClick,
  onActivitiesClick,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  activeProfileTab,
  selectedHotel,
  setSelectedHotel,
  selectedActivityIds,
  setSelectedActivityIds,
  tripData,
  setTripData,
  onSearch,
  returnToPlanner,
  setReturnToPlanner
}) => {
  const { user } = useAuth();

  // Simple routing based on view state
  switch (view) {
    case 'login':
      return (
        <Login 
          onSwitchToRegister={() => setView('register')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    case 'register':
      return (
        <Register 
          onSwitchToLogin={() => setView('login')} 
          onBack={() => setView('landing')} 
          onSuccess={() => setView('landing')}
        />
      );
    case 'hotels':
      return (
        <Destinations 
          tripData={tripData}
          onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} 
          onSelectHotel={(hotel) => {
            setSelectedHotel({ ...hotel, backView: 'hotels' });
            setView('hotel-details');
          }}
        />
      );
    case 'hotel-details':
      return (
        <HotelDetails 
          tripData={tripData}
          hotel={selectedHotel} 
          onBack={() => setView(selectedHotel?.backView || (returnToPlanner ? 'trip-planner' : 'hotels'))} 
          onReserve={(selection: HotelReservationSelection) => {
            const priceStr = String(selectedHotel?.price || '0');
            const fallbackDailyPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            const dailyPrice = selection?.nightlyPrice || fallbackDailyPrice;
            
            setTripData((prev: any) => {
              let nights = 7; // Default
              if (prev.startDate && prev.endDate) {
                const start = new Date(prev.startDate);
                const end = new Date(prev.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) nights = diffDays;
              }

              const locationParts = String(selectedHotel?.location || '')
                .split(',')
                .map((part: string) => part.trim())
                .filter(Boolean);
              const destinationName =
                locationParts.length > 1
                  ? locationParts[locationParts.length - 2]
                  : locationParts[0] || prev.destination?.name || 'Siem Reap';
              const destinationCountry =
                locationParts[locationParts.length - 1] || prev.destination?.country || 'Cambodia';
              const selectedGuests = Math.max(1, Number(selection?.guests || 2));
              const guestsLabel = `${selectedGuests} ${selectedGuests === 1 ? 'Guest' : 'Guests'}`;

              return {
                ...prev,
                guests: guestsLabel,
                destination: {
                  ...prev.destination,
                  name: destinationName,
                  country: destinationCountry,
                  image: selectedHotel?.image || prev.destination?.image
                },
                hotel: {
                  ...prev.hotel,
                  name: selectedHotel?.name || prev.hotel?.name,
                  location: selectedHotel?.location || prev.hotel?.location,
                  price: dailyPrice * nights,
                  dailyPrice: dailyPrice,
                  nights: nights,
                  roomType: selection?.roomType || prev.hotel?.roomType || 'Deluxe Room',
                  roomCategory: selection?.roomCategory || prev.hotel?.roomCategory || 'Room',
                  guests: guestsLabel,
                  maxOccupancy: selection?.maxOccupancy || prev.hotel?.maxOccupancy || selectedGuests,
                  cleaningFee: selection?.cleaningFee || prev.hotel?.cleaningFee || 0,
                  serviceFee: selection?.serviceFee || prev.hotel?.serviceFee || 0,
                  estimatedTotal: selection?.totalPrice || (dailyPrice * nights),
                  image: selectedHotel?.image || (selectedHotel?.images && selectedHotel.images[0]) || prev.hotel.image,
                  status: "Reserved"
                }
              };
            });
            
            if (returnToPlanner) {
              setView('trip-planner');
            } else {
              setView('bookings');
            }
          }}
        />
      );
    case 'rentals':
      return (
        <Rentals 
          onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} 
          onSelectVehicle={(vehicle) => {
            setTripData((prev: any) => {
              let days = 7; // Default
              if (prev.startDate && prev.endDate) {
                const start = new Date(prev.startDate);
                const end = new Date(prev.endDate);
                
                // Use a more robust calculation for days
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 0) {
                  days = diffDays;
                } else if (diffDays === 0) {
                  days = 1; // Minimum 1 day
                }
              }

              return {
                ...prev,
                rental: {
                  ...prev.rental,
                  name: vehicle.name,
                  price: vehicle.price * days,
                  dailyPrice: vehicle.price,
                  days: days,
                  image: vehicle.image,
                  features: `${vehicle.transmission || 'Auto'} • ${vehicle.type}`,
                  isBooked: true
                }
              };
            });
            
            if (returnToPlanner) {
              setView('trip-planner');
            } else {
              setView('bookings');
            }
          }}
        />
      );
    case 'activities':
      return (
        <Activities onBack={() => setView(returnToPlanner ? 'trip-planner' : 'landing')} />
      );
    case 'promotions':
      return (
        <Promotions 
          onBack={() => setView('landing')} 
          onClaim={() => setView('bookings')}
        />
      );
    case 'trip-planner':
      return (
        <TripPlanner 
          tripData={tripData}
          setTripData={setTripData}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          onBack={() => { setReturnToPlanner?.(false); setView('landing'); }}
          onHotelClick={() => { setReturnToPlanner?.(true); setView('hotels'); }}
          onExploreHotel={() => {
            const hotel = ALL_HOTELS.find((h: any) => h.name === tripData.hotel.name);
            if (hotel) {
              setSelectedHotel({ ...hotel, backView: 'trip-planner' });
              setReturnToPlanner?.(true);
              setView('hotel-details');
            }
          }}
          onRentalClick={() => { setReturnToPlanner?.(true); setView('rentals'); }}
          onActivitiesClick={() => { setReturnToPlanner?.(true); setView('activities'); }}
          onProceedToBooking={() => setView('payment')}
        />
      );
    case 'bookings':
      return (
        <BookingHistory 
          onPaymentClick={() => setView('payment')} 
          onHotelClick={() => {
            setView('hotels');
          }}
          onRentalClick={() => setView('rentals')}
          onGroupPlanningClick={() => setView('group-planning')}
          selectedActivityIds={selectedActivityIds}
          setSelectedActivityIds={setSelectedActivityIds}
          tripData={tripData}
          setTripData={setTripData}
        />
      );
    case 'group-invite':
      return <GroupInvite />;
    case 'group-planning':
      return (
        <GroupPlanning 
          onBack={() => setView('bookings')} 
          tripTitle={tripData.title}
        />
      );
    case 'payment':
      return (
        <Payment 
          tripData={tripData} 
          onBackToHome={() => setView('landing')} 
          selectedActivityIds={selectedActivityIds}
        />
      );
    case 'profile':
      return (
        <Profile 
          initialTab={activeProfileTab} 
          notifications={notifications} 
          onMarkAsRead={onMarkAsRead} 
          onMarkAllAsRead={onMarkAllAsRead}
        />
      );
    case 'owner-dashboard':
      return <OwnerDashboard />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'landing':
    default:
      if (user?.role === 'owner') return <OwnerDashboard />;
      if (user?.role === 'admin') return <AdminDashboard />;
      return (
        <CustomerDashboard 
          tripData={tripData}
          onSelectRecommendation={onSelectRecommendation} 
          onSelectDestination={onSelectDestination} 
          onPromotionsClick={onPromotionsClick}
          onHotelsClick={onHotelsClick}
          onRentalsClick={onRentalsClick}
          onActivitiesClick={onActivitiesClick}
          onSearch={onSearch}
        />
      );
  }
};
