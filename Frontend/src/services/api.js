const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const normalizeApiBaseUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    throw new Error('VITE_API_BASE_URL is required and was not loaded by Vite.');
  }
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

let authToken = null;

function readStoredToken() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function getApiAuthToken() {
  if (!authToken) {
    authToken = readStoredToken();
  }
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

  // Build headers once and reuse so we do not overwrite FormData boundaries
  const headers = {
    Accept: 'application/json',
    ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  // Only set JSON content-type when we're not sending FormData. For FormData
  // the browser must set the multipart boundary automatically.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options,
    });
  } catch (cause) {
    const error = new Error(
      `Failed to reach API at ${API_BASE_URL}. Make sure the Laravel backend is running and CORS allows this origin.`,
    );
    error.cause = cause;
    error.status = 0;
    error.data = { message: error.message };
    throw error;
  }

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
    error.errors = data?.errors ?? null;
    throw error;
  }

  return data;
}

// Create a wrapper object
export const api = {
  request: apiRequest,
};
