import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';

type MarkerType = 'hotel' | 'destination';
type MarkerFilterType = MarkerType | 'all';

interface RawPlaceRecord extends Record<string, unknown> {
  id?: string | number;
  latitude?: unknown;
  longitude?: unknown;
  hotel_name?: unknown;
  name?: unknown;
  address?: unknown;
  location?: unknown;
  stars_rating?: unknown;
  rating?: unknown;
}

interface PlacePoint extends Record<string, unknown> {
  id: string | number;
  latitude: number;
  longitude: number;
  markerType: MarkerType;
  hotel_name?: unknown;
  name?: unknown;
  address?: unknown;
  location?: unknown;
  stars_rating?: unknown;
  rating?: unknown;
}

interface MapClickLikeEvent {
  latLng?: {
    lat?: () => number;
    lng?: () => number;
  } | null;
}

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };
const MAP_CONTAINER_STYLE: CSSProperties = { width: '100%', height: '560px' };

const toNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePayload = (responseData: unknown): unknown[] => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    const nested = (responseData as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [];
};

const getHotelsEndpoint = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return apiBase ? `${apiBase}/hotels/public` : 'http://127.0.0.1:8000/api/hotels/public';
};

const getDestinationsEndpoint = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return apiBase ? `${apiBase}/destinations/public` : 'http://127.0.0.1:8000/api/destinations/public';
};

const normalizePlaces = (payload: unknown[], type: MarkerType): PlacePoint[] =>
  payload
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;

      const place = entry as RawPlaceRecord;
      const latitude = toNumber(place.latitude);
      const longitude = toNumber(place.longitude);

      if (latitude === null || longitude === null) {
        return null;
      }

      const candidateId = place.id;
      const normalizedId =
        typeof candidateId === 'string' || typeof candidateId === 'number'
          ? candidateId
          : `${type}-${index}`;

      return {
        ...place,
        id: normalizedId,
        latitude,
        longitude,
        markerType: type,
      } satisfies PlacePoint;
    })
    .filter((place): place is PlacePoint => place !== null);

const getPlaceName = (place?: Partial<PlacePoint> | null): string =>
  String(place?.hotel_name || place?.name || '').trim();

const getPlaceLocation = (place?: Partial<PlacePoint> | null): string =>
  String(place?.address || place?.location || '').trim();

const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const matchesSearch = (place: PlacePoint, queryTokens: string[]): boolean => {
  if (queryTokens.length === 0) return true;

  const searchableText = normalizeText(
    `${getPlaceName(place)} ${getPlaceLocation(place)} ${place.markerType}`,
  );

  return queryTokens.every((token) => searchableText.includes(token));
};

const getTypeFromQuery = (value: string | null): MarkerFilterType => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'hotel' || normalized === 'destination') return normalized;
  return 'all';
};

const formatCoordinate = (value: unknown): string => {
  const numeric = toNumber(value);
  return numeric === null ? 'N/A' : numeric.toFixed(6);
};

const isValidCoordinate = (lat: number, lng: number): boolean =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const getPointFromSearchParams = (
  searchParams: URLSearchParams,
): { lat: number; lng: number } | null => {
  const lat = toNumber(searchParams.get('lat'));
  const lng = toNumber(searchParams.get('lng'));

  if (lat === null || lng === null) return null;
  if (!isValidCoordinate(lat, lng)) return null;

  return { lat, lng };
};

export default function MapPage() {
  const location = useLocation();
  const [hotels, setHotels] = useState<PlacePoint[]>([]);
  const [destinations, setDestinations] = useState<PlacePoint[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlacePoint | null>(null);
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedQuery = String(searchParams.get('q') || '').trim();
  const requestedType = getTypeFromQuery(searchParams.get('type'));
  const requestedPoint = getPointFromSearchParams(searchParams);

  const [searchQuery, setSearchQuery] = useState<string>(() => requestedQuery);
  const [markerType, setMarkerType] = useState<MarkerFilterType>(() => requestedType);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    setSearchQuery(requestedQuery);
    setMarkerType(requestedType);
    setSelectedPlace(null);
    setPickedPoint(requestedPoint);
  }, [requestedPoint, requestedQuery, requestedType]);

  useEffect(() => {
    let active = true;

    let pendingRequests = 2;
    const finishLoading = () => {
      pendingRequests -= 1;
      if (active && pendingRequests <= 0) {
        setLoading(false);
      }
    };

    axios
      .get<unknown>(getHotelsEndpoint())
      .then((res) => {
        if (!active) return;
        setHotels(normalizePlaces(normalizePayload(res.data), 'hotel'));
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        console.error('Failed to load hotels for map:', requestError);
        setError('Unable to load hotels and destinations right now.');
      })
      .finally(() => {
        finishLoading();
      });

    axios
      .get<unknown>(getDestinationsEndpoint())
      .then((res) => {
        if (!active) return;
        setDestinations(normalizePlaces(normalizePayload(res.data), 'destination'));
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        console.error('Failed to load destinations for map:', requestError);
        setError('Unable to load hotels and destinations right now.');
      })
      .finally(() => {
        finishLoading();
      });

    return () => {
      active = false;
    };
  }, []);

  const queryTokens = useMemo(
    () => normalizeText(searchQuery).trim().split(/\s+/).filter(Boolean),
    [searchQuery],
  );

  const filteredHotels = useMemo(
    () => hotels.filter((hotel) => matchesSearch(hotel, queryTokens)),
    [hotels, queryTokens],
  );

  const filteredDestinations = useMemo(
    () => destinations.filter((destination) => matchesSearch(destination, queryTokens)),
    [destinations, queryTokens],
  );

  const visibleHotels = useMemo(
    () => (markerType === 'destination' ? [] : filteredHotels),
    [filteredHotels, markerType],
  );

  const visibleDestinations = useMemo(
    () => (markerType === 'hotel' ? [] : filteredDestinations),
    [filteredDestinations, markerType],
  );

  const combinedVisiblePlaces = useMemo(
    () => [...visibleHotels, ...visibleDestinations],
    [visibleDestinations, visibleHotels],
  );

  const queryMatchedPlace = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery).trim();
    if (!normalizedQuery) return null;

    const exact = combinedVisiblePlaces.find((place) => {
      const placeName = normalizeText(getPlaceName(place));
      const placeLocation = normalizeText(getPlaceLocation(place));
      return placeName === normalizedQuery || placeLocation === normalizedQuery;
    });
    if (exact) return exact;

    return (
      combinedVisiblePlaces.find((place) =>
        normalizeText(`${getPlaceName(place)} ${getPlaceLocation(place)}`).includes(normalizedQuery),
      ) || null
    );
  }, [combinedVisiblePlaces, searchQuery]);

  const activeSelectedPlace = useMemo(() => {
    if (!selectedPlace) return null;

    const stillVisible = combinedVisiblePlaces.some(
      (place) => place.id === selectedPlace.id && place.markerType === selectedPlace.markerType,
    );

    return stillVisible ? selectedPlace : null;
  }, [combinedVisiblePlaces, selectedPlace]);

  const mapCenter = useMemo(() => {
    if (pickedPoint) return pickedPoint;

    if (activeSelectedPlace) {
      return {
        lat: activeSelectedPlace.latitude,
        lng: activeSelectedPlace.longitude,
      };
    }

    if (queryMatchedPlace) {
      return {
        lat: queryMatchedPlace.latitude,
        lng: queryMatchedPlace.longitude,
      };
    }

    const firstVisible = combinedVisiblePlaces[0];

    if (firstVisible) {
      return {
        lat: firstVisible.latitude,
        lng: firstVisible.longitude,
      };
    }

    return DEFAULT_CENTER;
  }, [activeSelectedPlace, combinedVisiblePlaces, pickedPoint, queryMatchedPlace]);

  const handleMapClick = (event: unknown) => {
    const mapEvent = event as MapClickLikeEvent | null | undefined;
    const lat = mapEvent?.latLng?.lat?.();
    const lng = mapEvent?.latLng?.lng?.();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const nextPoint = { lat, lng };
    setSelectedPlace(null);
    setPickedPoint(nextPoint);
    console.log('[MapPage] picked coordinates:', nextPoint);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Travel Map</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Browse hotels and destinations on the map</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Search places, choose marker type, and click a map pin or the map area to get coordinates.
        </p>
      </div>

      <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]">
          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedPlace(null);
                setPickedPoint(null);
              }}
              placeholder="Search hotel, destination, or location"
              className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-white"
            />
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Type</span>
            <select
              value={markerType}
              onChange={(event) => {
                setMarkerType(getTypeFromQuery(event.target.value));
                setSelectedPlace(null);
                setPickedPoint(null);
              }}
              className="w-full border-none bg-transparent p-0 font-semibold text-slate-900 focus:ring-0 dark:text-white"
            >
              <option value="all">All</option>
              <option value="hotel">Hotels</option>
              <option value="destination">Destinations</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setMarkerType('all');
              setSelectedPlace(null);
              setPickedPoint(null);
            }}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Clear
          </button>
        </div>
      </div>

      {!googleMapsApiKey ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
          Add `VITE_GOOGLE_MAPS_API_KEY` to your frontend environment file to display the Google Map.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} zoom={12} center={mapCenter} onClick={handleMapClick}>
              {visibleHotels.map((hotel) => (
                <Marker
                  key={`hotel-${hotel.id}`}
                  position={{ lat: hotel.latitude, lng: hotel.longitude }}
                  onClick={() => {
                    setSelectedPlace(hotel);
                    setPickedPoint({ lat: hotel.latitude, lng: hotel.longitude });
                  }}
                  icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                />
              ))}

              {visibleDestinations.map((destination) => (
                <Marker
                  key={`dest-${destination.id}`}
                  position={{ lat: destination.latitude, lng: destination.longitude }}
                  onClick={() => {
                    setSelectedPlace(destination);
                    setPickedPoint({ lat: destination.latitude, lng: destination.longitude });
                  }}
                  icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                />
              ))}

              {pickedPoint && (
                <Marker
                  key="picked-point"
                  position={pickedPoint}
                  onClick={() => setPickedPoint(pickedPoint)}
                  icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                />
              )}

              {activeSelectedPlace && (
                <InfoWindow
                  position={{ lat: activeSelectedPlace.latitude, lng: activeSelectedPlace.longitude }}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="max-w-[220px]">
                    <h4 className="text-sm font-bold text-slate-900">
                      {getPlaceName(activeSelectedPlace) || 'Place'}
                    </h4>
                    <p className="mt-1 text-xs text-slate-600">
                      {getPlaceLocation(activeSelectedPlace) || 'No address available'}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Type: {activeSelectedPlace.markerType === 'hotel' ? 'Hotel' : 'Destination'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      Rating: {String(activeSelectedPlace.stars_rating ?? activeSelectedPlace.rating ?? 0)} star
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      Lat: {formatCoordinate(activeSelectedPlace.latitude)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      Lng: {formatCoordinate(activeSelectedPlace.longitude)}
                    </p>
                  </div>
                </InfoWindow>
              )}

              {pickedPoint && (
                <InfoWindow position={pickedPoint} onCloseClick={() => setPickedPoint(null)}>
                  <div className="max-w-[220px]">
                    <h4 className="text-sm font-bold text-slate-900">Picked Point</h4>
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Lat: {formatCoordinate(pickedPoint.lat)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      Lng: {formatCoordinate(pickedPoint.lng)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <span>
          {loading
            ? 'Loading hotel and destination locations...'
            : `${visibleHotels.length} hotels and ${visibleDestinations.length} destinations shown on map`}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Hotels
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Destinations
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Picked point
        </span>
        {pickedPoint ? (
          <span>
            Picked: {formatCoordinate(pickedPoint.lat)}, {formatCoordinate(pickedPoint.lng)}
          </span>
        ) : (
          <span>Click map to pick lat/lng.</span>
        )}
        {error ? <span className="text-red-600 dark:text-red-400">{error}</span> : null}
      </div>
    </section>
  );
}
