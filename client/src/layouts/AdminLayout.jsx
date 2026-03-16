import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import apiClient from '../services/apiClient';
import { getSocket, disconnectSocket } from '../services/socketService';

const AdminLayout = () => {
    const { isAuthenticated, hydrated, token, login, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Verify session on load
    useEffect(() => {
        const verifySession = async () => {
            if (hydrated && token) {
                try {
                    const response = await apiClient.get('/auth/me');
                    // Refresh user data but keep token
                    login(response.data, token);
                } catch (err) {
                    console.error('Session verification failed:', err);
                    logout();
                    navigate('/login', { replace: true });
                }
            } else if (hydrated && !isAuthenticated) {
                navigate('/login', { replace: true });
            }
        };

        verifySession();
    }, [hydrated, token, isAuthenticated, login, logout, navigate]);

    // Global Socket Init
    useEffect(() => {
        if (isAuthenticated && token) {
            getSocket(token);
            return () => disconnectSocket();
        }
    }, [isAuthenticated, token]);

    if (!hydrated) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-cream">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-red border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-cream font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
