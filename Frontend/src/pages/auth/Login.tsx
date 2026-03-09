import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth, User } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onBack: () => void;
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<User['role']>('customer');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, role);
      onSuccess();
    }
  };

  const demoAccounts = [
    { email: 'admin@komrong.com', role: 'admin' as const, label: 'Admin' },
    { email: 'owner@paradise.com', role: 'owner' as const, label: 'Owner' },
    { email: 'customer@traveler.com', role: 'customer' as const, label: 'Customer' },
  ];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Please enter your details to sign in to your account."
      activeTab="login"
      onTabChange={(tab) => tab === 'register' && onSwitchToRegister()}
      onBack={onBack}
    >
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {demoAccounts.map((acc) => (
          <button
            key={acc.email}
            onClick={() => {
              setEmail(acc.email);
              setRole(acc.role);
              setPassword('password123');
            }}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
              email === acc.email 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500'
            }`}
          >
            {acc.label} Demo
          </button>
        ))}
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <a href="#" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Forgot password?</a>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] mt-4"
        >
          Login to Account
        </button>
      </form>
    </AuthLayout>
  );
};
