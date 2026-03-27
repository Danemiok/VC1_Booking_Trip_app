import { getPublicDestinations } from '../services/destinationService';

export interface Hotel {
  id: number | string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  description?: string;
  amenities?: string[];
  rooms?: number | Array<Record<string, unknown>>;
  available?: boolean;
  hotel_name?: string;
  city?: string;
  country?: string;
  address?: string;
  stars_rating?: number;
  is_active?: boolean;
  type?: string;
  status?: string;
  owner?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  total_bookings?: number;
  latitude?: number | null;
  longitude?: number | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : '';
const ASSET_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  API_ORIGIN ||
  (typeof window !== 'undefined' ? window.location.origin : '');

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveHotelImageUrl = (value?: string | null): string => {
  if (!value) return '';

  const cleaned = value.replace(/\\/g, '/').trim();
  if (!cleaned) return '';

  const normalizedScheme = cleaned.replace(/^https?:\/(?!\/)/i, (match) => `${match}/`);
  if (normalizedScheme.startsWith('data:')) return normalizedScheme;
  if (/^https?:\/\//i.test(normalizedScheme)) return normalizedScheme;

  const normalized = normalizedScheme.startsWith('/') ? normalizedScheme : `/${normalizedScheme}`;
  if (!ASSET_ORIGIN) return normalized;

  if (normalized.startsWith('/storage/')) return `${ASSET_ORIGIN}${normalized}`;
  if (normalized.startsWith('/uploads/')) return `${ASSET_ORIGIN}/storage${normalized}`;
  if (normalized.startsWith('/images/')) return `${ASSET_ORIGIN}/storage${normalized}`;
  if (normalized.startsWith('/destinations/')) return `${ASSET_ORIGIN}/storage${normalized}`;

  return `${ASSET_ORIGIN}${normalized}`;
};

const normalizeGalleryImages = (images: unknown, image?: string | null): string[] => {
  const gallery = Array.isArray(images)
    ? images
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => resolveHotelImageUrl(item))
        .filter(Boolean)
    : [];

  const primaryImage = resolveHotelImageUrl(image);
  const merged = primaryImage ? [primaryImage, ...gallery] : gallery;

  return Array.from(new Set(merged)).filter(Boolean);
};

// Lightweight fallback data so the UI still works when the backend is offline.
const SAMPLE_HOTELS: Hotel[] = [
  {
    id: 'sample-1',
    name: 'Riverside Boutique',
    location: 'Phnom Penh, Cambodia',
    price: 120,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    amenities: ['Free WiFi', 'Pool', 'Breakfast'],
    description: 'Charming stay along the Tonle Sap with city views and a rooftop pool.',
  },
  {
    id: 'sample-2',
    name: 'Angkor Heritage Resort',
    location: 'Siem Reap, Cambodia',
    price: 180,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80',
    amenities: ['Spa', 'Airport Shuttle', 'Breakfast'],
    description: 'Resort-style comfort minutes from Angkor Wat, with lush gardens and spa.',
  },
  {
    id: 'sample-3',
    name: 'Coastal Breeze Villas',
    location: 'Sihanoukville, Cambodia',
    price: 140,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80',
    amenities: ['Beachfront', 'Free WiFi', 'Bar'],
    description: 'Beachfront villas with sunset decks, ideal for weekend escapes.',
  },
];

export const getHotels = async (): Promise<Hotel[]> => {
  try {
    const records = await getPublicDestinations();

    return records.map((destination: any) => {
      const images = normalizeGalleryImages(destination.images, destination.image);
      const primaryImage = images[0] || '';

      return {
        id: destination.id ?? destination.destination_id ?? '',
        name: String(destination.name || destination.hotel_name || '').trim(),
        location: String(destination.location || '').trim(),
        rating: toNumber(destination.rating, 0),
        available: String(destination.status || '').toLowerCase() === 'active',
        price: toNumber(destination.price, 0),
        image: primaryImage,
        images,
        amenities: Array.isArray(destination.amenities) ? destination.amenities : [],
        rooms: destination.rooms,
        description: String(destination.description || '').trim(),
        type: String(destination.type || '').trim(),
        status: String(destination.status || '').trim(),
        address: String(destination.address || '').trim(),
        created_at: destination.created_at,
        updated_at: destination.updated_at,
        total_bookings: toNumber(destination.total_bookings, 0),
        latitude: destination.latitude ?? null,
        longitude: destination.longitude ?? null,
      };
    }).filter((item) => Boolean(item.id) && Boolean(item.name) && Boolean(item.location));
  } catch (error) {
    console.error('Error fetching hotels from database, falling back to samples:', error);
    return SAMPLE_HOTELS;
  }
};

export const ALL_HOTELS: Hotel[] = [];
