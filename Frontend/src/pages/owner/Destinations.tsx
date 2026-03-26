import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, MapPin, Edit, Trash2, X } from 'lucide-react';
import { apiRequest } from '@/services/api';

type DestinationStatus = 'active' | 'draft';

interface DestinationApiRecord {
  id: string | number;
  name?: string;
  type?: string;
  description?: string | null;
  location?: string;
  address?: string | null;
  price?: number | string | null;
  image?: string | null;
  images?: string[] | null;
  rating?: number | string | null;
  total_bookings?: number | null;
  totalBookings?: number | null;
  status?: DestinationStatus;
  created_at?: string;
  updated_at?: string;
}

interface DestinationItem {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  address: string;
  price: number;
  image: string;
  images: string[];
  rating: number;
  totalBookings: number;
  total_bookings: number;
  status: DestinationStatus;
  created_at?: string;
  updated_at?: string;
}

interface DestinationFormData {
  name: string;
  type: string;
  description: string;
  location: string;
  address: string;
  price: string;
  image: string;
  imageFile: File | null;
  rating: string;
  status: DestinationStatus;
}

interface PropertyCardProps {
  property: DestinationItem;
  onView: (property: DestinationItem) => void;
  onEdit: (property: DestinationItem) => void;
  onDelete: (property: DestinationItem) => void;
  activePromotion: { discount?: string } | null;
}

interface DestinationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  title: string;
  formData: DestinationFormData;
  imagePreview: string;
  formErrors: Record<string, string>;
  submitError: string;
  onClose: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof DestinationFormData, value: string) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DEFAULT_IMAGE = 'https://picsum.photos/seed/destination-default/800/600';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : '';
const ASSET_ORIGIN =
  import.meta.env.VITE_ASSET_ORIGIN ||
  API_ORIGIN ||
  (typeof window !== 'undefined' ? window.location.origin : '');

const PROPERTY_TYPES = [
  'Boutique Hotel',
  'Luxury Villa',
  'Eco Lodge',
  'Resort',
  'Villa',
  'Camp',
];

const createEmptyFormData = (): DestinationFormData => ({
  name: '',
  type: 'Boutique Hotel',
  description: '',
  location: '',
  address: '',
  price: '',
  image: '',
  imageFile: null,
  rating: '',
  status: 'active',
});

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.data?.message === 'string' && error.data.message.trim()) return error.data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

const resolveImageUrl = (value?: string | null) => {
  if (!value) return '';
  const cleaned = value.replace(/\\/g, '/');
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

const getStatusLabel = (status: DestinationStatus) => (status === 'active' ? 'ACTIVE' : 'UPCOMING');

const normalizeDestination = (destination: DestinationApiRecord): DestinationItem => {
  const imageList = Array.isArray(destination.images)
    ? destination.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];
  const image =
    resolveImageUrl((typeof destination.image === 'string' && destination.image.trim()) || imageList[0] || '') ||
    DEFAULT_IMAGE;
  const totalBookings = Math.max(0, toNumber(destination.total_bookings ?? destination.totalBookings, 0));

  return {
    id: String(destination.id),
    name: destination.name?.trim() || 'Untitled destination',
    type: destination.type?.trim() || 'Boutique Hotel',
    description: destination.description?.trim() || '',
    location: destination.location?.trim() || 'Unknown location',
    address: destination.address?.trim() || destination.location?.trim() || '',
    price: toNumber(destination.price, 0),
    image,
    images: imageList.length > 0 ? imageList.map(resolveImageUrl).filter(Boolean) : [image],
    rating: toNumber(destination.rating, 0),
    totalBookings,
    total_bookings: totalBookings,
    status: destination.status === 'active' ? 'active' : 'draft',
    created_at: destination.created_at,
    updated_at: destination.updated_at,
  };
};

const toFormData = (property: DestinationItem): DestinationFormData => ({
  name: property.name,
  type: property.type,
  description: property.description,
  location: property.location,
  address: property.address,
  price: property.price ? String(property.price) : '',
  image: property.image,
  imageFile: null,
  rating: property.rating ? String(property.rating) : '',
  status: property.status,
});

const PropertyCard = ({ property, onView, onEdit, onDelete, activePromotion }: PropertyCardProps) => {
  const basePrice = typeof property.price === 'number' ? property.price : undefined;
  const discount = typeof activePromotion?.discount === 'string' ? activePromotion.discount : '';

  const computePrice = () => {
    if (typeof basePrice !== 'number') return { finalPrice: undefined, hasDiscount: false };
    if (!discount) return { finalPrice: basePrice, hasDiscount: false };

    const trimmed = discount.trim();

    if (trimmed.endsWith('%')) {
      const pct = parseFloat(trimmed.replace('%', ''));
      if (!Number.isFinite(pct)) return { finalPrice: basePrice, hasDiscount: false };
      return { finalPrice: Math.max(0, basePrice - basePrice * (pct / 100)), hasDiscount: true };
    }

    if (trimmed.startsWith('$')) {
      const amount = parseFloat(trimmed.replace('$', ''));
      if (!Number.isFinite(amount)) return { finalPrice: basePrice, hasDiscount: false };
      return { finalPrice: Math.max(0, basePrice - amount), hasDiscount: true };
    }

    return { finalPrice: basePrice, hasDiscount: false };
  };

  const { finalPrice, hasDiscount } = computePrice();

  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl hover:shadow-blue-500/10 border border-slate-100 dark:border-slate-700 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onView(property)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={property.image} 
          alt={property.name} 
          className="w-full h-52 object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
          property.status === 'active' 
            ? 'bg-emerald-500 shadow-emerald-500/30' 
            : 'bg-amber-500 shadow-amber-500/30'
        }`}>
          {getStatusLabel(property.status)}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            className="p-2.5 rounded-xl bg-white/95 text-slate-700 hover:text-blue-600 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(property);
            }}
            title="Edit Property"
          >
            <Edit size={16} />
          </button>
          <button
            className="p-2.5 rounded-xl bg-white/95 text-slate-700 hover:text-red-600 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(property);
            }}
            title="Delete Property"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Title & Type */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{property.name}</h3>
          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {property.type}
          </span>
        </div>

        {/* Rating & Location */}
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <Star className="text-amber-400 fill-amber-400" size={14} />
            <span className="font-medium">{property.rating > 0 ? property.rating.toFixed(1) : 'N/A'}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1 truncate">
            <MapPin size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bookings</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{property.totalBookings}</p>
            </div>
          </div>

          {/* Price Section */}
          <div className="text-right">
            {activePromotion?.discount && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 mb-1">
                {activePromotion.discount}
              </span>
            )}
            {typeof basePrice === 'number' && (
              <div>
                {hasDiscount && (
                  <p className="text-xs text-slate-400 line-through">${basePrice.toFixed(0)}</p>
                )}
                <p className="text-xl font-bold text-slate-900 dark:text-white">${(finalPrice ?? basePrice).toFixed(0)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">per night</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DestinationModal = ({
  isOpen,
  isSubmitting,
  title,
  formData,
  imagePreview,
  formErrors,
  submitError,
  onClose,
  onSubmit,
  onFieldChange,
  onImageChange,
}: DestinationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">Create or update your destination with backend data.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Name</label>
              <input
                value={formData.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mekong Riverside Villa"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(event) => onFieldChange('type', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Location</label>
              <input
                value={formData.location}
                onChange={(event) => onFieldChange('location', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phnom Penh, Cambodia"
              />
              {formErrors.location && <p className="mt-1 text-xs text-red-500">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Address</label>
              <input
                value={formData.address}
                onChange={(event) => onFieldChange('address', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Price per night (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(event) => onFieldChange('price', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150"
              />
              {formErrors.price && <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(event) => onFieldChange('rating', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4.8"
              />
              {formErrors.rating && <p className="mt-1 text-xs text-red-500">{formErrors.rating}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(imagePreview || formData.image) && (
                <div className="mt-3">
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="h-36 w-full rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) => onFieldChange('description', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe your destination..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(event) => onFieldChange('status', event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Upcoming</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : title}
          </button>
        </div>
      </div>
    </div>
  );
};

const Destinations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | DestinationStatus>('all');
  const [properties, setProperties] = React.useState<DestinationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<DestinationItem | null>(null);
  const [formData, setFormData] = React.useState<DestinationFormData>(createEmptyFormData());
  const [imagePreview, setImagePreview] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [propertyToDelete, setPropertyToDelete] = React.useState<DestinationItem | null>(null);
  const [deleteError, setDeleteError] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [promotions, setPromotions] = React.useState<any[]>([]);

  const loadDestinations = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [destResponse, promoResponse] = await Promise.all([
        apiRequest('/destinations'),
        apiRequest('/promotions').catch(() => ({ data: [] })),
      ]);
      const data = Array.isArray(destResponse?.data) ? destResponse.data : [];
      setProperties(data.map((item: DestinationApiRecord) => normalizeDestination(item)));
      setPromotions(Array.isArray(promoResponse?.data) ? promoResponse.data : []);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Failed to load destinations. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActivePromotionForDestination = React.useCallback((destinationId: string) => {
    const now = new Date();
    return promotions.find((promo: any) => {
      if (!promo.is_active) return false;

      if (promo.expiry) {
        const expiryDate = new Date(promo.expiry);
        if (now > expiryDate) return false;
      }

      const linkedDestinations = promo.linked_destinations || [];
      return linkedDestinations.includes(parseInt(destinationId));
    }) || null;
  }, [promotions]);

  const filteredProperties = React.useMemo(() => {
    return properties.filter((property) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        search.length === 0 ||
        property.name.toLowerCase().includes(search) ||
        property.location.toLowerCase().includes(search) ||
        property.type.toLowerCase().includes(search);
      const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [filterStatus, properties, searchTerm]);

  const handleView = (property: DestinationItem) => {
    navigate(`/destinations/${property.id}`, { state: { property } });
  };

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setFormData(createEmptyFormData());
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setFormErrors({});
    setSubmitError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (property: DestinationItem) => {
    setEditingProperty(property);
    setFormData(toFormData(property));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setFormErrors({});
    setSubmitError('');
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setShowFormModal(false);
    setEditingProperty(null);
    setFormData(createEmptyFormData());
    setFormErrors({});
    setSubmitError('');
  };

  const handleFormFieldChange = (field: keyof DestinationFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: field === 'status' && value === 'active' ? 'active' : field === 'status' ? 'draft' : value,
    }));

    setFormErrors((previous) => {
      if (!previous[field]) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setFormData((previous) => ({ ...previous, imageFile: null }));
      setImagePreview('');
      return;
    }

    setFormData((previous) => ({ ...previous, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Destination name is required.';
    if (!formData.location.trim()) nextErrors.location = 'Location is required.';

    const price = parseFloat(formData.price);
    if (!formData.price.trim() || !Number.isFinite(price) || price < 0) {
      nextErrors.price = 'Enter a valid non-negative price.';
    }

    if (formData.rating.trim()) {
      const rating = parseFloat(formData.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        nextErrors.rating = 'Rating must be between 0 and 5.';
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('type', formData.type.trim() || 'Boutique Hotel');
    payload.append('description', formData.description.trim());
    payload.append('location', formData.location.trim());
    payload.append('address', formData.address.trim());
    payload.append('price', String(parseFloat(formData.price)));
    payload.append('rating', formData.rating.trim() ? String(parseFloat(formData.rating)) : '0');
    payload.append('status', formData.status);

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
      payload.append('images[]', formData.imageFile);
    } else if (formData.image.trim()) {
      payload.append('image', formData.image.trim());
      payload.append('images[]', formData.image.trim());
    }

    if (editingProperty) {
      payload.append('_method', 'PUT');
    }

    try {
      const response = await apiRequest(editingProperty ? `/destinations/${editingProperty.id}` : '/destinations', {
        method: 'POST',
        body: payload,
      });

      const fallbackImage = imagePreview || formData.image.trim() || DEFAULT_IMAGE;
      const fallbackData = {
        id: editingProperty?.id ?? Date.now(),
        name: formData.name.trim(),
        type: formData.type.trim() || 'Boutique Hotel',
        description: formData.description.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        price: parseFloat(formData.price),
        image: fallbackImage,
        images: fallbackImage ? [fallbackImage] : [],
        rating: formData.rating.trim() ? parseFloat(formData.rating) : 0,
        status: formData.status,
      };

      const savedProperty = normalizeDestination(response?.data ?? fallbackData);

      setProperties((previous) => {
        if (editingProperty) {
          return previous.map((item) => (item.id === editingProperty.id ? savedProperty : item));
        }

        return [savedProperty, ...previous];
      });

      setFeedbackMessage(editingProperty ? 'Destination updated successfully.' : 'Destination created successfully.');
      handleCloseForm();
    } catch (error) {
      setSubmitError(
        getErrorMessage(
          error,
          editingProperty ? 'Failed to update destination. Please try again.' : 'Failed to create destination. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (property: DestinationItem) => {
    setPropertyToDelete(property);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setPropertyToDelete(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    console.log('🗑️ Confirming delete for destination:', {
      id: propertyToDelete.id,
      name: propertyToDelete.name,
      type: typeof propertyToDelete.id
    });

    setIsDeleting(true);
    setDeleteError('');

    try {
      const deleteUrl = `/destinations/${propertyToDelete.id}`;
      console.log('📍 Delete URL:', deleteUrl);
      
      await apiRequest(deleteUrl, { method: 'DELETE' });
      setProperties((previous) => previous.filter((item) => item.id !== propertyToDelete.id));
      setFeedbackMessage('Destination deleted successfully.');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('❌ Delete error:', error);
      setDeleteError(getErrorMessage(error, 'Failed to delete destination. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-10 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:justify-between md:items-end pb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                  <MapPin className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    Destinations
                  </h1>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg ml-16">
                Manage your property listings with <span className="font-semibold text-blue-600 dark:text-blue-400">live backend data</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => void loadDestinations()}
                className="group px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
              <button
                onClick={handleOpenCreate}
                className="group flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                <Plus size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                Add New Destination
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{properties.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{properties.filter(p => p.status === 'active').length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Clock className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{properties.filter(p => p.status === 'draft').length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {properties.reduce((sum, p) => sum + p.totalBookings, 0)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Bookings</p>
              </div>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-300">
            {feedbackMessage}
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>{loadError}</span>
            <button
              onClick={() => void loadDestinations()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors self-start md:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-5 mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search destinations by name, type, or location..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: properties.length, icon: Building2, color: 'blue' },
                { key: 'active', label: 'Active', count: properties.filter((p) => p.status === 'active').length, icon: CheckCircle2, color: 'emerald' },
                { key: 'draft', label: 'Upcoming', count: properties.filter((p) => p.status === 'draft').length, icon: Clock, color: 'amber' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    filterStatus === filter.key
                      ? `bg-${filter.color}-100 dark:bg-${filter.color}-900/30 text-${filter.color}-700 dark:text-${filter.color}-300 border-2 border-${filter.color}-200 dark:border-${filter.color}-800 shadow-sm`
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-2 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <filter.icon size={16} />
                  {filter.label}
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    filterStatus === filter.key
                      ? 'bg-white/50 dark:bg-black/20'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Loading destinations...</div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={handleView}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                activePromotion={getActivePromotionForDestination(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No destinations found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or filters, or add a new destination.</p>
          </div>
        )}

        <DestinationModal
          isOpen={showFormModal}
          isSubmitting={isSubmitting}
          title={editingProperty ? 'Update Destination' : 'Create Destination'}
          formData={formData}
          imagePreview={imagePreview}
          formErrors={formErrors}
          submitError={submitError}
          onClose={handleCloseForm}
          onSubmit={() => void handleSubmitForm()}
          onFieldChange={handleFormFieldChange}
          onImageChange={handleImageChange}
        />

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Property</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete "{propertyToDelete?.name}"? This will permanently remove the property and all associated data.
              </p>
              {deleteError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void confirmDelete()}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Property'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;

