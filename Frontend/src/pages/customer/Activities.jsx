import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Fish,
  Info,
  MapPin,
  Star,
  Tent,
  Users,
  Utensils,
  Waves,
  Camera,
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../../services/api.js';

const ITEMS_PER_PAGE = 6;

const iconByType = {
  water: Waves,
  fishing: Fish,
  food: Utensils,
  camping: Tent,
  adventure: Compass,
  photography: Camera,
};

const defaultHero = {
  title: 'Live Activities From the Backend',
  subtitle:
    'Browse real activities loaded from your Laravel `activities` table and select the ones you want to include in your trip.',
  image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&q=80&w=2000',
};

const normalizeActivitiesResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.activities)) return payload.activities;
  return [];
};

const buildImageUrl = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return defaultHero.image;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/storage/') ? raw : `/storage/${raw.replace(/^\/+/, '')}`;
};

const chooseIcon = (type) => {
  const normalized = String(type ?? '').trim().toLowerCase();
  return iconByType[normalized] || Compass;
};

export const Activities = ({
  onBack,
  onRequireLogin,
  onConfirmBooking,
  isAuthenticated,
  selectedActivityIds,
  setSelectedActivityIds,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([1, 3]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [activityOptions, setActivityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadActivities = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await apiRequest('/activities/public', { method: 'GET' });
        if (cancelled) return;
        setActivityOptions(normalizeActivitiesResponse(payload));
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load activities from the backend.');
        setActivityOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveSelectedIds = selectedActivityIds ?? selectedOptions;
  const selectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

  const selectedExtras = useMemo(
    () => activityOptions.filter((activity) => selectedSet.has(activity.id)),
    [activityOptions, selectedSet],
  );

  const totalCost = useMemo(
    () => selectedExtras.reduce((sum, activity) => sum + Number(activity.price || 0), 0),
    [selectedExtras],
  );

  const totalPages = Math.max(1, Math.ceil(activityOptions.length / ITEMS_PER_PAGE));
  const paginatedOptions = activityOptions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hero = activityOptions[0]
    ? {
        title: activityOptions[0].name || defaultHero.title,
        subtitle: activityOptions[0].description || defaultHero.subtitle,
        image: buildImageUrl(activityOptions[0].image || activityOptions[0]?.destination?.image),
      }
    : defaultHero;

  const toggleOption = (id) => {
    if (setSelectedActivityIds) {
      setSelectedActivityIds((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.includes(id) ? safePrev.filter((item) => item !== id) : [...safePrev, id];
      });
      return;
    }

    setSelectedOptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleConfirm = () => {
    if (isAuthenticated === false) {
      setShowGuestPrompt(true);
      setShowConfirmed(false);
      onRequireLogin?.();
      return;
    }

    setShowGuestPrompt(false);
    setShowConfirmed(true);
    setTimeout(() => setShowConfirmed(false), 2500);
    onConfirmBooking?.();
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
    document.getElementById('activity-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[88rem] mx-auto">
      <div className="relative h-[520px] md:h-[600px] rounded-[3rem] overflow-hidden mb-14 shadow-2xl">
        <img
          src={hero.image}
          alt="Adventure Activities Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,160,132,0.3),transparent_55%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-14">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Backend Activities
            </span>
            <div className="flex items-center gap-1 text-white">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">{activityOptions[0]?.rating?.toFixed?.(1) ?? '4.9'}</span>
              <span className="text-xs text-white/70">({activityOptions.length} activities)</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-5 tracking-tight leading-[0.95]">
            {hero.title}
          </h1>
          <p className="text-white/85 max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed">
            {hero.subtitle}
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-7 left-7 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <section id="activity-options" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Customize Your Experience</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              These options are loaded from the backend activities table and can be selected for your booking.
            </p>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                {error}
              </div>
            ) : (
              <motion.div
                key={`activity-page-${currentPage}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {paginatedOptions.map((option) => {
                  const TypeIcon = chooseIcon(option.type);
                  const isSelected = selectedSet.has(option.id);

                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
                        }`}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{option.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">${Number(option.price || 0).toFixed(2)}</span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {option.description || 'No description provided by the backend yet.'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {option.duration_hours ? `${option.duration_hours}h` : 'Duration N/A'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {option.available_spots ? `${option.available_spots} spots` : 'Limited spots'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {Number(option.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Location</h2>
            <div className="relative h-[300px] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 opacity-50 dark:opacity-30">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-full animate-ping absolute -inset-0" />
                  <div className="relative bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {activityOptions[0]?.destination?.name || 'Backend Destination'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {activityOptions[0]?.destination?.location || 'Loaded from activities table'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6 self-start">
            <div className="rounded-[2.75rem] p-[1px] bg-gradient-to-br from-slate-800/70 via-slate-900 to-slate-950 shadow-2xl">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-[2.7rem] p-8 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300/70">Selected Activities</span>
                    <span className="font-bold text-white">{selectedExtras.length}</span>
                  </div>

                  {selectedExtras.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Selected Items
                      </p>
                      {selectedExtras.map((extra) => (
                        <div key={extra.id} className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300/70">{extra.name}</span>
                          <span className="font-bold text-white">${Number(extra.price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 mb-8">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-base font-bold text-white">Total Cost</p>
                      <p className="text-[10px] text-slate-400">From selected backend activities only.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-emerald-500 tracking-tight">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Check-in</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Calendar className="w-3 h-3 text-emerald-500" />
                      Oct 24, 2023
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Guests</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Users className="w-3 h-3 text-emerald-500" />
                      2 Adults
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-[0_16px_40px_rgba(47,160,132,0.35)] transition-all flex items-center justify-center gap-2 mb-3 active:scale-[0.99]"
                >
                  <Calendar className="w-5 h-5" /> Confirm Booking
                </button>

                <button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mb-4">
                  Save to Wishlist
                </button>

                {showGuestPrompt && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-amber-200">Login required</p>
                    <p className="text-[11px] text-amber-100/80 mt-1">Please login to confirm booking.</p>
                  </div>
                )}

                {showConfirmed && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-emerald-200">Confirmed</p>
                    <p className="text-[11px] text-emerald-100/80 mt-1">Your activities have been saved.</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-300 font-bold">
                  <Check className="w-3 h-3" /> Free cancellation until 48h before arrival
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/50 flex gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-1">Pro Tip</p>
                <p className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed">
                  These activities are now coming directly from the backend, so any database changes will show up here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

