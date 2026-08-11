import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import usePlannerStore from '../../store/usePlannerStore';
import './GashaponModal.css';
import SettingsIcon from './SettingsIcon';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const CAPSULE_COLORS = ['#ffb4ab', '#fed01b', '#bee9ff', '#f4a261', '#ffdad6'];

const CapsuleSVG = ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" fill={color} r="45" />
        <path d="M5 50 h90" stroke="white" strokeWidth="5" />
        <circle cx="50" cy="50" fill="white" r="14" />
    </svg>
);

const GlobeCapsulesIdle = () => (
    <>
        {CAPSULE_COLORS.map((color, i) => (
            <motion.div
                key={i}
                className="w-9 h-9"
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 3 + i * 0.4,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeInOut',
                }}
            >
                <CapsuleSVG color={color} />
            </motion.div>
        ))}
    </>
);

const GlobeCapsulesShaking = () => (
    <>
        {CAPSULE_COLORS.map((color, i) => (
            <motion.div
                key={i}
                className="w-9 h-9"
                animate={{
                    y: [0, -40, 10, -18, 0],
                    x: [0, i % 2 === 0 ? 20 : -20, 0],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 0.35 + i * 0.08,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <CapsuleSVG color={color} />
            </motion.div>
        ))}
    </>
);

const RevealImage = ({ imageUrl, title }) => {
    const [hasError, setHasError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="w-full h-40 md:h-44 bg-[#bee9ff] relative flex items-center justify-center border-b-4 border-[#fbdbd7] flex-shrink-0 overflow-hidden">
            {/* Cloud details */}
            <div className="absolute top-4 left-4 w-8 h-4 bg-white rounded-sm shadow-[2px_2px_0_#d1d5db] z-10 pointer-events-none" />
            <div className="absolute top-8 right-8 w-12 h-6 bg-white rounded-sm shadow-[2px_2px_0_#d1d5db] z-10 pointer-events-none" />

            {imageUrl && !hasError ? (
                <>
                    {!loaded && (
                        <span
                            className="material-symbols-outlined text-[72px] text-[#335e72] opacity-50 absolute"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            landscape
                        </span>
                    )}
                    <img
                        src={imageUrl}
                        alt={title || 'Destination'}
                        onLoad={() => setLoaded(true)}
                        onError={() => setHasError(true)}
                        className="w-full h-full object-cover relative z-0"
                        style={{ display: loaded ? 'block' : 'none' }}
                    />
                </>
            ) : (
                <span
                    className="material-symbols-outlined text-[72px] text-[#335e72] opacity-50"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    landscape
                </span>
            )}
        </div>
    );
};

const GashaponModal = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState('IDLE'); // IDLE, INSERTING, SHAKING, DISPENSED, REVEALED
    const [destination, setDestination] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset machine state on close
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setPhase('IDLE');
                setDestination(null);
                setFetchError(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchDestination = useCallback(async () => {
        try {
            setFetchError(null);
            const res = await axios.get(`${API_BASE}/public/destinations/gashapon`);
            if (res.data?.success && res.data.data) {
                setDestination(res.data.data);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {
            console.error('[Gashapon] fetch error:', err);
            setDestination({
                id: 'fallback',
                title: 'Mystery Escape',
                tagline: 'Adventure Awaits',
                imageUrl: null,
                destinationSlug: 'gokarna',
            });
            setFetchError('Offline mode — loot unlocked!');
        }
    }, []);

    const handleCoinInsert = () => {
        if (phase !== 'IDLE') return;
        setPhase('INSERTING');
        fetchDestination();

        setTimeout(() => {
            setPhase('SHAKING');
            setTimeout(() => {
                setPhase('DISPENSED');
            }, 1500);
        }, 800);
    };

    const handleCapsuleTap = () => {
        if (phase === 'DISPENSED') {
            setPhase('REVEALED');
        }
    };

    const handleExplore = () => {
        if (destination?.destinationSlug) {
            onClose(); // Automatically close modal before route transition

            usePlannerStore.getState().updateData({
                destination: {
                    id: destination.id,
                    name: destination.title,
                    slug: destination.destinationSlug,
                    coverImage: destination.imageUrl,
                },
                step: 2,
            });

            navigate(`/planner?destination=${destination.destinationSlug}&step=2`);
        }
    };

    const handleReset = () => {
        setPhase('IDLE');
        setDestination(null);
        setFetchError(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md overflow-y-auto p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    {/* Modal Outer Container */}
                    <motion.div
                        className="relative w-full max-w-[420px] min-h-[500px] h-[520px] bg-[#7ec8e3] rounded-3xl p-6 flex flex-col items-center justify-between overflow-hidden shadow-2xl border-4 border-white/30 box-border gashapon-modal"
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg font-bold border border-white/40 transition-all z-50 cursor-pointer"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        {/* Machine View — Full height flex column to keep layout stable across all phases */}
                        <div className="w-full h-full flex flex-col items-center justify-between py-2">

                            {/* Physical Gashapon Machine Container */}
                            <div className="relative w-64 h-[380px] flex flex-col items-center justify-end z-10">
                                {/* Machine Isometric Shadow */}
                                <div className="gashapon-iso-shadow absolute bottom-[-16px] w-56 h-20 z-0 pointer-events-none" />

                                <div className="relative w-56 h-[350px] z-10 flex flex-col">
                                    {/* Globe */}
                                    <motion.div
                                        className="relative w-full h-40 bg-white/30 backdrop-blur-sm border-4 border-[#a1cde3] rounded-t-3xl border-b-0 overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] z-20"
                                        animate={
                                            phase === 'SHAKING'
                                                ? { x: [-3, 3, -3, 3, -2, 2, 0], y: [-1, 1, -1, 1, 0] }
                                                : {}
                                        }
                                        transition={{ repeat: phase === 'SHAKING' ? Infinity : 0, duration: 0.1 }}
                                    >
                                        <div className="absolute top-2 left-2 w-14 h-6 bg-white/40 rounded-full rotate-[-30deg]" />

                                        <div className="absolute bottom-3 w-full h-28 flex flex-wrap justify-center items-end gap-1.5 px-3">
                                            {phase === 'SHAKING' ? <GlobeCapsulesShaking /> : <GlobeCapsulesIdle />}
                                        </div>
                                    </motion.div>

                                    {/* Divider */}
                                    <div className="w-[104%] ml-[-2%] h-7 bg-[#f4a261] rounded-sm shadow-[0_3px_0_rgba(115,92,0,1)] z-30 relative flex items-center justify-center">
                                        <div className="w-[90%] h-2 bg-[#eec200] rounded-full" />
                                    </div>

                                    {/* Red Base */}
                                    <div className="w-full h-48 bg-[#e63946] rounded-b-xl shadow-[0_6px_0_rgba(186,26,26,1)] z-10 relative flex flex-col items-center pt-3">
                                        <div className="w-[82%] flex justify-between items-start mt-1">
                                            {/* Coin Slot */}
                                            <div className="w-14 h-16 bg-[#fbdbd7] rounded-md border-2 border-[#e6bdb8] shadow-inner flex justify-center items-center relative z-20">
                                                <div className="w-1.5 h-8 bg-[#5c403c] rounded-full shadow-inner" />
                                            </div>

                                            {/* Gear Dial */}
                                            <div className="w-16 h-16 bg-[#fff8f7] rounded-full border-4 border-[#f4a261] shadow-[0_3px_0_rgba(115,92,0,1)] flex items-center justify-center relative">
                                                <motion.div
                                                    className="w-12 h-12 text-[#f4a261] opacity-80 flex items-center justify-center"
                                                    animate={phase === 'SHAKING' ? { rotate: 360 } : { rotate: 0 }}
                                                    transition={{
                                                        repeat: phase === 'SHAKING' ? Infinity : 0,
                                                        duration: 2,
                                                        ease: 'linear',
                                                    }}
                                                >
                                                    <SettingsIcon className="text-[48px]" />
                                                </motion.div>
                                                <div className="absolute w-3.5 h-3.5 bg-[#e63946] rounded-full shadow-inner" />
                                            </div>
                                        </div>

                                        {/* Dispense Tray */}
                                        <div className="absolute bottom-3 w-28 h-16 bg-[#3f2c29] rounded-t-lg rounded-b-sm border-t-4 border-l-4 border-r-4 border-[#f4a261] flex items-end justify-center pb-1.5 shadow-inner overflow-hidden">
                                            <div className="w-full h-full bg-black/40 absolute inset-0 rounded-t-md" />
                                            <AnimatePresence>
                                                {(phase === 'DISPENSED' || phase === 'REVEALED') && (
                                                    <motion.div
                                                        className="w-10 h-10 relative z-10 cursor-pointer"
                                                        initial={{ y: -60, scale: 0.5, opacity: 0 }}
                                                        animate={{ y: 0, scale: 1, opacity: phase === 'REVEALED' ? 0 : 1 }}
                                                        transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                                                        onClick={handleCapsuleTap}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <CapsuleSVG color="#f4a261" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Animated Coin */}
                            {phase === 'INSERTING' && (
                                <motion.div
                                    className="fixed w-14 h-14 bg-[#f4a261] rounded-full flex items-center justify-center border-2 border-[#d48c00] z-50 pointer-events-none shadow-lg"
                                    initial={{ bottom: '4rem', left: '50%', x: '-50%' }}
                                    animate={{
                                        bottom: ['4rem', '24rem', '20rem'],
                                        left: ['50%', '38%', '42%'],
                                        scale: [1, 1.2, 0.4],
                                        opacity: [1, 1, 0],
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                >
                                    <span className="font-bold text-[#231b00] text-xl font-['Quicksand']">$</span>
                                </motion.div>
                            )}

                            {/* Bottom slot — Coin button (IDLE) or spacer (other phases) — keeps layout stable */}
                            <div className="flex flex-col items-center gap-2 mt-auto pb-2">
                                {phase === 'IDLE' && (
                                    <>
                                        <button
                                            onClick={handleCoinInsert}
                                            className="btn-3d gashapon-btn-3d w-14 h-14 bg-[#e99c43] rounded-full flex items-center justify-center border-4 border-[#c87e2a] focus:outline-none cursor-pointer z-40 shadow-md active:translate-y-1 transition-transform"
                                        >
                                            <div className="btn-3d-bottom gashapon-btn-3d-bottom rounded-full" />
                                            <div className="btn-3d-face gashapon-btn-3d-face rounded-full bg-[#e99c43] flex items-center justify-center border-2 border-[#c87e2a]">
                                                <span className="font-['Quicksand'] text-[#5c3a10] text-xl font-bold">$</span>
                                            </div>
                                        </button>
                                        <p className="font-['Quicksand'] text-xs uppercase tracking-widest text-[#2c586e] font-bold animate-pulse">
                                            TAP THE COIN
                                        </p>
                                    </>
                                )}
                            </div>

                        </div>{/* end Machine View */}

                        {/* Reveal Card Overlay */}
                        <AnimatePresence>
                            {phase === 'REVEALED' && (
                                <motion.div
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 box-border rounded-3xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <motion.div
                                        className="w-full max-w-sm bg-[#fff8f7] rounded-2xl border-4 border-[#916f6b] shadow-[0_8px_0_rgba(92,64,60,1)] flex flex-col justify-between overflow-hidden"
                                        initial={{ scale: 0.8, y: 40 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
                                    >
                                        <RevealImage
                                            imageUrl={destination?.imageUrl}
                                            title={destination?.title}
                                        />

                                        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center w-full box-border">
                                            {fetchError && (
                                                <p className="text-xs text-[#916f6b] mb-1 font-['Quicksand']">
                                                    {fetchError}
                                                </p>
                                            )}

                                            <h2 className="font-['Quicksand'] text-xl md:text-2xl font-bold text-[#281715] uppercase tracking-wider mb-3 mt-1">
                                                {destination?.title || 'DESTINATION. 1'}
                                            </h2>

                                            <div className="w-full flex flex-col gap-3 mt-3 mb-1 items-center">
                                                <button
                                                    onClick={handleExplore}
                                                    disabled={!destination?.destinationSlug}
                                                    className="btn-3d gashapon-btn-3d w-full max-w-[220px] h-11 bg-[#2a9d8f] rounded-xl focus:outline-none relative cursor-pointer select-none transition-transform active:scale-95"
                                                >
                                                    <div className="btn-3d-bottom gashapon-btn-3d-bottom rounded-xl bg-[#21867a]" />
                                                    <div className="btn-3d-face gashapon-btn-3d-face rounded-xl bg-[#2a9d8f] flex items-center justify-center border border-[#3eb4a4] px-4 text-center w-full h-full">
                                                        <span className="font-['Quicksand'] font-bold text-white uppercase tracking-wider text-xs md:text-sm">
                                                            Explore Destination
                                                        </span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={handleReset}
                                                    className="btn-3d gashapon-btn-3d w-full max-w-[220px] h-11 bg-[#fbdbd7] rounded-xl focus:outline-none relative cursor-pointer select-none transition-transform active:scale-95"
                                                >
                                                    <div className="btn-3d-bottom gashapon-btn-3d-bottom rounded-xl bg-[#e6bdb8]" />
                                                    <div className="btn-3d-face gashapon-btn-3d-face rounded-xl bg-[#fbdbd7] flex items-center justify-center border-2 border-[#e6bdb8] px-4 text-center w-full h-full">
                                                        <span className="font-['Quicksand'] font-bold text-[#5c403c] uppercase tracking-wider text-xs">
                                                            Insert Coin Again 🎲
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GashaponModal;
