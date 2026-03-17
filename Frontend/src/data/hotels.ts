export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  amenities?: string[];
  rooms?: number;
  available?: boolean;
  hotel_name?: string;
  city?: string;
  country?: string;
  address?: string;
  stars_rating?: number;
  is_active?: boolean;
  owner?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  created_at?: string;
}

import { hotelService } from '../services/hotelService.js';

export const getHotels = async (): Promise<Hotel[]> => {
  try {
    console.log('🏨 Loading hotels from database...');
    const response = await hotelService.getAllHotels();
    
    if (!response.data || response.data.length === 0) {
      console.warn('⚠️  No hotels found in database! Make sure destinations exist with status=active');
      return [];
    }

    const hotels = response.data.map((destination: Hotel) => ({
      ...destination,
      id: destination.id,
      name: destination.name || destination.hotel_name || 'Untitled Destination',
      location: destination.location || `${destination.city || ''}${destination.country ? ', ' + destination.country : ''}`.trim(),
      rating: parseFloat(String(destination.stars_rating || destination.rating || 0)),
      available: destination.is_active ?? destination.available ?? true,
      price: parseFloat(String(destination.price || 100)),
      image: destination.image || 'https://images.unsplash.com/photo-1569660072562-47a003360691?auto=format&fit=crop&q=80&w=800',
      amenities: Array.isArray(destination.amenities) ? destination.amenities : ['WiFi', 'Pool', 'Restaurant'],
      rooms: destination.rooms || 50,
      description: destination.description || 'Discover your perfect stay',
    }));

    console.log('✅ Successfully loaded', hotels.length, 'hotels from database');
    return hotels;
  } catch (error) {
    console.error('❌ Error fetching hotels from database:', error);
    return [];
  }
};

export const ALL_HOTELS: Hotel[] = [];

