import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  clearAuthToken,
  clearAuthUser,
  getAuthToken,
  getAuthUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setAuthUser,
  setAuthToken,
} from '../services/authService.js';

type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'customer' | 'owner';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<{ user: User; nextView: string; token: string }>;
  register: (payload: RegisterPayload) => Promise<{ user: User; nextView: string; token: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: unknown): UserRole | null => {
  const value = String(role ?? '').trim().toLowerCase();
  if (value === 'admin' || value === 'owner' || value === 'customer') {
    return value;
  }
  return null;
};

const mapApiUserToContextUser = (apiUser: any): User | null => {
  if (!apiUser) {
    return null;
  }

  const normalizedRole = normalizeRole(apiUser.role);
  if (!normalizedRole) {
    return null;
  }

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

const clearHandledAuthParams = (params: URLSearchParams) => {
  params.delete('access_token');
  params.delete('auth_user');
  params.delete('next_view');
  params.delete('auth');

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => mapApiUserToContextUser(getAuthUser()));
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  // Debug log on mount and when auth state changes
  useEffect(() => {
    console.log('🔍 AuthProvider initialized');
    console.log('📦 Token from memory:', getAuthToken());
    console.log('👤 User from memory:', getAuthUser());
    console.log('🔑 isAuthenticated:', !!getAuthToken());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const serializedUser = params.get('auth_user');

    if (!accessToken || !serializedUser) {
      return;
    }

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
      console.error('❌ Failed to hydrate OAuth login:', error);
    } finally {
      clearHandledAuthParams(params);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      user: user?.email, 
      role: user?.role, 
      token: token ? 'exists' : 'null',
      isAuthenticated: !!token && !!user
    });
  }, [user, token]);

  const login = async (payload: LoginPayload) => {
    console.log('📡 Login attempt for:', payload.email);
    
    try {
      const data = await loginRequest(payload);
      
      console.log('📡 Login response:', data);
      
      // Get token from response (your API uses access_token)
      const responseToken = data?.access_token;
      
      if (responseToken) {
        console.log('✅ Token received and cached');
        setAuthToken(responseToken);
        setToken(responseToken);
      } else {
        console.warn('⚠️ No token in response');
      }
      
      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        console.error('❌ Invalid user role');
        const error: any = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }
      
      setUser(nextUser);
      setAuthUser(nextUser);
      
      console.log('✅ Login successful:', {
        user: nextUser,
        role: nextUser.role,
        token: responseToken ? 'exists' : 'missing',
        nextView: data?.next_view
      });
      
      return { 
        user: nextUser, 
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken 
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      // If login fails, clear any stale local session to avoid confusing UX.
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

  const register = async (payload: RegisterPayload) => {
    console.log('📡 Register attempt for:', payload.email);
    
    try {
      const data = await registerRequest(payload);
      
      console.log('📡 Register response:', data);
      
      const responseToken = data?.access_token;
      
      if (responseToken) {
        console.log('✅ Token received and cached');
        setAuthToken(responseToken);
        setToken(responseToken);
      }
      
      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        console.error('❌ Invalid user role');
        const error: any = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }
      
      setUser(nextUser);
      setAuthUser(nextUser);
      
      console.log('✅ Register successful:', {
        user: nextUser,
        role: nextUser.role,
        nextView: data?.next_view
      });
      
      return { 
        user: nextUser, 
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken 
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('👋 Logging out');
    try {
      await logoutRequest();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      // logoutRequest already clears cached auth data
      console.log('✅ Logged out successfully');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return null;
      }

      const nextUser = { ...prev, ...updates };
      setAuthUser(nextUser);
      console.log('📝 User updated:', nextUser);
      return nextUser;
    });
  };

  const value = useMemo<AuthContextType>(
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
