const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:8000/api';
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const normalizeApiBaseUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

let authToken = null;

export function getApiAuthToken() {
  return authToken;
}

export function setApiAuthToken(token) {
  authToken = token ?? null;
}

export function clearApiAuthToken() {
  authToken = null;
}

export async function apiRequest(path, options = {}) {
  const token = getApiAuthToken();
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
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
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
    const error = new Error(data?.message ?? 'Request failed');
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
