import React, { useState, useEffect } from 'react';
import './VoyagerCaptchaModal.css';

const INVENTORY_ITEMS = [
  { id: 'shoes',       icon: '👟', name: 'Shoes',        weight: 0.7 },
  { id: 'jacket',      icon: '🧥', name: 'Jacket',       weight: 0.9 },
  { id: 'dryer',       icon: '💨', name: 'Hair Dryer',   weight: 0.6 },
  { id: 'blanket',     icon: '🛋️', name: 'Blanket',      weight: 0.8 },
  { id: 'laptop',      icon: '💻', name: 'Laptop',       weight: 1.2 },
  { id: 'pepperspray', icon: '🌶️', name: 'Pepper Spray', weight: 0.3 },
  { id: 'carrots',     icon: '🥕', name: 'Carrots',      weight: 0.4 },
  { id: 'camera',      icon: '📷', name: 'Camera',       weight: 0.7 },
  { id: 'mask',        icon: '🙈', name: 'Eye Mask',     weight: 0.2 },
];

const WEIGHT_LIMIT   = 2.0;
const MAX_SELECTION  = 3;

const VoyagerCaptchaModal = ({ isOpen, onClose, onVerified }) => {
  const [packedItems, setPackedItems] = useState([]);
  const [stateMode, setStateMode]     = useState('NORMAL'); // NORMAL | ALERT | SUCCESS

  useEffect(() => { if (isOpen) resetState(); }, [isOpen]);

  const resetState = () => { setPackedItems([]); setStateMode('NORMAL'); };

  if (!isOpen) return null;

  const currentWeight = packedItems.reduce((s, i) => s + i.weight, 0);
  const progressPct   = Math.min(100, Math.round((currentWeight / WEIGHT_LIMIT) * 100));
  const barColor      = progressPct >= 100 ? '#ef4444' : progressPct > 65 ? '#f59e0b' : '#10b981';

  // Explicit overlay guard: ONLY show when 3 items are packed AND in ALERT mode
  const showOverlay = stateMode === 'ALERT' && packedItems.length >= MAX_SELECTION;

  const handlePackItem = (item) => {
    if (stateMode !== 'NORMAL') return;
    if (packedItems.length >= MAX_SELECTION) return;
    if (packedItems.some(p => p.id === item.id)) return;

    const next = [...packedItems, item];
    setPackedItems(next);
    try { navigator.vibrate?.([60, 30, 60]); } catch (_) {}

    // Trigger overlay explicitly ONLY when the 3rd item is added
    if (next.length >= MAX_SELECTION) {
      setStateMode('ALERT');
    }
  };

  const handleBribe = () => {
    setStateMode('SUCCESS');
    createMoneyRain();
    setTimeout(() => onVerified(), 1800);
  };

  const createMoneyRain = () => {
    const symbols = ['💵', '🎟️', '💰', '✨', '🎉'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'vcm-money';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.animationDuration = `${1.5 + Math.random()}s`;
      el.style.animationDelay    = `${Math.random() * 0.5}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };

  return (
    <div className="vcm-backdrop">
      <div className="vcm-modal">

        {/* ── Close button — pinned, high-contrast, always visible ── */}
        {onClose && (
          <button
            className="vcm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 60 }}
          >
            ✕
          </button>
        )}

        {/* ════════════════════════════════════════════════════════
            GAME UI  (shown while NORMAL or ALERT — hidden on SUCCESS)
            ════════════════════════════════════════════════════════ */}
        {stateMode !== 'SUCCESS' && (
          <div className="vcm-body">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="vcm-header">
              <span className="vcm-header-badge">🛡️ Security Verification</span>
              <h2 className="vcm-header-title">Pack Your Suitcase 🧳</h2>
              <p className="vcm-header-sub">
                Click up to <strong>3 items</strong> to pack your suitcase and stay under the&nbsp;
                <strong>2.0 kg limit</strong>.
              </p>
            </div>

            {/* ── Two-column layout ───────────────────────────────── */}
            <div className="vcm-columns">

              {/* LEFT — suitcase + weight indicator */}
              <div className="vcm-suitcase-col" id="suitcase-container">

                {/* Weight label row */}
                <div className="vcm-weight-label-row">
                  <span className="vcm-weight-text">
                    <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>scale</span>
                    {currentWeight.toFixed(1)} kg / {WEIGHT_LIMIT.toFixed(1)} kg
                  </span>
                  <span className="vcm-weight-pct">{progressPct}%</span>
                </div>

                {/* Progress bar */}
                <div className="vcm-progress-track">
                  <div
                    className="vcm-progress-fill"
                    style={{ width: `${progressPct}%`, backgroundColor: barColor }}
                  />
                </div>

                {/* Suitcase graphic */}
                <div className="suitcase-graphic" id="suitcase-graphic">
                  <div className="suitcase-shell">
                    <div className="suitcase-handle" />
                    <div className="suitcase-corner tl" />
                    <div className="suitcase-corner tr" />
                    <div className="suitcase-corner bl" />
                    <div className="suitcase-corner br" />
                    <div className="suitcase-interior" id="suitcase-zone">
                      {packedItems.length === 0 && (
                        <div className="vcm-empty-hint">
                          <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>🧳</span>
                          <span>Empty</span>
                        </div>
                      )}
                      {packedItems.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="packed-badge vcm-anim-bounce">
                          <span>{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="suitcase-wheel left" />
                    <div className="suitcase-wheel right" />
                  </div>
                </div>
              </div>

              {/* RIGHT — inventory grid */}
              <div className="vcm-inventory-col">
                <h3 className="vcm-inv-heading">Available Items</h3>
                <div className="vcm-inv-grid" id="inventory-zone">
                  {INVENTORY_ITEMS.map(item => {
                    const isPacked = packedItems.some(p => p.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`vcm-inv-card${isPacked ? ' vcm-inv-card--packed' : ''}`}
                        onClick={() => handlePackItem(item)}
                        disabled={isPacked}
                      >
                        {isPacked && <span className="vcm-check-badge">✓</span>}
                        <span className="vcm-inv-icon">{item.icon}</span>
                        <span className="vcm-inv-name">{item.name}</span>
                        <span className="vcm-inv-weight">{item.weight} kg</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════
                ALERT OVERLAY — ONLY shown when 3 items are packed
                ════════════════════════════════════════════════════ */}
            {showOverlay && (
              <div className="vcm-overlay vcm-overlay--anim">
                {/* Dark glass card */}
                <div className="vcm-overlay-card">
                  {/* Top pill */}
                  <div className="vcm-overlay-badge">⚠️ SECURITY ALERT</div>

                  {/* Icon ring */}
                  <div className="vcm-overlay-icon-ring">🛂</div>

                  {/* Title */}
                  <h3 className="vcm-overlay-title">You forgot your passport!</h3>

                  {/* Subtitle */}
                  <p className="vcm-overlay-sub">
                    Customs check failed. Bypass security to proceed.
                  </p>

                  {/* CTA */}
                  <button
                    id="bribe-btn"
                    type="button"
                    className="vcm-bribe-btn"
                    onClick={handleBribe}
                  >
                    Bribe the Agent 💰
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            SUCCESS SCREEN
            ════════════════════════════════════════════════════════ */}
        {stateMode === 'SUCCESS' && (
          <div className="vcm-success" id="success-state-container">
            <div className="vcm-success-icon">🎉</div>
            <h3 className="vcm-success-title">Bribery tells us you're human!</h3>
            <p className="vcm-success-sub">Bon Voyage, Odysseus! ✈️</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoyagerCaptchaModal;
