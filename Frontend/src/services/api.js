const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const normalizeApiBaseUrl = (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) {
        throw new Error('VITE_API_BASE_URL is required and was not loaded by Vite.');
    }
    const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
    return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};
export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
let authToken = null;
const readStoredToken = () => {
    if (typeof window === 'undefined')
        return null;
    try {
        return window.localStorage.getItem('auth_token');
    }
    catch {
        return null;
    }
};
export const getApiAuthToken = () => {
    if (!authToken) {
        authToken = readStoredToken();
    }
    return authToken;
};
export const setApiAuthToken = (token) => {
    authToken = token ?? null;
};
export const clearApiAuthToken = () => {
    authToken = null;
};
export async function apiRequest(path, options = {}) {
    const token = getApiAuthToken();
    const hasAuthHeader = !!options.headers &&
        Object.keys(options.headers).some((key) => key.toLowerCase() === 'authorization');
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        Accept: 'application/json',
        ...(token && !hasAuthHeader ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            credentials: options.credentials ?? 'include',
            headers,
        });
    }
    catch (cause) {
        const error = new Error(`Failed to reach API at ${API_BASE_URL}. Make sure the Laravel backend is running and CORS allows this origin.`);
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
        }
        catch {
            // Back-end may return HTML in non-production modes (e.g. SQLSTATE stacktrace) -- normalize to friendly message
            const normalizedMessage = typeof rawBody === 'string' && rawBody.includes('SQLSTATE')
                ? 'Database connection failed. Ensure the backend database is running and DB settings are valid.'
                : rawBody;
            data = { message: normalizedMessage };
        }
    }
    if (!response.ok) {
        let errorMessage = data?.message ?? 'Request failed';
        if (typeof errorMessage === 'string' && errorMessage.includes('SQLSTATE')) {
            errorMessage = 'Database connection failed. Ensure the backend and database are running.';
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        error.errors = data?.errors ?? null;
        throw error;
    }
    return data;
}
export const api = {
    request: apiRequest,
};
