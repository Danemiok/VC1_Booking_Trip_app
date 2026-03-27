const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:8000/api';
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const normalizeApiBaseUrl = (value: string) => {
  const trimmed = String(value ?? '').trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

let authToken: string | null = null;

const readStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export const getApiAuthToken = () => {
  if (!authToken) {
    authToken = readStoredToken();
  }
  return authToken;
};
export const setApiAuthToken = (token: string | null) => {
  authToken = token ?? null;
};
export const clearApiAuthToken = () => {
  authToken = null;
};

type ApiOptions = RequestInit;

export async function apiRequest<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getApiAuthToken();
  const hasAuthHeader =
    !!options.headers &&
    Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization');
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    const error: any = new Error(
      `Failed to reach API at ${API_BASE_URL}. Make sure the Laravel backend is running and CORS allows this origin.`,
    );
    error.cause = cause;
    error.status = 0;
    error.data = { message: error.message };
    throw error;
  }

  const rawBody = await response.text();
  let data: any = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  if (!response.ok) {
    const error: any = new Error(data?.message ?? 'Request failed');
    error.status = response.status;
    error.data = data;
    error.errors = data?.errors ?? null;
    throw error;
  }

  return data as T;
}

export const api = {
  request: apiRequest,
};
