import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuthToken,
  clearAuthUser,
  fetchCurrentUser,
  getAuthToken,
  getAuthUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setAuthToken,
  setAuthUser,
} from '../services/authService.js';

const AuthContext = createContext(undefined);

const normalizeRole = (role) => {
  const value = String(role ?? '').trim().toLowerCase();
  return value === 'admin' || value === 'owner' || value === 'customer' ? value : null;
};

const mapApiUserToContextUser = (apiUser) => {
  if (!apiUser) return null;

  const normalizedRole = normalizeRole(apiUser.role);
  if (!normalizedRole) return null;

  return {
    id: apiUser.id,
    name: apiUser.name ?? apiUser.email?.split('@')?.[0] ?? 'User',
    email: apiUser.email ?? '',
    role: normalizedRole,
    avatar: apiUser.avatar,
    phone: apiUser.phone,
    location: apiUser.location,
    bio: apiUser.bio,
  };
};

const clearHandledAuthParams = (params) => {
  params.delete('access_token');
  params.delete('auth_user');
  params.delete('next_view');
  params.delete('auth');
  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => mapApiUserToContextUser(getAuthUser()));
  const [token, setToken] = useState(() => getAuthToken());

  useEffect(() => {
    const hydrateFromBackend = async () => {
      const existingToken = getAuthToken();
      if (!existingToken) {
        setUser(null);
        setToken(null);
        return;
      }

      try {
        const data = await fetchCurrentUser();
        const nextUser = mapApiUserToContextUser(data?.user);

        if (!nextUser) {
          throw new Error('Backend returned an invalid user payload.');
        }

        setAuthToken(existingToken);
        setAuthUser(nextUser);
        setToken(existingToken);
        setUser(nextUser);
      } catch (error) {
        console.error('Failed to hydrate backend auth session:', error);
        clearAuthToken();
        clearAuthUser();
        setUser(null);
        setToken(null);
      }
    };

    void hydrateFromBackend();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const serializedUser = params.get('auth_user');

    if (!accessToken || !serializedUser) return;

    try {
      const parsedUser = JSON.parse(serializedUser);
      const nextUser = mapApiUserToContextUser(parsedUser);

      if (!nextUser) {
        throw new Error('OAuth callback returned an invalid user payload.');
      }

      setAuthToken(accessToken);
      setAuthUser(nextUser);
      setToken(accessToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Failed to hydrate OAuth login:', error);
    } finally {
      clearHandledAuthParams(params);
    }
  }, []);

  const login = async (payload) => {
    try {
      const data = await loginRequest(payload);
      const responseToken = data?.access_token;

      if (responseToken) {
        setAuthToken(responseToken);
        setToken(responseToken);
      }

      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        const error = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }

      setUser(nextUser);
      setAuthUser(nextUser);

      return {
        user: nextUser,
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      try {
        clearAuthToken();
        clearAuthUser();
      } catch {
        // ignore
      }
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const data = await registerRequest(payload);
      const responseToken = data?.access_token;

      if (responseToken) {
        setAuthToken(responseToken);
        setToken(responseToken);
      }

      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        const error = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }

      setUser(nextUser);
      setAuthUser(nextUser);

      return {
        user: nextUser,
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken,
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updates };
      setAuthUser(nextUser);
      return nextUser;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!token && !!user,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
