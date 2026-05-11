/**
 * axiosClient.js
 * A shared Axios instance that:
 *  - Automatically attaches the JWT Bearer token from authStore
 *  - Intercepts 401 responses and logs the user out so stale tokens
 *    don't cause infinite retry loops across the app
 */
import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST: attach token ─────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE: handle 401 (expired / invalid token) ───────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth state so the UI reflects the logged-out status
      const { logout, isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        console.warn('[axiosClient] 401 received — clearing stale auth session.');
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
