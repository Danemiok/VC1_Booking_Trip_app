import { apiRequest } from './api';

export const hotelService = {
  // Get all active destinations/hotels from database (public - no authentication required)
  getAllHotels: async () => {
    try {
      const response = await apiRequest('/hotels-public', {
        method: 'GET',
      });
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      return { data };
    } catch (error) {
      console.error('Error fetching hotels from API:', error);
      throw error;
    }
  },

  // Get owner's hotels (requires authentication)
  getHotels: async () => {
    try {
      const response = await apiRequest('/hotels', {
        method: 'GET',
      });
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return { data: [] };
    }
  },

  // Create new hotel
  createHotel: async (hotelData) => {
    try {
      const response = await apiRequest('/hotels', {
        method: 'POST',
        body: JSON.stringify(hotelData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  },

  // Update hotel
  updateHotel: async (id, hotelData) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(hotelData),
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  },

  // Delete hotel
  deleteHotel: async (id) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'DELETE',
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  },

  // Get single hotel
  getHotel: async (id) => {
    try {
      const response = await apiRequest(`/hotels/${id}`, {
        method: 'GET',
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching hotel:', error);
      return { data: null };
    }
  }
};
