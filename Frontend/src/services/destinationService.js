import { apiRequest } from './api';

const toNumber = (value, fallback = null) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : '';
const ASSET_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN ||
  API_ORIGIN ||
  (typeof window !== 'undefined' ? window.location.origin : '');

const resolveImage = (raw) => {
  const rawImage = typeof raw === 'string' ? raw.trim() : '';
  if (!rawImage) return '';

  const cleaned = rawImage.replace(/\\/g, '/');
  if (!cleaned) return '';

  const normalizedScheme = cleaned.replace(/^https?:\/(?!\/)/i, (match) => `${match}/`);
  if (normalizedScheme.startsWith('data:')) return normalizedScheme;
  if (/^https?:\/\//i.test(normalizedScheme)) return normalizedScheme;

  const normalized = normalizedScheme.startsWith('/') ? normalizedScheme : `/${normalizedScheme}`;
  if (!ASSET_ORIGIN) return normalized;

  if (normalized.startsWith('/storage/')) return `${ASSET_ORIGIN}${normalized}`;
  if (normalized.startsWith('/images/')) return `${ASSET_ORIGIN}/storage${normalized}`;
  if (normalized.startsWith('/destinations/')) return `${ASSET_ORIGIN}/storage${normalized}`;

  return `${ASSET_ORIGIN}${normalized}`;
};

const buildGalleryImages = (primaryImage, images) => {
  const resolvedPrimary = resolveImage(primaryImage);
  const resolvedImages = Array.isArray(images)
    ? images
        .filter((image) => typeof image === 'string' && image.trim().length > 0)
        .map((image) => resolveImage(image))
        .filter(Boolean)
    : [];

  return Array.from(new Set([resolvedPrimary, ...resolvedImages].filter(Boolean)));
};

export const normalizeDestination = (destination) => {
  const rawId = destination?.id ?? destination?.destination_id;
  const normalizedId = Number(rawId);
  const images = buildGalleryImages(destination?.image, destination?.images);
  const image = images[0] || resolveImage(destination?.image) || '';

  return {
    id: Number.isFinite(normalizedId) ? normalizedId : rawId ?? null,
    destination_id: Number.isFinite(normalizedId) ? normalizedId : null,
    owner_id: destination?.owner_id ?? null,
    user_id: destination?.user_id ?? destination?.owner_id ?? null,
    name: String(destination?.name ?? '').trim(),
    type: String(destination?.type ?? '').trim(),
    description: String(destination?.description ?? '').trim(),
    location: String(destination?.location ?? '').trim(),
    latitude: toNumber(destination?.latitude, null),
    longitude: toNumber(destination?.longitude, null),
    address: String(destination?.address ?? '').trim(),
    price: toNumber(destination?.price, 0),
    image,
    images,
    rating: toNumber(destination?.rating, 0),
    total_bookings: toNumber(destination?.total_bookings, 0),
    status: String(destination?.status ?? '').trim(),
    created_at: destination?.created_at ?? null,
    updated_at: destination?.updated_at ?? null,
  };
};

const extractDestinationRecords = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

export const getPublicDestinations = async () => {
  const endpoints = ['/destinations/public', '/destinations/public/all'];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiRequest(endpoint);
      const records = extractDestinationRecords(response);
      return records
        .map((item) => normalizeDestination(item))
        .filter((item) => item?.id !== null && item?.name && item?.location);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return [];
};
