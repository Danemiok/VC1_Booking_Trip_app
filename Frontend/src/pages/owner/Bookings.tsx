import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/utils';

const Bookings = () => {
  const navigate = useNavigate();
  const [serviceFilter, setServiceFilter] = React.useState<'all' | 'hotel' | 'transport'>('all');
  const [dateRange, setDateRange] = React.useState<'last1' | 'last3' | 'last7' | 'all'>('last7');
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const addDays = (base: Date, deltaDays: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + deltaDays);
    return next;
  };

  const now = new Date();

  const bookings = [
    { id: 'BK-9921', guest: 'John Doe', service: 'Mekong Villa', route: 'Phnom Penh', dateStart: formatDate(addDays(now, -1)), dateEnd: formatDate(addDays(now, 1)), pax: 2, amount: 185.00, status: 'paid', category: 'hotel' as const },
    { id: 'BK-9922', guest: 'Jane Smith', service: 'Shared Shuttle', route: 'PP — Siem Reap', date: formatDate(addDays(now, -1)), time: '08:00 AM', pax: 1, amount: 15.00, status: 'pending', category: 'transport' as const },
    { id: 'BK-9923', guest: 'Robert Brown', service: 'Luxury Retreat', route: 'Koh Rong', dateStart: formatDate(addDays(now, -3)), dateEnd: formatDate(addDays(now, -1)), pax: 4, amount: 680.00, status: 'paid', category: 'hotel' as const },
    { id: 'BK-9924', guest: 'Emily Davis', service: 'Private SUV', route: 'PP — Kampot', date: formatDate(addDays(now, -7)), time: '09:15 AM', pax: 3, amount: 85.00, status: 'canceled', category: 'transport' as const },
    { id: 'BK-9925', guest: 'Michael Wilson', service: 'Boutique Stay', route: 'Siem Reap', dateStart: formatDate(addDays(now, -10)), dateEnd: formatDate(addDays(now, -8)), pax: 2, amount: 120.00, status: 'paid', category: 'hotel' as const },
  ];

  const parseBookingDate = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isWithinSelectedRange = (value: string) => {
    if (dateRange === 'all') return true;
    const d = parseBookingDate(value);
    if (!d) return true;

    const now = new Date();
    const days = dateRange === 'last7' ? 7 : dateRange === 'last3' ? 3 : 1;
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days);
    return d >= cutoff;
  };

  const filteredBookings = bookings
    .filter((b) => (serviceFilter === 'all' ? true : b.category === serviceFilter))
    .filter((b) => isWithinSelectedRange(b.category === 'hotel' ? (b as any).dateStart : (b as any).date));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  const getPageItems = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const items: Array<number | '...'> = [];
    const add = (v: number | '...') => items.push(v);

    add(1);

    const left = Math.max(2, safeCurrentPage - 1);
    const right = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (left > 2) add('...');
    for (let p = left; p <= right; p++) add(p);
    if (right < totalPages - 1) add('...');

    add(totalPages);
    return items;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bookings', value: '1,240', icon: Calendar, color: 'blue' },
          { label: 'Active Guests', value: '42', icon: Users, color: 'emerald' },
          { label: 'Pending Payments', value: '$1,450', icon: CreditCard, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
              )}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/10 rounded-xl text-sm transition-all" 
              placeholder="Search Booking ID, Guest Name..." 
              type="text"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setServiceFilter('all')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'all'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                All Services
              </button>
              <button
                onClick={() => setServiceFilter('hotel')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'hotel'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                Hotel
              </button>
              <button
                onClick={() => setServiceFilter('transport')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-colors",
                  serviceFilter === 'transport'
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                Transport
              </button>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="appearance-none pl-10 pr-10 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <option value="last1" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 1 Days</option>
                <option value="last3" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 3 Days</option>
                <option value="last7" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">Last 7 Days</option>
                <option value="all" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">All time</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <Filter size={16} /> Filter
              </button>
              <button className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Guest Name</th>
                <th className="px-6 py-4">Service & Route</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Pax</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm text-blue-600">{booking.id}</td>
                  <td className="px-6 py-4 font-bold text-sm">{booking.guest}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{booking.service}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{booking.route}</p>
                  </td>
                  <td className="px-6 py-4">
                    {booking.category === 'hotel' ? (
                      <>
                        <p className="text-sm font-medium">{(booking as any).dateStart}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">End: {(booking as any).dateEnd}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{(booking as any).date}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{(booking as any).time}</p>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">{booking.pax}</td>
                  <td className="px-6 py-4 text-sm font-bold">${booking.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full",
                      booking.status === 'paid' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                      booking.status === 'pending' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                      "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
                    )}>
                      {booking.status === 'paid' ? <CheckCircle2 size={12} /> : booking.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing {filteredBookings.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, filteredBookings.length)} of {filteredBookings.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {getPageItems().map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 inline-flex items-center justify-center text-xs font-bold text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                      page === safeCurrentPage
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    aria-label={`Page ${page}`}
                    aria-current={page === safeCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bookings;
