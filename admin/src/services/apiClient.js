import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    try {
        // Prefer Zustand token; fallback to persisted storage
        const { token } = useAuthStore.getState();
        const directToken = token || localStorage.getItem('token');
        if (directToken) {
            config.headers.Authorization = `Bearer ${directToken}`;
        } else {
            const authDataStr = localStorage.getItem('roamsquad-auth');
            if (authDataStr) {
                const authData = JSON.parse(authDataStr);
                const storedToken = authData?.state?.token;
                if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
            }
        }
    } catch (e) {
        console.error('📡 API Auth Interceptor Error:', e);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear store and redirect
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
