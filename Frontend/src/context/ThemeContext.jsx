import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'theme';
const DARK_MODE_STORAGE_KEY = 'darkMode';
const THEME_CHANGE_EVENT = 'app-theme-change';
const THEME_OPTIONS = ['light', 'dark', 'system'];

const ThemeContext = createContext(undefined);

const getSystemTheme = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = () => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (THEME_OPTIONS.includes(savedTheme)) {
        return savedTheme;
    }

    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (savedDarkMode !== null) {
        return JSON.parse(savedDarkMode) ? 'dark' : 'light';
    }

    return 'system';
};

const applyThemeToDocument = (themePreference, resolvedTheme = themePreference) => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.dataset.theme = themePreference;
    root.dataset.resolvedTheme = resolvedTheme;
};

export const resolveTheme = (themePreference) => {
    if (themePreference === 'system') {
        return getSystemTheme();
    }

    return themePreference;
};

export const applyInitialTheme = () => {
    const themePreference = getInitialTheme();
    applyThemeToDocument(themePreference, resolveTheme(themePreference));
};

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(getInitialTheme);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener?.('change', handleChange);

        return () => mediaQuery.removeEventListener?.('change', handleChange);
    }, []);

    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    useEffect(() => {
        applyThemeToDocument(theme, resolvedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(resolvedTheme === 'dark'));
        window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, {
            detail: { theme, resolvedTheme },
        }));
    }, [theme, resolvedTheme]);

    useEffect(() => {
        const handleThemeChange = (event) => {
            const nextTheme = event.detail?.theme;
            if (THEME_OPTIONS.includes(nextTheme) && nextTheme !== theme) {
                setThemeState(nextTheme);
            }
        };

        window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    }, [theme]);

    const setTheme = useCallback((nextTheme) => {
        if (THEME_OPTIONS.includes(nextTheme)) {
            setThemeState(nextTheme);
        }
    }, []);

    const toggleDarkMode = useCallback(() => {
        setThemeState((current) => {
            const currentResolved = current === 'system' ? resolveTheme(current) : current;
            return currentResolved === 'dark' ? 'light' : 'dark';
        });
    }, []);

    const value = useMemo(() => ({
        theme,
        resolvedTheme,
        isDarkMode: resolvedTheme === 'dark',
        isSystemTheme: theme === 'system',
        setTheme,
        toggleDarkMode,
    }), [theme, resolvedTheme, setTheme, toggleDarkMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }

    return context;
};
