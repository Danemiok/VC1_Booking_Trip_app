<<<<<<< HEAD
import { getAuthToken } from './authService';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN;
const API_BASE_URL = import.meta.env.DEV
  ? RAW_API_BASE_URL
  : (
      RAW_API_BASE_URL.startsWith('/') && BACKEND_ORIGIN
        ? `${BACKEND_ORIGIN}${RAW_API_BASE_URL}`
        : RAW_API_BASE_URL
    );
=======
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
>>>>>>> 69a0224 (Bufig-Auth)

const AUTH_TOKEN_KEY = 'auth_token';

function getStoredAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredAuthToken();
  const hasAuthHeader = Boolean(
    options?.headers &&
      Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization'),
  );
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const method = (options.method || 'GET').toUpperCase();
  const response = await fetch(`${API_BASE_URL}${path}`, {
<<<<<<< HEAD
    headers,
    cache: method === 'GET' ? 'no-store' : undefined,
    ...options,
=======
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
>>>>>>> 69a0224 (Bufig-Auth)
  });

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message ?? 'Request faileddddddddddd');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Create a wrapper object
export const api = {
  request: apiRequest,
};
