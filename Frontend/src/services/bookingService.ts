import { apiRequest, API_BASE_URL } from './api';
import { getAuthToken } from './authService';

type BookingFilters = {
  service?: string;
  status?: string;
  date_range?: string;
  search?: string;
  min_amount?: string | number;
  max_amount?: string | number;
  guest_name?: string;
  booking_id?: string;
};

export const bookingService = {
  getBookings: async (filters: BookingFilters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.service && filters.service !== 'all') queryParams.append('service', filters.service);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.date_range && filters.date_range !== 'all') queryParams.append('date_range', filters.date_range);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.min_amount) queryParams.append('min_amount', String(filters.min_amount));
    if (filters.max_amount) queryParams.append('max_amount', String(filters.max_amount));
    if (filters.guest_name) queryParams.append('guest_name', filters.guest_name);
    if (filters.booking_id) queryParams.append('booking_id', filters.booking_id);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest(`/bookings${queryString}`, { method: 'GET' });
    return { data: response.data || [] };
  },

  createBooking: async (bookingData: any) => {
    const response = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return { success: true, data: response };
  },

  getMyBookings: async () => {
    const response = await apiRequest('/customer/bookings', { method: 'GET' });
    return { data: response.data || [] };
  },

  getCustomerBookings: async (customerId: string | number) => {
    const response = await apiRequest(`/bookings/customer/${customerId}`, { method: 'GET' });
    return { data: response.data || [] };
  },

  getBookingStats: async () => {
    try {
      const response = await apiRequest('/bookings/stats', { method: 'GET' });
      return response;
    } catch (error) {
      return {
        total_bookings: '0',
        active_guests: '0',
        pending_payments: '$0',
      };
    }
  },

  updateBookingStatus: async (bookingId: string | number, status: string) => {
    if (!bookingId) throw new Error('bookingId is required');
    if (!status) throw new Error('status is required');

    const response = await apiRequest(`/bookings/${encodeURIComponent(String(bookingId))}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return {
      success: (response as any)?.success ?? true,
      message: (response as any)?.message,
      data: (response as any)?.data ?? response,
    };
  },

  getOwnerNotifications: async ({ limit = 25, unread = false } = {}) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', String(limit));
    if (unread) queryParams.append('unread', '1');
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    return apiRequest(`/owner/notifications${queryString}`, { method: 'GET' });
  },

  getOwnerUnreadNotificationCount: async () => {
    return apiRequest('/owner/notifications/unread-count', { method: 'GET' });
  },

  markOwnerNotificationRead: async (notificationId: string | number) => {
    if (!notificationId) throw new Error('notificationId is required');
    return apiRequest(`/owner/notifications/${encodeURIComponent(String(notificationId))}/read`, {
      method: 'POST',
    });
  },

  markAllOwnerNotificationsRead: async () => {
    return apiRequest('/owner/notifications/read-all', { method: 'POST' });
  },

  exportBookings: async (filters: BookingFilters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.service && filters.service !== 'all') queryParams.append('service', filters.service);
    if (filters.date_range && filters.date_range !== 'all') queryParams.append('date_range', filters.date_range);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/bookings/export${queryString}`, {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};
