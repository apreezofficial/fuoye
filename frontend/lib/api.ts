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
        console.error('API Error:', error.response ? error.response.data : error.message);

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
