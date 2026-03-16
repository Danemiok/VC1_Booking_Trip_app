import { apiRequest } from './api';

/**
 * Get all promotions for the current owner
 */
export async function getPromotions() {
  const data = await apiRequest('/promotions', {
    method: 'GET',
  });
  return data.data || [];
}

/**
 * Get a single promotion by ID
 */
export async function getPromotion(id) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'GET',
  });
  return data.data;
}

/**
 * Create a new promotion
 */
export async function createPromotion(promotionData) {
  const data = await apiRequest('/promotions', {
    method: 'POST',
    body: JSON.stringify(promotionData),
  });
  return data.data;
}

/**
 * Update an existing promotion
 */
export async function updatePromotion(id, promotionData) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(promotionData),
  });
  return data.data;
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id) {
  const data = await apiRequest(`/promotions/${id}`, {
    method: 'DELETE',
  });
  return data;
}

export const promotionService = {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
};

