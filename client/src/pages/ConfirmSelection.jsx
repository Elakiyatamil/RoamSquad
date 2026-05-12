import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Users, Phone, Baby } from 'lucide-react';
import useAuthStore from '../store/authStore';
import axios from 'axios';

export default function ConfirmSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const { draftItinerary, totalPax: initialPax, packageId } = state || {};
  const [adults, setAdults] = useState(initialPax || 1);
  const [children, setChildren] = useState(0);
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!state || !draftItinerary) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFCF8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', marginBottom: '16px' }}>No selection data found.</p>
          <button onClick={() => navigate(-1)} style={{ color: '#800000', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>← Go Back</button>
        </div>
      </div>
    );
  }

  const basePrice = Number(draftItinerary.pricePerPax || 0);
  const totalBilling = (adults + children) * basePrice;

  const handleSubmit = async () => {
    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const cleanNumber = whatsapp.replace(/\D/g, '');

      await axios.post(`${apiBase}/api/inquiry`, {
        packageId,
        packageName: draftItinerary.name,
        originalPackageName: draftItinerary.name,
        name: user?.name || 'Traveler',
        email: user?.email || 'traveler@example.com',
        phone: cleanNumber,
        whatsappNumber: cleanNumber,
        paxAdults: adults,
        paxChildren: children,
        people: adults + children,
        totalPeople: adults + children,
        totalBudget: totalBilling,
        itinerary: draftItinerary,
        itinerarySnapshot: draftItinerary,
        startDate: new Date().toISOString(),
        tripDate: new Date().toISOString(),
        status: 'PENDING'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/my-trips');
    } catch (err) {
      console.error("Submission failed", err);
      if (err.response?.status === 401) {
        setError('Session expired. Redirecting to login...');
        setTimeout(() => navigate('/login', { state: { redirectTo: window.location.pathname } }), 2000);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 9999,
      fontFamily: "'Inter', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FDFCF8',
          borderRadius: '24px',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1A1A1A',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ padding: '40px 36px 24px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1A1A1A', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Confirm Selection
          </h2>
          <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            {draftItinerary.name}
          </p>
        </div>

        <div style={{ padding: '0 36px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* WhatsApp Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={11} /> WhatsApp Number
            </label>
            <input
              type="tel"
              placeholder="+91 00000 00000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                padding: '10px 0',
                outline: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1A1A1A',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Counters Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Adults */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={11} /> Adults
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '6px' }}>
                <button onClick={() => setAdults(Math.max(1, adults - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>−</button>
                <span style={{ fontWeight: 900, fontSize: '16px', color: '#1A1A1A', minWidth: '24px', textAlign: 'center' }}>{adults}</span>
                <button onClick={() => setAdults(adults + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>+</button>
              </div>
            </div>

            {/* Children */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '9px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Baby size={11} /> Children
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '6px' }}>
                <button onClick={() => setChildren(Math.max(0, children - 1))} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>−</button>
                <span style={{ fontWeight: 900, fontSize: '16px', color: '#1A1A1A', minWidth: '24px', textAlign: 'center' }}>{children}</span>
                <button onClick={() => setChildren(children + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>+</button>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div style={{ paddingTop: '24px', borderTop: '1px dashed rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>Rate per head</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>₹{basePrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>Total Estimated Value</span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#800000', lineHeight: 1 }}>₹{totalBilling.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '9px', color: '#9CA3AF', margin: 0 }}>
              {adults}A {children > 0 ? `+ ${children}C` : ''} × ₹{basePrice.toLocaleString()}
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: '#1A1A1A',
              color: '#FDFCF8',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '13px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              opacity: submitting ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#800000'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
          >
            {submitting ? 'Submitting...' : 'Confirm & Submit to My Trip'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
