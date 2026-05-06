import { apiRequest, clearApiAuthToken, getApiAuthToken, setApiAuthToken } from './api';
const STORAGE_KEYS = {
    token: 'auth_token',
    user: 'auth_user',
};
const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const readStorage = (key) => {
    if (!canUseStorage())
        return null;
    try {
        return window.localStorage.getItem(key);
    }
    catch {
        return null;
    }
};
const writeStorage = (key, value) => {
    if (!canUseStorage())
        return;
    try {
        window.localStorage.setItem(key, value);
    }
    catch {
        // Ignore storage errors (e.g. private mode).
    }
};
const removeStorage = (key) => {
    if (!canUseStorage())
        return;
    try {
        window.localStorage.removeItem(key);
    }
    catch {
        // Ignore storage errors.
    }
};
let cachedUser = null;
const hydrateAuthFromStorage = () => {
    const storedToken = readStorage(STORAGE_KEYS.token);
    if (storedToken) {
        setApiAuthToken(storedToken);
    }
    const storedUser = readStorage(STORAGE_KEYS.user);
    if (storedUser) {
        try {
            cachedUser = JSON.parse(storedUser);
        }
        catch {
            cachedUser = null;
        }
    }
};
hydrateAuthFromStorage();
export const getAuthToken = () => getApiAuthToken();
export const setAuthToken = (token) => {
    setApiAuthToken(token);
    if (token) {
        writeStorage(STORAGE_KEYS.token, token);
    }
    else {
        removeStorage(STORAGE_KEYS.token);
    }
};
export const clearAuthToken = () => {
    clearApiAuthToken();
    removeStorage(STORAGE_KEYS.token);
};
export const getAuthUser = () => cachedUser;
export const setAuthUser = (user) => {
    cachedUser = user ?? null;
    if (cachedUser) {
        writeStorage(STORAGE_KEYS.user, JSON.stringify(cachedUser));
    }
    else {
        removeStorage(STORAGE_KEYS.user);
    }
};
export const clearAuthUser = () => {
    cachedUser = null;
    removeStorage(STORAGE_KEYS.user);
};
export const getUserRole = () => getAuthUser()?.role ?? null;
export const isAuthenticated = () => Boolean(getAuthToken());
export const login = async (payload) => {
    const normalizedPayload = {
        ...payload,
        email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
    };
    const data = await apiRequest('/auth/login', {
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
export const register = async (payload) => {
    const normalizedPayload = {
        ...payload,
        email: typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : payload?.email,
    };
    const data = await apiRequest('/auth/register', {
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
        }
        catch {
            // Ignore logout API errors; still clear local state.
        }
    }
    clearAuthToken();
    clearAuthUser();
    try {
        sessionStorage.removeItem('pending_message_thread');
    }
    catch {
        // Ignore storage errors during cleanup.
    }
};
export const fetchCurrentUser = async () => {
    const data = await apiRequest('/auth/user', {
        method: 'GET',
    });
    if (data?.user) {
        setAuthUser(data.user);
    }
    return data;
};
export const authService = {
    login,
    register,
    logout,
    fetchCurrentUser,
    getAuthToken,
    getAuthUser,
    setAuthUser,
    clearAuthUser,
    getUserRole,
    clearAuthToken,
    isAuthenticated,
    setAuthToken,
};
