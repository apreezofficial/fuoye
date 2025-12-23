import axios from 'axios';

// Update Base URL to point to the 'api' directory inside backend
// This effectively makes calls like '/settings.php' resolve to '.../backend/api/settings.php'
const api = axios.create({
    baseURL: 'http://localhost/backend/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Logging for debug
api.interceptors.response.use(
    response => response,
    error => {
        // Defensive logging: avoid accessing properties that may throw and handle circular refs
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key: string, value: any) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) return '[Circular]';
                    seen.add(value);
                }
                return value;
            };
        };

        const safeStringify = (v: any, maxLen = 2000) => {
            try {
                const s = JSON.stringify(v, getCircularReplacer());
                return s.length > maxLen ? s.slice(0, maxLen) + '... (truncated)' : s;
            } catch (e) {
                try {
                    return String(v);
                } catch (_) {
                    return '<unserializable>';
                }
            }
        };

        try {
            if (error && error.response) {
                const resp = error.response;
                const info = {
                    url: error.config && error.config.url ? error.config.url : null,
                    status: resp.status ?? null,
                    statusText: resp.statusText ?? null,
                    data: resp.data ? safeStringify(resp.data, 1000) : null,
                };
                console.error('API Error Response:', safeStringify(info));
            } else if (error && error.request) {
                console.error('API Error - no response received, request:', safeStringify(error.request));
            } else if (error) {
                console.error('API Error Message:', String(error.message || error));
            } else {
                console.error('API Error: unknown error object');
            }
        } catch (e) {
            // Final fallback: log minimal info without touching the original error structure
            try {
                console.error('API Error (fallback):', String(error && error.message ? error.message : error));
            } catch (_) {
                console.error('API Error (unserializable)');
            }
        }

        // GLOBAL AUTHENTICATION GUARD
        // If 401 Unauthorized, clear session and redirect to login
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                // Force redirect to login
                window.location.href = '/login?session=expired';
            }
        }

        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
