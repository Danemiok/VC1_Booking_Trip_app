import type React from 'react';
import { Plus } from 'lucide-react';
import { normalizeAccessCode } from './storage';

interface GroupPlanningAccessPanelProps {
  accessCode: string;
  error: string | null;
  onAccessCodeChange: (value: string) => void;
  onCreateGroup: () => void;
  onJoinGroup: (event: React.FormEvent) => void;
}

export function GroupPlanningAccessPanel({
  accessCode,
  error,
  onAccessCodeChange,
  onCreateGroup,
  onJoinGroup,
}: GroupPlanningAccessPanelProps) {
  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Secure Planning</h2>

        <div className="space-y-8">
          <button
            onClick={onCreateGroup}
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" /> Create New Group
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
            <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
          </div>

          <form onSubmit={onJoinGroup} className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Access Code</label>
            <input
              type="text"
              value={accessCode}
              onChange={(event) => onAccessCodeChange(normalizeAccessCode(event.target.value))}
              placeholder="ENTER CODE"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-center font-mono text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
            >
              Join Group
            </button>
          </form>

          {error && <p className="text-center text-red-500 text-xs font-bold">{error}</p>}
        </div>
      </div>
    </div>
  );
}
