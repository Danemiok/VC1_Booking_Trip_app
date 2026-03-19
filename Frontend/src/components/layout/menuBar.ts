import { 
  LayoutDashboard,
  Calendar,
  MapPin,
  CreditCard,
  Users,
  Settings,
  FileText,
  Building,
  UserCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users'
  },
  {
    id: 'owners',
    label: 'Owners',
    icon: Building,
    path: '/owners'
  },
  {
    id: 'destinations',
    label: 'Destinations',
    icon: MapPin,
    path: '/destinations'
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: Calendar,
    path: '/bookings'
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: CreditCard,
    path: '/finances'
  }
];

export const SYSTEM_MENU_ITEMS: MenuItem[] = [
  {
    id: 'logs',
    label: 'Audit Logs',
    icon: FileText,
    path: '/logs'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserCircle,
    path: '/profile'
  }
];
