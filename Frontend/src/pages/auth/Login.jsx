import React, { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
export const Login = ({ onSwitchToRegister, onBack, onSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const { login } = useAuth();
    const validateForm = () => {
        const errors = {};
        if (!email.trim()) {
            errors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Invalid email format';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await login({ email, password });
            onSuccess(result.nextView);
        }
        catch (error) {
            // Handle backend validation errors
            if (error.errors) {
                // Set field-specific errors from backend
                setFieldErrors({
                    email: error.errors.email?.[0],
                    password: error.errors.password?.[0],
                });
                setErrorMessage(error.message || 'Login failed');
            }
            else {
                const errorMsg = error.message || 'Invalid credentials';
                setErrorMessage(errorMsg);
                // Highlight fields based on error type
                if (errorMsg.toLowerCase().includes('invalid credentials')) {
                    setFieldErrors({ email: 'Invalid credentials', password: 'Invalid credentials' });
                }
                else if (errorMsg.toLowerCase().includes('email')) {
                    setFieldErrors(prev => ({ ...prev, email: errorMsg }));
                }
                else if (errorMsg.toLowerCase().includes('password')) {
                    setFieldErrors(prev => ({ ...prev, password: errorMsg }));
                }
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<AuthLayout title="Welcome Back" subtitle="Please enter your details to sign in to your account." activeTab="login" onTabChange={(tab) => tab === 'register' && onSwitchToRegister()} onBack={onBack} onClose={onClose}>
      <form className="space-y-3 max-w-sm mx-auto" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-300">Email Address</label>
          <div className="relative group">
            <input type="email" value={email} onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors(prev => ({ ...prev, email: undefined }));
        }} placeholder="Enter your email" required className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-xs outline-none transition-all placeholder:text-slate-400 ${fieldErrors.email
            ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 dark:border-red-400 dark:bg-transparent dark:text-red-400'
            : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'}`}/>
            <Mail className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-primary dark:group-focus-within:text-primary-soft'}`}/>
          </div>
          {fieldErrors.email && (<p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>)}
        </div>

        <div className="space-y-1">
          <div className="ml-1 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Password</label>
          </div>
          <div className="relative group">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors(prev => ({ ...prev, password: undefined }));
        }} placeholder="Enter your password" required className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-xs outline-none transition-all placeholder:text-slate-400 ${fieldErrors.password
            ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 dark:border-red-400 dark:bg-transparent dark:text-red-400'
            : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'}`}/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-400">
              {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
          {fieldErrors.password && (<p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>)}
          <a href="#" className="ml-auto text-xs font-medium text-primary hover:underline dark:text-primary-soft">Forgot password?</a>
        </div>
        {errorMessage && (<div className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-600 dark:text-red-400 max-w-sm mx-auto">
            {errorMessage}
          </div>)}

        <div className="max-w-sm mx-auto block">
          <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-primary hover:bg-primary-soft transition-colors text-white px-6 py-2.5 rounded-3xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </AuthLayout>);
};

