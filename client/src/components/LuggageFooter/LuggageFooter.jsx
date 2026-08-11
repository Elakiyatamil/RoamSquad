import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LuggageFooter.css';

const LuggageFooter = ({ onLuggageClick, isPaused = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isMyTripsPage = location.pathname === '/my-trips' || location.pathname === '/my-journeys';

    const handleLuggageClick = (e) => {
        e.stopPropagation();
        if (onLuggageClick) {
            onLuggageClick(e);
        }
    };

    const handleClick = (e) => {
        if (isMyTripsPage) {
            e.preventDefault();
            return;
        }
        navigate('/my-trips');
    };

    const handleKeyDown = (e) => {
        if (isMyTripsPage) return;
        if (e.key === 'Enter') {
            navigate('/my-trips');
        }
    };

    const animStyle = isPaused ? { animationPlayState: 'paused' } : undefined;

    return (
        <div className="luggage-footer-track" style={isMyTripsPage ? { background: 'transparent' } : {}}>
            {/* Track Floor Line — hidden on /my-trips */}
            {!isMyTripsPage && (
                <div className="luggage-track-floor">
                    <div className="luggage-track-rail" />
                </div>
            )}

            {/* Rolling Luggage */}
            <div className={`luggage-track-lane${isMyTripsPage ? ' luggage-track-lane--no-track' : ''}`}>
                <div
                    className={`rolling-container-full${isMyTripsPage ? ' rolling-container-full--slow' : ''} flex flex-col items-center luggage-group ${
                        isMyTripsPage
                            ? onLuggageClick
                                ? 'cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95'
                                : 'luggage-group--static'
                            : 'cursor-pointer group transition-transform duration-200 hover:scale-105 active:scale-95'
                    }`}
                    style={animStyle}
                    onClick={isMyTripsPage ? (onLuggageClick ? handleLuggageClick : undefined) : handleClick}
                    role={isMyTripsPage ? (onLuggageClick ? 'button' : undefined) : 'button'}
                    tabIndex={isMyTripsPage ? (onLuggageClick ? 0 : undefined) : 0}
                    aria-label={isMyTripsPage ? (onLuggageClick ? 'Open Trip Checklist' : undefined) : 'My Trips'}
                    onKeyDown={isMyTripsPage
                        ? onLuggageClick
                            ? (e) => { if (e.key === 'Enter') { e.stopPropagation(); onLuggageClick(e); } }
                            : undefined
                        : handleKeyDown
                    }
                    title={isMyTripsPage ? (onLuggageClick ? 'Open Trip Checklist' : undefined) : 'My Trips'}
                >
                    {/* Luggage Graphic */}
                    <div className={`bobbing-element${isMyTripsPage ? ' bobbing-element--slow' : ''} luggage-body-wrap`} style={animStyle}>
                        {/* Telescoping Handle */}
                        <div className="luggage-handle-rod" />
                        <div className="luggage-handle-grip" />

                        {/* Main Suitcase Body */}
                        <div className="luggage-body">
                            {/* Corner Protectors */}
                            <div className="luggage-corner luggage-corner-tl" />
                            <div className="luggage-corner luggage-corner-tr" />
                            <div className="luggage-corner luggage-corner-bl" />
                            <div className="luggage-corner luggage-corner-br" />

                            {/* Center Zipper */}
                            <div className="luggage-zipper" />

                            {/* Stickers */}
                            <span className="luggage-sticker luggage-sticker-paris">PARIS</span>
                            <span className="luggage-sticker luggage-sticker-london">LONDON</span>

                            {/* Flight Icon Badge */}
                            <span className="luggage-icon-badge material-symbols-outlined">flight</span>

                            {/* Side Handle */}
                            <div className="luggage-side-handle" />
                        </div>

                        {/* Wheels */}
                        <div className="luggage-wheel luggage-wheel-left" />
                        <div className="luggage-wheel luggage-wheel-right" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LuggageFooter;
