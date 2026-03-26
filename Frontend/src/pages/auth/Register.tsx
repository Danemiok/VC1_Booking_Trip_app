import React, { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
  onSuccess: (nextView: string) => void;
  onClose?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onBack, onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'customer'>('customer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestLogin, setSuggestLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuggestLogin(false);
    setIsSubmitting(true);

    try {
      const result = await register({
        name,
        email,
        password,
        password_confirmation: password,
        role,
      });
      onSuccess(result.nextView);
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors) {
        const emailErrors = fieldErrors?.email as string[] | string | undefined;
        const normalizedEmailError = Array.isArray(emailErrors) ? emailErrors[0] : emailErrors;
        if (typeof normalizedEmailError === 'string' && normalizedEmailError.toLowerCase().includes('taken')) {
          setErrorMessage('This email is already registered. Please login instead.');
          setSuggestLogin(true);
        } else {
          const firstError = Object.values(fieldErrors)[0] as string[] | string | undefined;
          setErrorMessage(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
        }
      } else {
        setErrorMessage(error?.data?.message ?? 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our community of travelers"
      activeTab="register"
      onTabChange={(tab) => tab === 'login' && onSwitchToLogin()}
      onBack={onBack}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-slate-700">Full Name</label>
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-slate-700">Account Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                role === 'customer'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-[0_10px_20px_rgba(0,82,204,0.25)]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                role === 'owner'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-[0_10px_20px_rgba(0,82,204,0.25)]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Owner
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-slate-700">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-slate-700">Create Password</label>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            <p>{errorMessage}</p>
            {suggestLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="mt-2 text-xs font-semibold text-blue-300 hover:underline"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-[0_10px_20px_rgba(0,82,204,0.3)] transition-all active:scale-[0.98] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </AuthLayout>
  );
};
