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
<<<<<<<< HEAD:admin/src/services/apiClient.js
        const directToken = localStorage.getItem('token');
        if (directToken) {
            config.headers.Authorization = `Bearer ${directToken}`;
        } else {
            const authDataStr = localStorage.getItem('roamsquad-auth');
            if (authDataStr) {
                const authData = JSON.parse(authDataStr);
                const token = authData?.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
========
        // Use Zustand store's state directly instead of manual localStorage parsing
        const { token } = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
>>>>>>>> origin/main:client/src/services/apiClient.js
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
