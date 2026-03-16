import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    try {
        const authDataStr = localStorage.getItem('roamsquad-auth');
        if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            const token = authData?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (e) {
        console.error('Failed to parse auth token', e);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('roamsquad-auth');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
