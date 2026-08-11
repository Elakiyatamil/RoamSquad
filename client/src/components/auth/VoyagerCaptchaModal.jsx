import React, { useState, useEffect, useRef } from 'react';
import './VoyagerCaptchaModal.css';

const INVENTORY_ITEMS = [
  { id: 'shoes', icon: '👟', name: 'Shoes' },
  { id: 'jacket', icon: '🧥', name: 'Jacket' },
  { id: 'dryer', icon: '💨', name: 'Hair Dryer' },
  { id: 'blanket', icon: '🛋️', name: 'Blanket' },
  { id: 'laptop', icon: '💻', name: 'Laptop' },
  { id: 'pepperspray', icon: '🌶️', name: 'Pepper Spray' },
  { id: 'carrots', icon: '🥕', name: 'Bag of Carrots' },
  { id: 'camera', icon: '📷', name: 'DSLR Camera' },
  { id: 'mask', icon: '🙈', name: 'Eye Mask' }
];

const VoyagerCaptchaModal = ({ isOpen, onClose, onVerified }) => {
  const [packedItems, setPackedItems] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isOverweight, setIsOverweight] = useState(false);
  const [weightText, setWeightText] = useState('0.0 kg / 2.0 kg limit');
  const [weightBadgeClass, setWeightBadgeClass] = useState(
    'mb-3 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold border border-slate-200 flex items-center gap-1.5'
  );
  const [message, setMessage] = useState(null);
  const [stateMode, setStateMode] = useState('NORMAL'); // NORMAL, STATE_A, STATE_B, STATE_C, SUCCESS
  const [isShaking, setIsShaking] = useState(false);
  const errorBannerRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setPackedItems([]);
    setIsLocked(false);
    setIsOverweight(false);
    setWeightText('0.0 kg / 2.0 kg limit');
    setWeightBadgeClass(
      'mb-3 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold border border-slate-200 flex items-center gap-1.5'
    );
    setMessage(null);
    setStateMode('NORMAL');
    setIsShaking(false);
  };

  if (!isOpen) return null;

  const handlePackItem = (item) => {
    if (isLocked) return;
    if (packedItems.some(p => p.id === item.id)) return;

    const newPacked = [...packedItems, item];
    setPackedItems(newPacked);
    checkState(newPacked, 'pack', isOverweight);
  };

  const handleUnpackItem = (index) => {
    if (isLocked) return;
    const wasOverweight = isOverweight;
    const newPacked = packedItems.filter((_, i) => i !== index);
    setPackedItems(newPacked);
    checkState(newPacked, 'unpack', wasOverweight);
  };

  const triggerErrorAlert = (errorMessage) => {
    const modal = document.querySelector('#captcha-modal');
    const errorBanner = errorBannerRef.current || document.querySelector('#captcha-error-banner') || document.querySelector('.captcha-error-banner');

    if (errorBanner) {
      if (errorMessage) {
        errorBanner.textContent = errorMessage;
      }
      errorBanner.classList.remove('hidden');

      // 1. Trigger Haptic Vibration Pattern (Double Buzz)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 120]);
        } catch (err) {
          // ignore if non-user gesture restricted
        }
      }

      // 2. Trigger Visual Screen Shake
      if (modal) {
        modal.classList.remove('shake-error');
        // Trigger reflow to restart animation on consecutive errors
        void modal.offsetWidth;
        modal.classList.add('shake-error');

        setTimeout(() => {
          if (modal) modal.classList.remove('shake-error');
        }, 400);
      }

      // 3. Auto-Scroll Error into View
      errorBanner.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  const checkState = (newPacked, action, wasOverweightBefore = false) => {
    if (newPacked.length >= 3) {
      setIsOverweight(true);
      setWeightText('2.1 kg / 2.0 kg limit');
      setWeightBadgeClass(
        'mb-3 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold border border-red-300 flex items-center gap-1.5 shake'
      );
      setMessage({ text: '⚠️ Overweight limit by 0.1 kg! Remove an item.', type: 'error' });
      triggerErrorAlert('⚠️ Overweight limit by 0.1 kg! Remove an item.');
    } else {
      setIsOverweight(false);
      const fakeWeight = (newPacked.length * 0.7).toFixed(1);
      setWeightText(`${fakeWeight} kg / 2.0 kg limit`);
      setWeightBadgeClass(
        'mb-3 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold border border-slate-200 flex items-center gap-1.5'
      );
      setMessage(null);
    }

    if (action === 'unpack' && (wasOverweightBefore || newPacked.length >= 3)) {
      triggerUnderwearTrap();
    }
  };

  const triggerUnderwearTrap = () => {
    setIsLocked(true);
    setWeightText('1.2 kg / 2.0 kg limit');
    setWeightBadgeClass(
      'mb-3 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold border border-slate-200 flex items-center gap-1.5'
    );
    setMessage(null);
    setStateMode('STATE_A');
    triggerErrorAlert('❌ Error: You forgot your underwear!');
  };

  const handleTryAgain = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setStateMode('STATE_B');
    triggerErrorAlert('❌ Verification Failed: System error! Attempt exhausted.');

    setTimeout(() => {
      setStateMode('STATE_C');
    }, 1500);
  };

  const handleBribe = () => {
    const modalEl = document.querySelector('#captcha-modal');
    if (modalEl) {
      modalEl.classList.add('verified-success');
    }

    // Physically unmount / remove game elements from DOM
    const inventoryZone = document.querySelector('#inventory-zone');
    const luggageContainer = document.querySelector('#suitcase-container') || document.querySelector('.suitcase-graphic');
    const footerContainer = document.querySelector('.captcha-footer-container');

    if (inventoryZone) inventoryZone.remove();
    if (luggageContainer) luggageContainer.remove();
    if (footerContainer) footerContainer.remove();

    setStateMode('SUCCESS');
    createMoneyRain();

    setTimeout(() => {
      onVerified();
    }, 1800);
  };

  const createMoneyRain = () => {
    const symbols = ['💵', '🎟️', '💰', '✨', '🎉'];
    for (let i = 0; i < 50; i++) {
      const money = document.createElement('div');
      money.className = 'money-item';
      money.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      money.style.left = `${Math.random() * 100}vw`;
      money.style.animationDuration = `${1.5 + Math.random()}s`;
      money.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(money);

      setTimeout(() => money.remove(), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* CAPTCHA Modal Container */}
      <div
        id="captcha-modal"
        style={stateMode === 'SUCCESS'
          ? { width: 'min(92vw, 480px)', height: 'auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden' }
          : { width: 'min(92vw, 720px)', maxHeight: '88vh', padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflowY: 'auto' }
        }
        className={`rounded-3xl shadow-2xl bg-white border border-slate-100 relative transition-all duration-300 ${
          isShaking ? 'animate-shake' : ''
        } ${stateMode === 'SUCCESS' ? 'verified-success' : ''}`}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors z-20 text-xl font-bold p-1.5 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* GAME UI BODY - Hidden on SUCCESS to prevent elements bleeding under confetti */}
        {stateMode !== 'SUCCESS' && (
          <div id="captcha-modal-body" className="w-full flex flex-col justify-between flex-grow">
            {/* Header */}
            <div className="pb-3 text-center border-b border-slate-100 mb-2 sm:mb-4">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 mb-1 flex items-center justify-center gap-2">
                VERIFICATION REQUIRED 🤖
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Prove you are not a robot by packing your suitcase before saving.
              </p>
            </div>

            {/* Content Area - Single column stack on < 640px, 2 column flex on sm+ */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 items-center justify-between w-full">
              {/* Suitcase & Weight Badge Component Assembly (Left) */}
              <div id="suitcase-container" className="flex flex-col items-center justify-center w-full sm:w-1/2">
                {/* Weight Badge */}
                <div id="weight-badge" className={weightBadgeClass} style={{ marginBottom: '1rem', padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>
                  <span className="material-symbols-outlined text-[16px]">scale</span>
                  <span id="weight-text">{weightText}</span>
                </div>

                {/* Suitcase Body Container */}
                <div className="suitcase-graphic" id="suitcase-graphic">
                  {/* Suitcase Shell */}
                  <div className="suitcase-shell">
                    <div className="suitcase-handle"></div>
                    <div className="suitcase-corner tl"></div>
                    <div className="suitcase-corner tr"></div>
                    <div className="suitcase-corner bl"></div>
                    <div className="suitcase-corner br"></div>
                    {/* Suitcase Interior */}
                    <div className="suitcase-interior" id="suitcase-zone">
                      {packedItems.map((item, index) => (
                        <button
                          key={`${item.id}-${index}`}
                          type="button"
                          className="packed-badge anim-bounce"
                          onClick={() => handleUnpackItem(index)}
                        >
                          <span>{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                          <span className="material-symbols-outlined text-[12px] ml-0.5 text-red-500">close</span>
                        </button>
                      ))}
                    </div>
                    <div className="suitcase-wheel left"></div>
                    <div className="suitcase-wheel right"></div>
                  </div>
                </div>
              </div>

              {/* Inventory Grid Refinement (Right) */}
              <div className="flex flex-col items-center w-full sm:w-1/2">
                <h3 className="inventory-header-title font-label-md text-xs text-slate-500 mb-1.5 uppercase tracking-wider text-center">
                  Inventory
                </h3>
                <div id="inventory-zone" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.65rem', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                  {INVENTORY_ITEMS.map((item) => {
                    const isPacked = packedItems.some((p) => p.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-id={item.id}
                        data-icon={item.icon}
                        data-name={item.name}
                        className={`inventory-item aspect-square bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          isPacked ? 'opacity-30 pointer-events-none' : ''
                        }`}
                        style={{ padding: '0.5rem', borderRadius: '1rem' }}
                        onClick={() => handlePackItem(item)}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight text-center leading-tight mt-1 max-w-full truncate px-1">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer & Trap Overlay Flow */}
            {stateMode === 'NORMAL' && message && (
              <div id="message-banner" ref={errorBannerRef} className="captcha-footer-container w-full flex flex-col items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-100">
                <div
                  id="captcha-error-banner"
                  className={
                    message?.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-4 py-2 rounded-xl text-center max-w-[90%] shadow-sm flex items-center justify-center gap-2'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl text-center max-w-[90%] shadow-sm flex items-center justify-center gap-2'
                  }
                >
                  {message?.text}
                </div>
              </div>
            )}

            {/* State A: Underwear Trap */}
            {stateMode === 'STATE_A' && (
              <div id="state-a-container" ref={errorBannerRef} className="captcha-footer-container" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div id="captcha-error-banner" className="captcha-error-banner" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', textAlign: 'center', maxWidth: '90%' }}>
                  ❌ Error: You forgot your underwear!
                </div>
                <button
                  id="try-again-btn"
                  type="button"
                  className="captcha-action-btn"
                  style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '9999px', cursor: 'pointer', backgroundColor: '#0f172a', color: 'white' }}
                  onClick={handleTryAgain}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* State B: System Error Banner */}
            {stateMode === 'STATE_B' && (
              <div id="state-b-container" ref={errorBannerRef} className="captcha-footer-container" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div id="captcha-error-banner" className="captcha-error-banner" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', textAlign: 'center', maxWidth: '90%' }}>
                  ❌ Verification Failed: System error! Attempt exhausted.
                </div>
              </div>
            )}

            {/* State C: Bribe Button */}
            {stateMode === 'STATE_C' && (
              <div id="state-c-container" className="captcha-footer-container" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  id="bribe-btn"
                  type="button"
                  style={{ fontSize: '0.875rem', padding: '0.65rem 1.5rem', marginBottom: '0.25rem' }}
                  className="rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] max-w-[90%] bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold transform transition-all flex items-center justify-center gap-2 cursor-pointer animate-slide-down-bribe"
                  onClick={handleBribe}
                >
                  🎟️ Bribe the Agent
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clean Isolated Success Screen Container */}
        {stateMode === 'SUCCESS' && (
          <div
            id="success-state-container"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem 1rem', width: '100%' }}
          >
            <div style={{ width: '4rem', height: '4rem', background: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              🎉
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', lineHeight: '1.4', maxWidth: '280px', margin: '0 auto 0.5rem' }}>
              Bribery tells us you are a human!
            </h3>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
              Bon Voyage, Odysseus! ✈️
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoyagerCaptchaModal;
