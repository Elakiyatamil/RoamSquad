import React, { useState, useRef, useCallback, useEffect } from 'react';
import './PackingChecklist.css';

// ─── Default items ────────────────────────────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 1, text: 'Passport & Docs',            packed: false },
  { id: 2, text: 'Camera & Lenses',            packed: false },
  { id: 3, text: 'Sunscreen (SPF 50+)',         packed: false },
  { id: 4, text: 'Noise Cancelling Headphones', packed: false },
  { id: 5, text: 'Universal Charger',           packed: false },
];

const LS_KEY = 'roamg_packing_list';

// Deterministic sticker rotation per id
const stickerRotation = (id) => ((id * 7) % 20) - 10;

// Load persisted list or fall back to defaults
function loadItems() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_ITEMS.map(i => ({ ...i }));
}

// ─── PackingChecklist component ───────────────────────────────────────────────
const PackingChecklist = ({ isOpen, onClose }) => {
  const [items,       setItems]       = useState(loadItems);
  const [newItemText, setNewItemText] = useState('');
  const [bounce,      setBounce]      = useState(false);
  const [dragIdx,     setDragIdx]     = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const suitcaseRef = useRef(null);

  const packedCount = items.filter(i => i.packed).length;
  const packedItems = items.filter(i => i.packed);

  // ── Persist to localStorage on every items change ─────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch (_) {}
  }, [items]);

  // ── Toggle packed state ───────────────────────────────────────────────────
  const handleToggle = useCallback((item, e) => {
    const isChecking = e.target.checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, packed: isChecking } : i));
  }, []);

  // ── Add new item ────────────────────────────────────────────────────────────
  const handleAdd = () => {
    const text = newItemText.trim();
    if (!text) return;
    setItems(prev => [...prev, { id: Date.now(), text, packed: false }]);
    setNewItemText('');
  };

  // ── Delete (with propagation stop so drag/toggle don't fire) ───────────────
  const handleDelete = (id, e) => {
    e.stopPropagation();
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    const fresh = DEFAULT_ITEMS.map(i => ({ ...i, packed: false }));
    setItems(fresh);
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = (idx, e) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (idx, e) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (targetIdx, e) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== targetIdx) {
      setItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  if (!isOpen) return null;

  return (
    /* ── Overlay ── */
    <div
      className="pc-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal Card ── */}
      <div
        className="pc-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 18,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'rgba(44,42,41,0.55)',
            transition: 'color 0.2s',
            fontSize: 26, lineHeight: 1,
            display: 'flex', alignItems: 'center',
            zIndex: 10,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#bf0029'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(44,42,41,0.55)'}
          aria-label="Close checklist"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* ── LEFT COLUMN: checklist ── */}
        <div className="pc-left-col">
          {/* Header */}
          <div style={{ marginBottom: 16, paddingRight: 32 }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, margin: '0 0 4px', lineHeight: 1.1 }}>
              Trip Essentials
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(44,42,41,0.55)', fontStyle: 'italic' }}>
              Drag to reorder · Check to pack
            </p>
          </div>

          {/* List */}
          <div
            className="pc-scroll"
            style={{ flex: 1, overflowY: 'auto', paddingRight: 4, maxHeight: 360 }}
          >
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`pc-item-row${dragIdx === idx ? ' pc-dragging' : ''}${dragOverIdx === idx && dragIdx !== idx ? ' pc-drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(idx, e)}
                onDragOver={(e)  => handleDragOver(idx, e)}
                onDrop={(e)      => handleDrop(idx, e)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', marginBottom: 7,
                  background: item.packed ? 'rgba(255,255,255,0.5)' : '#FFFFF8',
                  borderRadius: 13,
                  border: '1px solid #E8E2D5',
                  opacity: item.packed ? 0.62 : 1,
                  transition: 'opacity 0.25s, background 0.25s',
                  userSelect: 'none',
                }}
              >
                {/* Drag handle */}
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, color: '#d0c9be', cursor: 'grab', flexShrink: 0, lineHeight: 1 }}
                >
                  drag_indicator
                </span>

                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="pc-checkbox"
                  checked={item.packed}
                  onChange={(e) => handleToggle(item, e)}
                />

                {/* Label */}
                <span
                  className="pc-item-text"
                  style={{
                    flex: 1, fontSize: 14, fontWeight: 600,
                    textDecoration: item.packed ? 'line-through' : 'none',
                    color: item.packed ? 'rgba(44,42,41,0.4)' : '#2C2A29',
                    transition: 'all 0.2s',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {item.text}
                </span>

                {/* Delete — stopPropagation prevents drag/toggle conflicts */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#d0c9be', padding: '2px 4px',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.18s', flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#bf0029'}
                  onMouseLeave={e => e.currentTarget.style.color = '#d0c9be'}
                  aria-label={`Remove ${item.text}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(44,42,41,0.38)', fontStyle: 'italic', fontSize: 14 }}>
                Your list is empty — add something below!
              </div>
            )}
          </div>

          {/* Add item row */}
          <div style={{ marginTop: 14, borderTop: '1px solid #E8E2D5', paddingTop: 12 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <input
                type="text"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="+ Add custom item…"
                style={{
                  flex: 1, background: '#fff', border: '1px solid #E8E2D5',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', color: '#2C2A29',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#e9c349'}
                onBlur={e  => e.target.style.borderColor = '#E8E2D5'}
              />
              <button
                onClick={handleAdd}
                style={{
                  background: '#fff', border: '1.5px solid #e9c349',
                  borderRadius: 24, padding: '10px 20px', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                  color: '#2C2A29', transition: 'background 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,195,73,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Add
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'rgba(44,42,41,0.5)', fontWeight: 600,
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#bf0029'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(44,42,41,0.5)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
              Reset to defaults
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: suitcase status ── */}
        <div className="pc-sidebar">
          <h3 className="pc-sidebar-title">
            Luggage<br/>Status
          </h3>

          {/* Suitcase graphic */}
          <div className="pc-suitcase-wrap">
            <div
              ref={suitcaseRef}
              className={`pc-suitcase-graphic${bounce ? ' pc-suitcase-bounce' : ''}`}
              style={{ width: 140, height: 168, position: 'relative', transformOrigin: 'bottom center' }}
            >
              {/* Telescoping handle rod */}
              <div style={{
                position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
                width: 56, height: 40,
                borderLeft: '4px solid #c8bfb0',
                borderRight: '4px solid #c8bfb0',
                borderTop: '4px solid #c8bfb0',
                borderRadius: '9px 9px 0 0',
              }} />
              {/* Grip bar */}
              <div style={{
                position: 'absolute', top: -44, left: '50%', transform: 'translateX(-50%)',
                width: 72, height: 11, background: '#2a322b', borderRadius: 9999,
              }} />

              {/* Body */}
              <div style={{
                position: 'absolute', inset: 0,
                background: '#bf0029', borderRadius: 16,
                border: '2px solid #92001d',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(191,0,41,0.22)',
              }}>
                {/* Yellow stripes */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 18, width: 10, background: 'rgba(233,195,73,0.88)', borderLeft: '1px solid rgba(87,69,0,0.25)', borderRight: '1px solid rgba(87,69,0,0.25)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, right: 18, width: 10, background: 'rgba(233,195,73,0.88)', borderLeft: '1px solid rgba(87,69,0,0.25)', borderRight: '1px solid rgba(87,69,0,0.25)' }} />
                {/* Zipper */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 2, background: 'rgba(255,255,255,0.18)', zIndex: 1 }} />

                {/* Packed stickers */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignContent: 'flex-start', padding: '10px 8px 8px' }}>
                  {packedItems.map(item => (
                    <div
                      key={item.id}
                      className="pc-sticker"
                      style={{
                        background: '#FFFDF6', color: '#2C2A29',
                        fontSize: 8, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 9999,
                        border: '1px solid #e9c349',
                        transform: `rotate(${stickerRotation(item.id)}deg)`,
                        maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      {item.text.length > 9 ? item.text.slice(0, 9) + '…' : item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wheels */}
              <div style={{ position: 'absolute', bottom: -9, left: 14, width: 16, height: 16, background: '#2a322b', borderRadius: '50%', border: '2px solid #d4ddd1' }} />
              <div style={{ position: 'absolute', bottom: -9, right: 14, width: 16, height: 16, background: '#2a322b', borderRadius: '50%', border: '2px solid #d4ddd1' }} />
            </div>
          </div>

          {/* Count + progress bar */}
          <div className="pc-count-box">
            <span style={{ fontSize: 36, fontWeight: 800, color: '#bf0029', lineHeight: 1, display: 'block' }}>
              {packedCount}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(44,42,41,0.58)', display: 'block', marginTop: 2 }}>
              {packedCount === 1 ? 'Item Packed' : 'Items Packed'}
            </span>
            {items.length > 0 && (
              <div style={{ marginTop: 8, height: 5, background: '#eae4d8', borderRadius: 9999, width: 84, marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  background: 'linear-gradient(90deg, #e9c349, #bf0029)',
                  width: `${Math.round((packedCount / items.length) * 100)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PackingChecklist;
