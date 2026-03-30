import { apiRequest } from './api';

async function requestWithFallback(path, options = {}) {
  try {
    return await apiRequest(path, options);
  } catch (error) {
    if (path.startsWith('/owner/')) {
      const altPath = path.replace('/owner', '');
      return await apiRequest(altPath, options);
    }
    throw error;
  }
}

export const messageService = {
  // Owner endpoints
  getOwnerMessages: async () => {
    return requestWithFallback('/owner/messages');
  },

  getOwnerConversation: async (customerId) => {
    return requestWithFallback(`/owner/messages/${customerId}`);
  },

  sendOwnerMessage: async (payload) => {
    return requestWithFallback('/owner/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getOwnerUnreadCount: async () => {
    return requestWithFallback('/owner/messages/unread-count');
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
