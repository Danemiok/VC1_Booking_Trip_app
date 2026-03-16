import React from 'react';
import {
  Building2,
  Camera,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

type Alert = { type: 'success' | 'error' | 'info'; message: string };

type OwnerProfileForm = {
  name: string;
  email: string;
  phone_number: string;
  avatar: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  business_name: string;
  business_address: string;
  business_registration_number: string;
  tax_id: string;
  business_phone_number: string;
  commision_rate: string;
  payment_terms: '' | 'monthly' | 'per_booking';
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
};

const emptyProfile = (name?: string, email?: string, phone?: string): OwnerProfileForm => ({
  name: name ?? '',
  email: email ?? '',
  phone_number: phone ?? '',
  avatar: '',
  bio: '',
  date_of_birth: '',
  gender: '',
  business_name: '',
  business_address: '',
  business_registration_number: '',
  tax_id: '',
  business_phone_number: '',
  commision_rate: '10%',
  payment_terms: '',
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
});

const OwnerProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = React.useState<OwnerProfileForm>(() =>
    emptyProfile(user?.name, user?.email, user?.phone),
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [alert, setAlert] = React.useState<Alert | null>(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest('/owner/profile');
        const apiUser = response?.user ?? {};
        const profile = response?.profile ?? {};
        setForm({
          ...emptyProfile(apiUser?.name, apiUser?.email, apiUser?.phone_number),
          name: profile?.name ?? apiUser?.name ?? '',
          avatar: profile?.avatar ?? '',
          bio: profile?.bio ?? '',
          date_of_birth: profile?.date_of_birth ?? '',
          gender: profile?.gender ?? '',
          business_name: profile?.business_name ?? '',
          business_address: profile?.business_address ?? '',
          business_registration_number: profile?.business_registration_number ?? '',
          tax_id: profile?.tax_id ?? '',
          business_phone_number: profile?.business_phone_number ?? '',
          commision_rate: profile?.commision_rate ?? '10%',
          payment_terms: profile?.payment_terms ?? '',
          bank_name: profile?.bank_name ?? '',
          bank_account_number: profile?.bank_account_number ?? '',
          bank_account_holder: profile?.bank_account_holder ?? '',
        });
      } catch (error: any) {
        setAlert({ type: 'error', message: error?.data?.message ?? 'Failed to load owner profile.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof OwnerProfileForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setAlert(null);
    try {
      const response = await apiRequest('/owner/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const nextUser = response?.user;
      if (nextUser) {
        updateUser({
          name: nextUser.name ?? form.name,
          email: nextUser.email ?? form.email,
          phone: nextUser.phone_number ?? form.phone_number,
        });
      }
      setAlert({ type: 'success', message: 'Owner profile updated successfully.' });
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)[0] as string[] | string | undefined;
        setAlert({
          type: 'error',
          message: Array.isArray(firstError) ? firstError[0] : 'Failed to save profile.',
        });
      } else {
        setAlert({ type: 'error', message: error?.data?.message ?? 'Failed to save profile.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const avatarPreview =
    form.avatar?.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || user?.name || 'Owner')}&background=0D8ABC&color=fff&size=256`;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <p className="text-sm text-slate-500">Loading owner profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {alert && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            alert.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300'
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Owner Profile</h2>
          <p className="text-sm text-slate-500">Manage your personal and business details.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img
              src={avatarPreview}
              alt="Owner avatar"
              className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Camera size={16} />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Avatar URL</label>
            <input
              value={form.avatar}
              onChange={handleChange('avatar')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={form.name}
                onChange={handleChange('name')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={form.email}
                onChange={handleChange('email')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Date of birth</label>
            <input
              value={form.date_of_birth}
              onChange={handleChange('date_of_birth')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Bio</label>
            <textarea
              value={form.bio}
              onChange={handleChange('bio')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 transition-all min-h-[110px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Building2 size={18} />
          <h3 className="text-lg font-bold">Business Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Business name</label>
            <input
              value={form.business_name}
              onChange={handleChange('business_name')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Business phone</label>
            <input
              value={form.business_phone_number}
              onChange={handleChange('business_phone_number')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Business address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={form.business_address}
                onChange={handleChange('business_address')}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Registration number</label>
            <input
              value={form.business_registration_number}
              onChange={handleChange('business_registration_number')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Tax ID</label>
            <input
              value={form.tax_id}
              onChange={handleChange('tax_id')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <CreditCard size={18} />
          <h3 className="text-lg font-bold">Payout Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Commission rate</label>
            <input
              value={form.commision_rate}
              onChange={handleChange('commision_rate')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Payment terms</label>
            <select
              value={form.payment_terms}
              onChange={handleChange('payment_terms')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="">Select terms</option>
              <option value="monthly">Monthly</option>
              <option value="per_booking">Per booking</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Bank name</label>
            <input
              value={form.bank_name}
              onChange={handleChange('bank_name')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Bank account number</label>
            <input
              value={form.bank_account_number}
              onChange={handleChange('bank_account_number')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Account holder name</label>
            <input
              value={form.bank_account_holder}
              onChange={handleChange('bank_account_holder')}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OwnerProfile;
