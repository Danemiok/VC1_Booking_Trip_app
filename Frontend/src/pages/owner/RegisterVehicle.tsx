import React from 'react';
import { 
  ArrowLeft, 
  Truck, 
  User, 
  FileText, 
  Camera, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { apiRequest } from '@/services/api';
import { getAuthToken } from '@/services/authService';

const RegisterVehicle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: '',
    type: 'Car Rental' as 'Car Rental' | 'Train' | 'Bus' | 'Other',
    status: 'pending' as 'active' | 'inactive' | 'pending',
    route: '',
    details: '',
    price_per_KM: '',
    is_free: false,
    image: ''
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState('');
  const documentInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeDocument, setActiveDocument] = React.useState<string | null>(null);
  const [documents, setDocuments] = React.useState<Record<string, string>>({
    'Registration Card': '',
    'Insurance Policy': '',
    'Technical Inspection': '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.route.trim()) newErrors.route = 'Route is required';
    if (!formData.is_free && (!formData.price_per_KM || parseFloat(formData.price_per_KM) <= 0)) {
      newErrors.price_per_KM = 'Valid price per KM is required';
    }
    if (!imageFile && !formData.image.trim()) {
      newErrors.image = 'Vehicle photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError('');

    const token = getAuthToken();
    if (!token) {
      setSubmitError('Authentication token missing. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('service_name', formData.name.trim());
      payload.append('transport_type', formData.type);
      const finalPrice = formData.is_free ? 0 : parseFloat(formData.price_per_KM);
      payload.append('price_per_km', String(finalPrice));
      payload.append('is_free', formData.is_free ? '1' : '0');
      payload.append('route_description', formData.route.trim());
      if (formData.details.trim()) {
        payload.append('service_details', formData.details.trim());
      }
      payload.append('status', formData.status);
      if (imageFile) {
        payload.append('vehicle_photo', imageFile);
      } else if (formData.image) {
        payload.append('vehicle_photo_url', formData.image);
      }

      await apiRequest('/owner/transports', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      navigate('/transport');
    } catch (error: any) {
      const status = error?.status ? `Status ${error.status}` : 'Request failed';
      const message = error?.data?.message ?? error?.message ?? 'Failed to create transport service.';
      setSubmitError(`${status}: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhotoSelected = (file: File) => {

    const looksLikeImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);

    if (!looksLikeImage) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageFile(file);
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: '' }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onPickDocument = (label: string) => {
    setActiveDocument(label);
    documentInputRef.current?.click();
  };

  const onDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocument) return;

    setDocuments((prev) => ({
      ...prev,
      [activeDocument]: file.name,
    }));

    e.target.value = '';
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/transport')}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Add New Transport</h3>
          <p className="text-sm text-slate-500 mt-1">Create a new transport service and publish it to your fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <Truck size={20} className="text-blue-600" />
                Transport Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Service Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.name && 'border border-red-500'
                    )}
                    placeholder="e.g. Phnom Penh Train Station"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Transport Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none"
                  >
                    <option value="Car Rental">Car Rental</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per KM</label>
                  <input
                    name="price_per_KM"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_KM}
                    onChange={(e) => setFormData({ ...formData, price_per_KM: e.target.value })}
                    disabled={formData.is_free}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed",
                      errors.price_per_KM && 'border border-red-500'
                    )}
                    placeholder="e.g. 1.50"
                  />
                  {errors.price_per_KM && <p className="text-xs text-red-500 mt-1">{errors.price_per_KM}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Free Transport</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        is_free: !prev.is_free,
                        price_per_KM: !prev.is_free ? '0' : prev.price_per_KM,
                      }))
                    }
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border",
                      formData.is_free
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200'
                    )}
                  >
                    {formData.is_free ? 'Yes, this transport is free' : 'No, paid transport'}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Route</label>
                  <input
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium",
                      errors.route && 'border border-red-500'
                    )}
                    placeholder="e.g. Phnom Penh (PNH) -> Siem Reap (REP)"
                  />
                  {errors.route && <p className="text-xs text-red-500 mt-1">{errors.route}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Details</label>
                  <input
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 transition-all font-medium"
                    placeholder="e.g. Daily • Airport connections • Checked baggage"
                  />
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => navigate('/transport')}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Add Transport'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <Camera size={18} className="text-blue-600" />
              Vehicle Photo
            </h4>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoSelected(file);
              }}
            />
            <button
              type="button"
              onClick={openPhotoPicker}
              className={cn(
                "relative w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all",
                errors.image
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-slate-200 dark:border-slate-700'
              )}
            >
              {imagePreview ? (
                <img
                  alt="Vehicle preview"
                  src={imagePreview}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <Camera size={30} className="text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Upload your own image</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Click to choose file</p>
                </div>
              )}
              {imagePreview && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              )}
            </button>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {imageFile?.name || 'No image selected'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Choose Image
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Remove
                </button>
              </div>
            </div>
            {errors.image && <p className="mt-3 text-xs text-red-500">{errors.image}</p>}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <FileText size={18} className="text-blue-600" />
              Required Documents
            </h4>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={onDocumentSelected}
            />
            <div className="space-y-4">
              {[
                { label: 'Registration Card', status: 'pending' },
                { label: 'Insurance Policy', status: 'pending' },
                { label: 'Technical Inspection', status: 'pending' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">{doc.label}</span>
                    {documents[doc.label] && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate block mt-1">
                        {documents[doc.label]}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onPickDocument(doc.label)}
                    className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Upload
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-2xl border border-blue-600/10 dark:border-blue-600/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-blue-600 shrink-0" size={20} />
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300 leading-relaxed font-medium">
                <strong>Verification:</strong> New vehicles undergo a 24-hour verification process before they can be assigned to live routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVehicle;
