import { apiRequest } from './api';

export const messageService = {
  // Owner endpoints
  getOwnerMessages: async () => {
    return apiRequest('/owner/messages');
  },

  getOwnerConversation: async (customerId) => {
    return apiRequest(`/owner/messages/${customerId}`);
  },

  sendOwnerMessage: async (payload) => {
    return apiRequest('/owner/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getOwnerUnreadCount: async () => {
    return apiRequest('/owner/messages/unread-count');
  },

  // Customer endpoints
  getCustomerMessages: async () => {
    return apiRequest('/customer/messages');
  },

  getCustomerConversation: async (ownerId) => {
    return apiRequest(`/customer/messages/${ownerId}`);
  },

  sendCustomerMessage: async (payload) => {
    return apiRequest('/customer/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCustomerUnreadCount: async () => {
    return apiRequest('/customer/messages/unread-count');
  },
};
