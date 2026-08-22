import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import usePlannerStore from '../../store/usePlannerStore';
// Store action accessed outside hook via getState() — Zustand's vanilla API
import './GashaponModal.css';
import SettingsIcon from './SettingsIcon';
// Audio SFX removed from Gachapon flow per product decision.
// audioEffects.js is retained for other app consumers.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const CAPSULE_COLORS = ['#ffb4ab', '#fed01b', '#bee9ff', '#f4a261', '#ffdad6'];

/* ── SVG Capsule Ball ─────────────────────────────────────────────── */
const CapsuleSVG = ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" fill={color} r="45" />
        <path d="M5 50 h90" stroke="white" strokeWidth="5" />
        <circle cx="50" cy="50" fill="white" r="14" />
        {/* Shine highlight */}
        <ellipse cx="38" cy="32" rx="11" ry="7" fill="white" opacity="0.35" transform="rotate(-20 38 32)" />
    </svg>
);

/* ── Capsules inside globe — idle float ───────────────────────────── */
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

/* ── Capsules inside globe — shaking ──────────────────────────────── */
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

/* ── Destination Reveal Image — shows coverImage + no sub-entities ── */
const RevealImage = ({ imageUrl, title }) => {
    const [hasError, setHasError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const FALLBACK = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800';

    return (
        <div className="w-full h-48 bg-[#bee9ff] relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-t-2xl border-b-4 border-[#fbdbd7]">
            {imageUrl && !hasError ? (
                <>
                    {!loaded && (
                        <span
                            className="material-symbols-outlined text-[72px] text-[#335e72] opacity-40 absolute"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            landscape
                        </span>
                    )}
                    <img
                        src={imageUrl}
                        alt={title || 'Destination'}
                        onLoad={() => setLoaded(true)}
                        onError={() => { setHasError(true); setLoaded(true); }}
                        className="w-full h-full object-cover rounded-t-2xl relative z-0 transition-opacity duration-300"
                        style={{ opacity: loaded ? 1 : 0 }}
                    />
                </>
            ) : (
                <img
                    src={FALLBACK}
                    alt="Destination"
                    className="w-full h-full object-cover rounded-t-2xl"
                />
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
════════════════════════════════════════════════════════════════════ */
const GashaponModal = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState('IDLE'); // IDLE | INSERTING | SHAKING | DISPENSED | REVEALED
    const [destination, setDestination] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

    /* Body scroll lock */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* Reset on close */
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

    /* Fetch random destination (only name + coverImage needed) */
    const fetchDestination = useCallback(async () => {
        try {
            setFetchError(null);
            const res = await axios.get(`${API_BASE}/public/destinations/gashapon`);
            if (res.data?.success && res.data.data) {
                setDestination(res.data.data);
            } else {
                throw new Error('Unexpected response');
            }
        } catch (err) {
            console.error('[Gashapon] fetch error:', err);
            setDestination({
                id: 'fallback',
                title: 'Mystery Escape',
                tagline: 'Adventure Awaits',
                imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800',
                destinationSlug: 'gokarna',
            });
            setFetchError('Offline mode — loot unlocked!');
        }
    }, []);

    /* ── Coin Insert ─── */
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

    /* ── Capsule tap ─── */
    const handleCapsuleTap = () => {
        if (phase === 'DISPENSED') {
            setPhase('REVEALED');
        }
    };

    /* ── Dial click ─── */
    const handleDialClick = () => {
        if (phase === 'IDLE') {
            handleCoinInsert();
        }
    };

    /* ── Explore destination ─── */
    const handleExplore = () => {
        if (destination?.destinationSlug) {
            onClose();
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

    /* ── Reset ─── */
    const handleReset = () => {
        setPhase('IDLE');
        setDestination(null);
        setFetchError(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                /* ── Backdrop overlay ── */
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    style={{ overflow: 'hidden' }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    {/* ── Modal Outer Container ── */}
                    <motion.div
                        className="relative w-full max-w-[400px] bg-[#7ec8e3] rounded-[20px] p-5 flex flex-col items-center justify-between overflow-hidden shadow-2xl border-4 border-white/30 box-border gashapon-modal gashapon-modal-canvas"
                        style={{ height: '520px', maxHeight: '90vh' }}
                        initial={{ scale: 0.88, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/40 transition-all z-50 cursor-pointer"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        {/* ── Machine View ── */}
                        <div className="w-full flex flex-col items-center justify-between" style={{ height: '100%' }}>

                            {/* ── Gashapon Machine Container ── */}
                            <div className="relative flex flex-col items-center justify-center" style={{ flex: '1 1 auto', width: '100%' }}>
                                <div className="relative flex flex-col items-center" style={{ width: '240px' }}>

                                    {/* Isometric Shadow */}
                                    <div className="gashapon-iso-shadow absolute bottom-[-14px] w-52 h-16 z-0 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col" style={{ width: '220px' }}>

                                        {/* ── Globe (capsule container) ── */}
                                        <motion.div
                                            className="relative w-full bg-white/30 backdrop-blur-sm border-4 border-[#a1cde3] rounded-t-3xl border-b-0 overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] z-20"
                                            style={{ height: '140px' }}
                                            animate={
                                                phase === 'SHAKING'
                                                    ? { x: [-3, 3, -3, 3, -2, 2, 0], y: [-1, 1, -1, 1, 0] }
                                                    : {}
                                            }
                                            transition={{ repeat: phase === 'SHAKING' ? Infinity : 0, duration: 0.1 }}
                                        >
                                            {/* Shine */}
                                            <div className="absolute top-2 left-2 w-12 h-5 bg-white/40 rounded-full" style={{ transform: 'rotate(-30deg)' }} />

                                            {/* Capsules */}
                                            <div className="absolute bottom-2 w-full flex flex-wrap justify-center items-end gap-1.5 px-3" style={{ height: '100px' }}>
                                                {phase === 'SHAKING' ? <GlobeCapsulesShaking /> : <GlobeCapsulesIdle />}
                                            </div>
                                        </motion.div>

                                        {/* ── Yellow Divider Band ── */}
                                        <div className="w-[104%] ml-[-2%] h-6 bg-[#f4a261] rounded-sm shadow-[0_3px_0_#735c00] z-30 relative flex items-center justify-center">
                                            <div className="w-[86%] h-1.5 bg-[#eec200] rounded-full" />
                                        </div>

                                        {/* ── Red Base Body ── */}
                                        <div className="w-full bg-[#e63946] rounded-b-xl shadow-[0_6px_0_#ba1a1a] z-10 relative flex flex-col items-center" style={{ height: '180px', paddingTop: '10px' }}>

                                            {/* Controls Row: Coin Slot + Gear Dial */}
                                            <div
                                                className="flex items-center justify-between"
                                                style={{ width: '82%', marginTop: '4px' }}
                                            >
                                                {/* ── Coin Slot ── */}
                                                <div
                                                    className="flex flex-col items-center justify-center bg-[#fbdbd7] rounded-lg border-2 border-[#e6bdb8] shadow-inner"
                                                    style={{ width: '52px', height: '60px' }}
                                                >
                                                    {/* Slot slit */}
                                                    <div className="w-1 h-7 bg-[#5c403c] rounded-full shadow-inner" />
                                                    {/* Bottom label */}
                                                    <p
                                                        className="text-[8px] font-bold text-[#5c403c] uppercase tracking-wide mt-1"
                                                        style={{ fontFamily: 'Quicksand, sans-serif' }}
                                                    >
                                                        COIN
                                                    </p>
                                                </div>

                                                {/* ── Gear Dial ── */}
                                                <div
                                                    id="gashapon-crank-trigger"
                                                    onClick={handleDialClick}
                                                    className="rounded-full border-4 border-[#f4a261] shadow-[0_4px_0_#a36b00] flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform select-none"
                                                    style={{
                                                        width: '64px',
                                                        height: '64px',
                                                        background: '#fff8f0',
                                                        /* clip any gear tooth that might overflow the circle */
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                    }}
                                                    title="Turn the dial!"
                                                >
                                                    {/* Rotating gear icon — transform-origin strictly center */}
                                                    <motion.div
                                                        style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#f4a261',
                                                            transformOrigin: 'center center',
                                                            flexShrink: 0,
                                                        }}
                                                        animate={phase === 'SHAKING' ? { rotate: 360 } : { rotate: 0 }}
                                                        transition={{
                                                            repeat: phase === 'SHAKING' ? Infinity : 0,
                                                            repeatType: 'loop',
                                                            duration: 1.6,
                                                            ease: 'linear',
                                                        }}
                                                    >
                                                        <SettingsIcon />
                                                    </motion.div>

                                                    {/* Center axle dot — non-rotating, on top */}
                                                    <div
                                                        className="absolute rounded-full pointer-events-none"
                                                        style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            background: '#e63946',
                                                            border: '1.5px solid #ba1a1a',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: 10,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* ── Dispense Tray ── */}
                                            <div
                                                className="absolute bottom-2 bg-[#3f2c29] rounded-t-lg border-t-4 border-l-4 border-r-4 border-[#f4a261] flex items-end justify-center overflow-hidden shadow-inner"
                                                style={{ width: '100px', height: '58px', paddingBottom: '6px' }}
                                            >
                                                <div className="w-full h-full bg-black/40 absolute inset-0 rounded-t-md" />
                                                <AnimatePresence>
                                                    {(phase === 'DISPENSED' || phase === 'REVEALED') && (
                                                        <motion.div
                                                            className="relative z-10 cursor-pointer"
                                                            style={{ width: '38px', height: '38px' }}
                                                            initial={{ y: -60, scale: 0.5, opacity: 0 }}
                                                            animate={{ y: 0, scale: 1, opacity: phase === 'REVEALED' ? 0 : 1 }}
                                                            transition={{ type: 'spring', bounce: 0.6, duration: 0.7 }}
                                                            onClick={handleCapsuleTap}
                                                            whileHover={{ scale: 1.12 }}
                                                            whileTap={{ scale: 0.94 }}
                                                        >
                                                            <CapsuleSVG color="#f4a261" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Coin animation when inserting ── */}
                            {phase === 'INSERTING' && (
                                <motion.div
                                    className="fixed w-12 h-12 bg-[#f4a261] rounded-full flex items-center justify-center border-2 border-[#d48c00] z-50 pointer-events-none shadow-lg"
                                    initial={{ bottom: '3rem', left: '50%', x: '-50%' }}
                                    animate={{
                                        bottom: ['3rem', '22rem', '18rem'],
                                        left: ['50%', '39%', '43%'],
                                        scale: [1, 1.15, 0.4],
                                        opacity: [1, 1, 0],
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                >
                                    <span className="font-bold text-[#231b00] text-lg" style={{ fontFamily: 'Quicksand, sans-serif' }}>$</span>
                                </motion.div>
                            )}

                            {/* ── Bottom: Coin button (IDLE only) or status hint ── */}
                            <div className="flex flex-col items-center gap-1.5" style={{ paddingBottom: '4px', marginTop: 'auto', flexShrink: 0 }}>
                                {phase === 'IDLE' && (
                                    <>
                                        <button
                                            id="gashapon-insert-coin-btn"
                                            onClick={handleCoinInsert}
                                            className="btn-3d gashapon-btn-3d bg-[#e99c43] rounded-full flex items-center justify-center border-4 border-[#c87e2a] focus:outline-none cursor-pointer z-40 shadow-md"
                                            style={{ width: '52px', height: '52px' }}
                                        >
                                            <div className="btn-3d-bottom gashapon-btn-3d-bottom rounded-full" />
                                            <div className="btn-3d-face gashapon-btn-3d-face rounded-full bg-[#e99c43] flex items-center justify-center border-2 border-[#c87e2a]">
                                                <span className="text-[#5c3a10] text-xl font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>$</span>
                                            </div>
                                        </button>
                                        <p className="text-xs uppercase tracking-widest text-[#2c586e] font-bold animate-pulse" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                            TAP THE COIN
                                        </p>
                                    </>
                                )}
                                {phase === 'DISPENSED' && (
                                    <p className="text-xs uppercase tracking-widest text-[#2c586e] font-bold animate-bounce" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                        🎲 TAP THE CAPSULE!
                                    </p>
                                )}
                                {phase === 'SHAKING' && (
                                    <p className="text-xs uppercase tracking-widest text-[#2c586e] font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                        ✨ LOADING YOUR FATE...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════
                            DESTINATION REVEAL CARD OVERLAY
                        ══════════════════════════════════════════════════════ */}
                        <AnimatePresence>
                            {phase === 'REVEALED' && (
                                <motion.div
                                    className="absolute inset-0 z-50 flex items-center justify-center rounded-[20px]"
                                    style={{
                                        background: 'rgba(0,0,0,0.55)',
                                        backdropFilter: 'blur(4px)',
                                        WebkitBackdropFilter: 'blur(4px)',
                                        padding: '20px',
                                        boxSizing: 'border-box',
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <motion.div
                                        className="w-full bg-[#fff8f7] rounded-[20px] border-4 border-[#916f6b] shadow-[0_8px_0_rgba(92,64,60,1)] flex flex-col overflow-hidden"
                                        style={{ maxWidth: '300px', maxHeight: '100%' }}
                                        initial={{ scale: 0.82, y: 36 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ type: 'spring', bounce: 0.38, duration: 0.5 }}
                                    >
                                        {/* Destination Cover Image — scenic landscape only */}
                                        <RevealImage
                                            imageUrl={destination?.imageUrl}
                                            title={destination?.title}
                                        />

                                        {/* Destination Name + Buttons */}
                                        <div
                                            className="flex flex-col items-center justify-center text-center"
                                            style={{ padding: '20px 20px 24px', flex: '1 1 auto' }}
                                        >
                                            {fetchError && (
                                                <p
                                                    className="text-xs text-[#916f6b] mb-2"
                                                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                                                >
                                                    {fetchError}
                                                </p>
                                            )}

                                            {/* Destination Name — ONLY destination name, no activities */}
                                            <h2
                                                className="font-bold text-[#281715] uppercase tracking-wider"
                                                style={{
                                                    fontFamily: 'Quicksand, sans-serif',
                                                    fontSize: '1.1rem',
                                                    lineHeight: '1.3',
                                                    marginBottom: '6px',
                                                    marginTop: '0',
                                                }}
                                            >
                                                {destination?.title || 'MYSTERY DESTINATION'}
                                            </h2>

                                            {/* Category tagline */}
                                            {destination?.tagline && (
                                                <p
                                                    className="text-[#916f6b] text-xs mb-1"
                                                    style={{ fontFamily: 'Quicksand, sans-serif', fontStyle: 'italic' }}
                                                >
                                                    {destination.tagline}
                                                </p>
                                            )}

                                            {/* Action Buttons — neat spacing, not overflowing */}
                                            <div
                                                className="w-full flex flex-col items-center"
                                                style={{ gap: '10px', marginTop: '16px' }}
                                            >
                                                {/* EXPLORE DESTINATION */}
                                                <button
                                                    onClick={handleExplore}
                                                    disabled={!destination?.destinationSlug}
                                                    className="btn-3d gashapon-btn-3d focus:outline-none relative cursor-pointer select-none"
                                                    style={{ width: '100%', maxWidth: '220px', height: '42px', borderRadius: '12px', background: '#2a9d8f' }}
                                                >
                                                    <div className="btn-3d-bottom gashapon-btn-3d-bottom" style={{ borderRadius: '12px', background: '#21867a' }} />
                                                    <div
                                                        className="btn-3d-face gashapon-btn-3d-face flex items-center justify-center"
                                                        style={{ borderRadius: '12px', background: '#2a9d8f', border: '1px solid #3eb4a4' }}
                                                    >
                                                        <span
                                                            className="font-bold text-white uppercase tracking-wider"
                                                            style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '0.72rem' }}
                                                        >
                                                            Explore Destination
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* INSERT COIN AGAIN */}
                                                <button
                                                    onClick={handleReset}
                                                    className="btn-3d gashapon-btn-3d focus:outline-none relative cursor-pointer select-none"
                                                    style={{ width: '100%', maxWidth: '220px', height: '38px', borderRadius: '12px', background: '#fbdbd7' }}
                                                >
                                                    <div className="btn-3d-bottom gashapon-btn-3d-bottom" style={{ borderRadius: '12px', background: '#e6bdb8' }} />
                                                    <div
                                                        className="btn-3d-face gashapon-btn-3d-face flex items-center justify-center"
                                                        style={{ borderRadius: '12px', background: '#fbdbd7', border: '2px solid #e6bdb8' }}
                                                    >
                                                        <span
                                                            className="font-bold text-[#5c403c] uppercase tracking-wider"
                                                            style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '0.68rem' }}
                                                        >
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
