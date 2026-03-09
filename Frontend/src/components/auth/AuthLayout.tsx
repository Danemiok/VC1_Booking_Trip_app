import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  title: string;
  subtitle: string;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  onBack,
  title,
  subtitle,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]"
      >
        {/* Left Side: Image & Branding */}
        <div className="hidden md:flex md:w-1/2 relative bg-emerald-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1569660072562-47a003366792?auto=format&fit=crop&q=80&w=2000"
            alt="Angkor Wat with Vibrant Green Field"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="relative z-10 p-12 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1569660072562-47a003360691?auto=format&fit=crop&q=80&w=200" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Komrong Explorer</span>
            </div>

            <div className="max-w-md">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-white leading-tight mb-6"
              >
                Your next adventure begins here.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg leading-relaxed"
              >
                Explore the hidden gems of the world with the most trusted travel partner.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col relative">
          <button 
            onClick={onBack}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center">{subtitle}</p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex mb-8">
            <button
              onClick={() => onTabChange('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onTabChange('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          <div className="flex-1">
            {children}
          </div>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <span className="relative px-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-widest">
                {activeTab === 'login' ? 'Social Login' : 'or register with'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeTab === 'login' ? 'By continuing, you agree to our ' : 'By registering, you agree to our '}
              <a href="#" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Terms of Service</a>
              {' and '}
              <a href="#" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
