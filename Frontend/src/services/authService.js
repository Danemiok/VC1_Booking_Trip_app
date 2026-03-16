import { apiRequest, clearApiAuthToken, getApiAuthToken, setApiAuthToken } from './api';

let cachedUser = null;

export function getAuthToken() {
  return getApiAuthToken();
}

export function setAuthToken(token) {
  setApiAuthToken(token);
}

export function clearAuthToken() {
  clearApiAuthToken();
}

export function getAuthUser() {
  return cachedUser;
}

export function setAuthUser(user) {
  cachedUser = user ?? null;
}

export function clearAuthUser() {
  cachedUser = null;
}

export function getUserRole() {
  return getAuthUser()?.role ?? null;
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export async function login(payload) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
}

export async function register(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.access_token) {
    setAuthToken(data.access_token);
  }

  if (data?.user) {
    setAuthUser(data.user);
  }

  return data;
}

export async function logout() {
  const token = getAuthToken();

  if (!token) {
    return;
  }

  await apiRequest('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  clearAuthToken();
  clearAuthUser();
}

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
};
