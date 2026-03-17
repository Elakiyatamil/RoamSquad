import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const AdminLayout = () => {
    const location = useLocation();
    // #region agent log
    useEffect(() => {
        fetch('http://localhost:5000/__debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hypothesisId: 'H-ui3',
                location: 'admin/src/layouts/AdminLayout.jsx',
                message: 'AdminLayout mounted',
                data: { path: location.pathname },
            }),
        }).catch(() => { });
    }, [location.pathname]);
    // #endregion agent log

    // #region agent log
    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            fetch('http://localhost:5000/__debug-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hypothesisId: 'H-ui5',
                    location: 'admin/src/layouts/AdminLayout.jsx:postPaint',
                    message: 'AdminLayout post-paint DOM stats',
                    data: {
                        path: location.pathname,
                        bodyChildCount: document.body?.children?.length ?? null,
                        rootChildCount: document.getElementById('root')?.children?.length ?? null,
                        elementCount: document.getElementsByTagName('*')?.length ?? null,
                        viewport: { w: window.innerWidth, h: window.innerHeight },
                    },
                }),
            }).catch(() => { });
        });
        return () => cancelAnimationFrame(raf);
    }, [location.pathname]);
    // #endregion agent log
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
