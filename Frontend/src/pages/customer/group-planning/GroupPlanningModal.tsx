import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Copy, Plus, UserPlus, X } from 'lucide-react';
import type { Member } from './types';

interface GroupPlanningModalProps {
  isAddingActivity: boolean;
  isCreatingPoll: boolean;
  isMembersOpen: boolean;
  isAddMemberOpen: boolean;
  isCopied: boolean;
  members: Member[];
  newMemberName: string;
  newMemberEmail: string;
  newActivity: { time: string; activity: string; location: string };
  newPoll: { question: string; options: string[] };
  setIsAddingActivity: (value: boolean) => void;
  setIsCreatingPoll: (value: boolean) => void;
  setIsMembersOpen: (value: boolean) => void;
  setIsAddMemberOpen: (value: boolean) => void;
  setNewMemberName: (value: string) => void;
  setNewMemberEmail: (value: string) => void;
  setNewActivity: (value: { time: string; activity: string; location: string }) => void;
  setNewPoll: (value: { question: string; options: string[] }) => void;
  addMemberToGroup: () => void;
  copyToClipboard: () => void;
  handleAddActivity: () => void;
  handleCreatePoll: () => void;
}

export function GroupPlanningModal({
  isAddingActivity,
  isCreatingPoll,
  isMembersOpen,
  isAddMemberOpen,
  isCopied,
  members,
  newMemberName,
  newMemberEmail,
  newActivity,
  newPoll,
  setIsAddingActivity,
  setIsCreatingPoll,
  setIsMembersOpen,
  setIsAddMemberOpen,
  setNewMemberName,
  setNewMemberEmail,
  setNewActivity,
  setNewPoll,
  addMemberToGroup,
  copyToClipboard,
  handleAddActivity,
  handleCreatePoll,
}: GroupPlanningModalProps) {
  const isOpen = isAddingActivity || isCreatingPoll || isMembersOpen || isAddMemberOpen;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isMembersOpen
                  ? 'Members'
                  : isAddMemberOpen
                    ? 'Add Member'
                    : isAddingActivity
                      ? 'Add Activity'
                      : 'New Poll'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingActivity(false);
                  setIsCreatingPoll(false);
                  setIsMembersOpen(false);
                  setIsAddMemberOpen(false);
                }}
                className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isMembersOpen ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMembersOpen(false);
                      setIsAddMemberOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/15"
                  >
                    <UserPlus className="w-4 h-4" /> Add Member
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {isCopied ? 'Copied' : 'Copy invite link'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {members.map((member) => (
                    <div
                      key={member.user_email}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-extrabold text-slate-500">
                          {member.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{member.user_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.user_email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : isAddMemberOpen ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Name</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(event) => setNewMemberName(event.target.value)}
                    placeholder="Friend name"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(event) => setNewMemberEmail(event.target.value)}
                    placeholder="friend@email.com"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMemberOpen(false);
                      setIsMembersOpen(true);
                    }}
                    className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={addMemberToGroup}
                    disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                    className="flex-1 py-5 bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10 dark:disabled:text-slate-500 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xl"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                    {isAddingActivity ? 'Activity Name' : 'Question'}
                  </label>
                  <input
                    type="text"
                    value={isAddingActivity ? newActivity.activity : newPoll.question}
                    onChange={(event) =>
                      isAddingActivity
                        ? setNewActivity({ ...newActivity, activity: event.target.value })
                        : setNewPoll({ ...newPoll, question: event.target.value })
                    }
                    placeholder={isAddingActivity ? 'e.g. Dinner at Pub Street' : 'e.g. Where should we eat?'}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {isAddingActivity ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Time</label>
                      <input
                        type="time"
                        value={newActivity.time}
                        onChange={(event) => setNewActivity({ ...newActivity, time: event.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Location</label>
                      <input
                        type="text"
                        value={newActivity.location}
                        onChange={(event) => setNewActivity({ ...newActivity, location: event.target.value })}
                        placeholder="Location"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Options</label>
                    {newPoll.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(event) => {
                          const nextOptions = [...newPoll.options];
                          nextOptions[index] = event.target.value;
                          setNewPoll({ ...newPoll, options: nextOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                      className="text-xs font-bold text-blue-600 flex items-center gap-2 mt-4"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                )}

                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingActivity(false);
                      setIsCreatingPoll(false);
                    }}
                    className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={isAddingActivity ? handleAddActivity : handleCreatePoll}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xl"
                  >
                    {isAddingActivity ? 'Add Activity' : 'Create Poll'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
