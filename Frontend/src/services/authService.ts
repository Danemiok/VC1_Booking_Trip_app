import axios from 'axios';
import { apiRequest, clearApiAuthToken, getApiAuthToken, setApiAuthToken } from './api';

const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
};

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (key: string) => {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (e.g. private mode).
  }
};

const removeStorage = (key: string) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
};

type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
} | null;

let cachedUser: AuthUser = null;

const hydrateAuthFromStorage = () => {
  const storedToken = readStorage(STORAGE_KEYS.token);
  if (storedToken) {
    setApiAuthToken(storedToken);
  }

  const storedUser = readStorage(STORAGE_KEYS.user);
  if (storedUser) {
    try {
      cachedUser = JSON.parse(storedUser);
    } catch {
      cachedUser = null;
    }
  }
};

hydrateAuthFromStorage();

export const getAuthToken = () => getApiAuthToken();

export const setAuthToken = (token: string | null) => {
  setApiAuthToken(token);
  if (token) {
    writeStorage(STORAGE_KEYS.token, token);
  } else {
    removeStorage(STORAGE_KEYS.token);
  }
};

export const clearAuthToken = () => {
  clearApiAuthToken();
  removeStorage(STORAGE_KEYS.token);
};

export const getAuthUser = () => cachedUser;

export const setAuthUser = (user: AuthUser) => {
  cachedUser = user ?? null;
  if (cachedUser) {
    writeStorage(STORAGE_KEYS.user, JSON.stringify(cachedUser));
  } else {
    removeStorage(STORAGE_KEYS.user);
  }
};

export const clearAuthUser = () => {
  cachedUser = null;
  removeStorage(STORAGE_KEYS.user);
};

export const getUserRole = () => getAuthUser()?.role ?? null;

export const isAuthenticated = () => Boolean(getAuthToken());

const ensureCsrfCookie = async () => {
  await axios.get('/sanctum/csrf-cookie');
};

type LoginPayload = { email: string; password: string };
type RegisterPayload = { name?: string; email: string; password: string; password_confirmation?: string };

export const login = async (payload: LoginPayload) => {
  const normalizedPayload = {
    ...payload,
    email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
  };

  await ensureCsrfCookie();
  const data: any = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
};

export const register = async (payload: RegisterPayload) => {
  const normalizedPayload = {
    ...payload,
    email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
  };

  await ensureCsrfCookie();
  const data: any = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
};

export const logout = async () => {
  const token = getAuthToken();

  if (token) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore logout API errors; still clear local state.
    }
  }

  clearAuthToken();
  clearAuthUser();
  try {
    sessionStorage.removeItem('pending_message_thread');
  } catch {
    // Ignore storage errors during cleanup.
  }
};

export const authService = {
  login,
  register,
  logout,
  getAuthToken,
  getAuthUser,
  setAuthUser,
  clearAuthUser,
  getUserRole,
  clearAuthToken,
  isAuthenticated,
  setAuthToken,
};
