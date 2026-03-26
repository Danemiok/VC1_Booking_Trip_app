import { apiRequest } from './api';

export const tripGroupService = {
  create: async ({ name }) => {
    return apiRequest('/trip-groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  join: async ({ access_code }) => {
    return apiRequest('/trip-groups/join', {
      method: 'POST',
      body: JSON.stringify({ access_code }),
    });
  },

  get: async (groupId) => {
    return apiRequest(`/trip-groups/${encodeURIComponent(String(groupId))}`, {
      method: 'GET',
    });
  },

  sendMessage: async (groupId, { text, attachment }) => {
    return apiRequest(`/trip-groups/${encodeURIComponent(String(groupId))}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, attachment }),
    });
  },
};

