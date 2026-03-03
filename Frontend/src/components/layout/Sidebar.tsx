import React from 'react';
import { 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../utils';
import { MAIN_MENU_ITEMS, SYSTEM_MENU_ITEMS } from './menuBar';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onProfileClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onProfileClick }) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">Komrong Admin</h1>
          <p className="text-xs text-slate-500">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="py-2">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
          {MAIN_MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="py-2">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System</p>
          {SYSTEM_MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div
          role="button"
          tabIndex={0}
          onClick={onProfileClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProfileClick();
            }
          }}
          className="w-full flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          aria-label="Open admin profile"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Alex Rivera</p>
            <p className="text-[10px] text-slate-500 truncate">admin@komrong.com</p>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
