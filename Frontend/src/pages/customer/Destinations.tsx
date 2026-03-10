import React from 'react';
import { MapPin, Search, Star } from 'lucide-react';
import { apiRequest } from '@/src/services/api';

type DestinationStatus = 'active' | 'draft';

interface DestinationApiRecord {
  id: string | number;
  name?: string;
  type?: string;
  description?: string | null;
  location?: string;
  price?: number | string | null;
  image?: string | null;
  images?: string[] | null;
  rating?: number | string | null;
  status?: DestinationStatus;
}

interface DestinationItem {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  status: DestinationStatus;
}

const DEFAULT_IMAGE = 'https://picsum.photos/seed/public-destination/800/600';

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.data?.message === 'string' && error.data.message.trim()) return error.data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

const normalizeDestination = (destination: DestinationApiRecord): DestinationItem => {
  const imageList = Array.isArray(destination.images)
    ? destination.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];

  return {
    id: String(destination.id),
    name: destination.name?.trim() || 'Untitled destination',
    type: destination.type?.trim() || 'Boutique Hotel',
    description: destination.description?.trim() || 'Discover this destination and start planning your stay.',
    location: destination.location?.trim() || 'Unknown location',
    price: toNumber(destination.price, 0),
    image: (typeof destination.image === 'string' && destination.image.trim()) || imageList[0] || DEFAULT_IMAGE,
    rating: toNumber(destination.rating, 0),
    status: destination.status === 'active' ? 'active' : 'draft',
  };
};

export default function Destinations() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [destinations, setDestinations] = React.useState<DestinationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');

  const loadDestinations = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await apiRequest('/destinations/public/all');
      const data = Array.isArray(response?.data) ? response.data : [];
      setDestinations(data.map((item: DestinationApiRecord) => normalizeDestination(item)));
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Failed to load destinations. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDestinations();
  }, [loadDestinations]);

  const filteredDestinations = React.useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return destinations;

    return destinations.filter((destination) =>
      destination.name.toLowerCase().includes(search) ||
      destination.location.toLowerCase().includes(search) ||
      destination.type.toLowerCase().includes(search),
    );
  }, [destinations, searchTerm]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Explore destinations</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Browse live destinations from the database. Newly published active destinations appear here automatically.
          </p>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search destinations, locations, or types"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300 md:flex-row md:items-center md:justify-between">
          <span>{loadError}</span>
          <button
            onClick={() => void loadDestinations()}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading destinations...
        </div>
      ) : filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <article
              key={destination.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative">
                <img src={destination.image} alt={destination.name} className="h-56 w-full object-cover" />
                <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  ACTIVE
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
                  {destination.type}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{destination.name}</h2>
                  <p className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin size={15} className="shrink-0" />
                    <span>{destination.location}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <Star size={15} className="text-yellow-500" />
                    {destination.rating > 0 ? destination.rating.toFixed(1) : 'New listing'}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${destination.price.toFixed(0)}
                    <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">/ night</span>
                  </p>
                </div>

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{destination.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No destinations found</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try another search term or come back after owners publish more destinations.
          </p>
        </div>
      )}
    </section>
  );
}