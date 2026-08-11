import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGashapon } from '../../context/GashaponContext.jsx';
import './GashaponFAB.css';

/**
 * Mobile-only Floating Action Button for the Gashapon machine.
 * Rendered globally (mounted in App.jsx) so it appears on every route.
 * Automatically hides when scrolling near/past the #featured-packages section.
 */
const GashaponFAB = () => {
    const { openGashapon } = useGashapon();
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const el = document.getElementById('featured-packages');
            if (el) {
                const rect = el.getBoundingClientRect();
                // Hide when top of featured-packages section reaches 85% of viewport height
                if (rect.top <= window.innerHeight * 0.85) {
                    setIsHidden(true);
                } else {
                    setIsHidden(false);
                }
            } else {
                setIsHidden(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.button
            className={`gfab ${isHidden ? 'gfab--hidden' : ''}`}
            onClick={openGashapon}
            aria-label="Surprise Me — Spin the Gashapon!"
            whileTap={{ scale: 0.92 }}
        >
            {/* Dice icon with periodic wiggle */}
            <motion.span
                className="gfab-dice"
                animate={{
                    rotate: [0, -12, 12, -8, 8, 0],
                }}
                transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    repeatDelay: 2.8,
                    ease: 'easeInOut',
                }}
                aria-hidden="true"
            >
                🎲
            </motion.span>
            <span className="gfab-label">Surprise Me</span>
        </motion.button>
    );
};

export default GashaponFAB;
