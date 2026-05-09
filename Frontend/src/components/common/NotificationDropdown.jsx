import React from 'react';
import { motion } from 'motion/react';
import { Bell, UserPlus, Calendar, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../utils/utils';
const notifications = [
    {
        id: '1',
        title: 'New Owner Request',
        description: 'Marc Stevens applied for a mountain lodge business.',
        time: '2 mins ago',
        type: 'user',
        read: false,
    },
    {
        id: '2',
        title: 'Booking Confirmed',
        description: 'Booking #BK-9482 has been paid successfully.',
        time: '45 mins ago',
        type: 'booking',
        read: false,
    },
    {
        id: '3',
        title: 'System Update',
        description: 'Platform maintenance scheduled for Sunday 2 AM.',
        time: '2 hours ago',
        type: 'system',
        read: true,
    },
    {
        id: '4',
        title: 'Security Alert',
        description: '3 failed login attempts detected from IP 12.244.51.9.',
        time: '5 hours ago',
        type: 'alert',
        read: true,
    },
];
export const NotificationDropdown = ({ isOpen, onClose, notifications: notificationsProp, onNotificationClick, onMarkAsRead, onMarkAllAsRead, onViewAll, }) => {
    if (!isOpen)
        return null;
    const [items, setItems] = React.useState(() => notificationsProp ?? notifications);
    React.useEffect(() => {
        if (notificationsProp)
            setItems(notificationsProp);
    }, [notificationsProp]);
    const getIcon = (type) => {
        switch (type) {
            case 'user': return <UserPlus size={16} className="text-emerald-500"/>;
            case 'booking': return <Calendar size={16} className="text-emerald-500"/>;
            case 'system': return <CheckCircle2 size={16} className="text-slate-500"/>;
            case 'alert': return <AlertCircle size={16} className="text-red-500"/>;
            case 'message': return <UserPlus size={16} className="text-indigo-500"/>;
            default: return <Bell size={16}/>;
        }
    };
    const handleMarkAllAsRead = () => {
        if (onMarkAllAsRead)
            onMarkAllAsRead();
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    const handleItemClick = (notif) => {
        if (!notif.read) {
            onMarkAsRead?.(notif.id);
            setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
        }
        onNotificationClick?.(notif);
    };
    const hasUnread = items.some((n) => !n.read);
    const isClickable = Boolean(onNotificationClick);
    return (<>
      <div className="fixed inset-0 z-40" onClick={onClose}/>
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute right-0 mt-2 w-80 sm:w-[31rem] overflow-hidden z-50 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Notifications</h3>
          <div className="flex items-center gap-2">
            {onMarkAllAsRead && (<button onClick={onMarkAllAsRead} disabled={!hasUnread} className={cn("text-[11px] font-bold text-primary hover:underline", !hasUnread && "opacity-50 cursor-not-allowed hover:no-underline")}>
                Mark all as read
              </button>)}
            <button onClick={handleMarkAllAsRead} className="text-[11px] font-bold text-primary hover:underline">Mark all as read</button>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <X size={16}/>
            </button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {items.length > 0 ? (<div className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((notif) => (<div key={notif.id} onClick={() => handleItemClick(notif)} className={cn("px-4 py-3 transition-colors flex gap-3", isClickable
                    ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    : "cursor-default", !notif.read && "bg-primary/5")}>
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", notif.type === 'user' ? "bg-emerald-100 dark:bg-emerald-900/20" :
                    notif.type === 'booking' ? "bg-emerald-100 dark:bg-emerald-900/20" :
                        notif.type === 'alert' ? "bg-red-100 dark:bg-red-900/20" : "bg-slate-100 dark:bg-slate-800")}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-base truncate text-slate-900 dark:text-slate-100", !notif.read ? "font-bold" : "font-semibold")}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-5">
                      {notif.description}
                    </p>
                  </div>
                  {!notif.read && (<div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 flex-shrink-0"/>)}
                </div>))}
            </div>) : (<div className="p-10 text-center">
              <Bell size={32} className="mx-auto text-slate-300 mb-2"/>
              <p className="text-sm text-slate-500">No new notifications</p>
            </div>)}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <button onClick={() => {
            onViewAll?.();
            onClose();
        }} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" type="button">
            View all notifications
          </button>
        </div>
      </motion.div>
    </>);
};

