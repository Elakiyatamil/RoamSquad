import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);

    useEffect(() => {
        const token = searchParams.get('token');
        const userDataStr = searchParams.get('user');

        if (token && userDataStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userDataStr));
                login(user, token);
                
                // Show success and redirect
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 1500);
            } catch (err) {
                console.error('Failed to parse user data:', err);
                navigate('/', { replace: true });
            }
        } else {
            navigate('/', { replace: true });
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-forest rounded-full flex items-center justify-center mb-8 shadow-xl shadow-forest/20"
            >
                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </motion.div>
            <h1 className="text-4xl font-display font-bold text-forest mb-4 italic">Welcome to RoamG</h1>
            <p className="text-forest/50 font-medium max-w-xs">
                Authenticating your journey... you'll be redirected in a moment.
            </p>
        </div>
    );
};

export default AuthSuccess;
