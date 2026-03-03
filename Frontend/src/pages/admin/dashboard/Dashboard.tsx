import React from 'react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, 
  Building2,
  CalendarDays, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  UserCheck,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../../utils/utils';

const data = [
  { name: 'JAN', income: 400, expenses: 220 },
  { name: 'FEB', income: 300, expenses: 170 },
  { name: 'MAR', income: 600, expenses: 350 },
  { name: 'APR', income: 450, expenses: 260 },
  { name: 'MAY', income: 900, expenses: 540 },
  { name: 'JUN', income: 700, expenses: 430 },
];

const incomeOverviewData = {
  '1W': [
    { name: 'MON', income: 180, expenses: 90 },
    { name: 'TUE', income: 240, expenses: 120 },
    { name: 'WED', income: 210, expenses: 110 },
    { name: 'THU', income: 310, expenses: 170 },
    { name: 'FRI', income: 350, expenses: 200 },
    { name: 'SAT', income: 280, expenses: 160 },
    { name: 'SUN', income: 260, expenses: 140 },
  ],
  '1M': data,
  '1Y': [
    { name: 'JAN', income: 400, expenses: 220 },
    { name: 'FEB', income: 360, expenses: 200 },
    { name: 'MAR', income: 520, expenses: 300 },
    { name: 'APR', income: 480, expenses: 270 },
    { name: 'MAY', income: 620, expenses: 350 },
    { name: 'JUN', income: 700, expenses: 410 },
    { name: 'JUL', income: 760, expenses: 440 },
    { name: 'AUG', income: 690, expenses: 400 },
    { name: 'SEP', income: 640, expenses: 360 },
    { name: 'OCT', income: 820, expenses: 470 },
    { name: 'NOV', income: 910, expenses: 530 },
    { name: 'DEC', income: 980, expenses: 580 },
  ],
} as const;

const StatCard = ({ title, value, trend, icon: Icon, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "card p-4 text-left w-full",
      onClick && "cursor-pointer hover:border-primary/30 hover:shadow-md"
    )}
  >
    <div className="flex items-start justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
        <Icon size={14} />
      </div>
    </div>
    <div className="mt-2.5">
      <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={cn(
          "text-[11px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5",
          trend > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
        )}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </span>
        <p className="text-[11px] text-slate-400">vs last month</p>
      </div>
    </div>
  </button>
);

interface DashboardProps {
  onOpenTotalUsersDetails?: () => void;
  onOpenTotalOwnersDetails?: () => void;
  onOpenTotalBookingsDetails?: () => void;
  onOpenSystemIncomeDetails?: () => void;
  onOpenOwnerApplicationsDetails?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenTotalUsersDetails,
  onOpenTotalOwnersDetails,
  onOpenTotalBookingsDetails,
  onOpenSystemIncomeDetails,
  onOpenOwnerApplicationsDetails,
}) => {
  const [incomeRange, setIncomeRange] = React.useState<'1W' | '1M' | '1Y'>('1M');
  const incomeData = incomeOverviewData[incomeRange];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Overview</h2>
        <p className="text-slate-500">Real-time platform statistics and user activity monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="24,512" 
          trend={12.5} 
          icon={Users} 
          onClick={onOpenTotalUsersDetails}
        />
        <StatCard 
          title="Total Owners" 
          value="1,842" 
          trend={4.2} 
          icon={Building2} 
          onClick={onOpenTotalOwnersDetails}
        />
        <StatCard 
          title="Total Bookings" 
          value="58,190" 
          trend={18.1} 
          icon={CalendarDays} 
          onClick={onOpenTotalBookingsDetails}
        />
        <StatCard 
          title="System Income" 
          value="$142,840" 
          trend={9.3} 
          icon={Wallet} 
          onClick={onOpenSystemIncomeDetails}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">System Income Overview</h3>
              <p className="text-sm text-slate-500">
                {incomeRange === '1W' && 'Performance for the last 7 days'}
                {incomeRange === '1M' && 'Performance for the last 6 months'}
                {incomeRange === '1Y' && 'Performance for the last 12 months'}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['1W', '1M', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setIncomeRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors',
                    incomeRange === range
                      ? 'bg-white dark:bg-slate-700 text-primary border-slate-200 dark:border-slate-600 shadow-sm'
                      : 'bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-white/70 dark:hover:bg-slate-700/60',
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#0052cc" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Approve Owners</h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">4 Pending</span>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Marc Stevens', business: 'Mountain Lodge', avatar: 'https://i.pravatar.cc/150?u=marc' },
              { name: 'Elena Rossi', business: 'Urban Loft Stay', avatar: 'https://i.pravatar.cc/150?u=elena' },
              { name: 'James Wu', business: 'Island Villas', avatar: 'https://i.pravatar.cc/150?u=james' },
            ].map((owner, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={owner.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-sm font-bold">{owner.name}</p>
                    <p className="text-xs text-slate-500">{owner.business}</p>
                  </div>
                </div>
                <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                  <CheckCircle2 size={20} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenOwnerApplicationsDetails}
            className="w-full mt-2 py-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            View All Applications
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg">Recent User Management</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold">
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold">
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: 'Lilly Dawson', email: 'lilly.d@example.com', role: 'User', status: 'Active', date: 'Oct 24, 2023' },
                { name: 'David Miller', email: 'd.miller@example.com', role: 'Owner', status: 'Pending', date: 'Oct 22, 2023' },
              ].map((user, i) => (
                <tr key={i} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      user.status === 'Active' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : "bg-amber-500")}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{user.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 text-slate-400 hover:text-primary transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

