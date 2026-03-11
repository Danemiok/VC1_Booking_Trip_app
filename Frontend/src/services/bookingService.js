import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export const bookingService = {
  // Get all bookings with filters
  getBookings: async (filters = {}) => {
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      if (filters.service) queryParams.append('service', filters.service);
      if (filters.date_range) queryParams.append('date_range', filters.date_range);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // FOR TESTING WITH MOCK DATA - Uncomment the line below to use mock data
      // return { data: [] };
      
      // Actual API call
      const response = await apiRequest(`/bookings${queryString}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Return empty data structure on error
      return { data: [] };
    }
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      // FOR TESTING WITH MOCK DATA - Uncomment the line below to use mock data
      // return {};
      
      // Actual API call
      const response = await apiRequest('/bookings/stats', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {};
    }
  },

  // Export bookings to CSV
  exportBookings: async (filters = {}) => {
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      if (filters.service) queryParams.append('service', filters.service);
      if (filters.date_range) queryParams.append('date_range', filters.date_range);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // FOR TESTING WITH MOCK CSV - Uncomment the lines below to use mock CSV
      /*
      const mockCSV = "Booking ID,Guest Name,Service,Amount,Status\nBK-9921,John Doe,Mekong Villa,185.00,paid\nBK-9922,Jane Smith,Shared Shuttle,15.00,pending\nBK-9923,Robert Brown,Luxury Retreat,680.00,paid\nBK-9924,Emily Davis,Private SUV,85.00,canceled\nBK-9925,Michael Wilson,Boutique Stay,120.00,paid";
      return new Blob([mockCSV], { type: 'text/csv' });
      */
      
      // Actual API call for CSV export
      const response = await fetch(`${API_BASE_URL}/bookings/export${queryString}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error exporting bookings:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      // FOR TESTING - Uncomment the line below to use mock success
      // return { success: true };
      
      // Actual API call
      const response = await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return response;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
};