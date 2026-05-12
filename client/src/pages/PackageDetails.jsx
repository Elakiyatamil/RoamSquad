import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Users, IndianRupee, MapPin, 
  Utensils, Bus, Moon, Star, HardHat, Mountain, 
  Clock, Download, Edit3, Trash2, Plus, Check, Lock, X, AlertCircle,
  ChevronUp, ChevronDown, Send, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFBrochure from '../components/PDFBrochure';
import getImageUrl from '../utils/imageUrl';
import useAuthStore from '../store/authStore';
import { MessageCircle } from 'lucide-react';
import './PackageDetails.css';

const ICONS = {
  MEAL: <Utensils size={18} />,
  SIGHTSEEING: <Clock size={18} />,
  ACTIVITY: <Star size={18} />,
  TRAVEL: <Bus size={18} />,
  NIGHT_STAY: <Moon size={18} />,
  INDUSTRIAL_VISIT: <HardHat size={18} />,
  ADVENTURE_SPORTS: <Mountain size={18} />,
};

const ANCHOR_TYPES = ['MEAL', 'TRAVEL', 'NIGHT_STAY'];

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuthStore();
  const [draftItinerary, setDraftItinerary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [expandedDays, setExpandedDays] = useState({ 0: true });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleProtectedAction = (actionType) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingAction', actionType);
      sessionStorage.setItem('pendingPackage', id);
      navigate('/login', { state: { redirectTo: `/packages/${id}` } });
    } else {
      executeAction(actionType);
    }
  };

  const executeAction = (actionType) => {
    if (actionType === 'CUSTOMIZE') setIsEditing(true);
    if (actionType === 'SEND') {
      navigate('/confirm-selection', { 
        state: { 
          draftItinerary, 
          totalPax, 
          packageId: id 
        } 
      });
    }
  };

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingAction');
    const pendingPkg = sessionStorage.getItem('pendingPackage');
    if (isAuthenticated && pending && pendingPkg === id) {
      sessionStorage.removeItem('pendingAction');
      sessionStorage.removeItem('pendingPackage');
      executeAction(pending);
    }
  }, [isAuthenticated, id]);

  const submitToSquad = async () => {
    setSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      await axios.post(`${apiBase}/api/inquiry`, {
        packageId: id,
        packageName: draftItinerary.name,
        name: user?.name || 'Traveler',
        email: user?.email || 'traveler@example.com',
        phone: whatsappNumber,
        whatsappNumber,
        itinerary: draftItinerary,
        totalBudget: Number(draftItinerary.pricePerPax) * totalPax,
        startDate: new Date().toISOString(),
        tripDate: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/my-trips');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiBase}/api/packages/public/${id}`);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (pkg && !draftItinerary) {
      setDraftItinerary(JSON.parse(JSON.stringify(pkg)));
    }
  }, [pkg]);

  if (isLoading || !draftItinerary) return (
    <div className="engine-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <div style={{ width: 48, height: 48, border: '4px solid rgba(128,0,0,0.1)', borderTopColor: '#800000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const activeGroups = (draftItinerary.participantGroups || []).filter(g => (parseInt(g.count) || 0) > 0);
  const totalPax = activeGroups.reduce((acc, g) => acc + (parseInt(g.count) || 0), 0);

  const handleReorderActivities = (dayIndex, newActivities) => {
    const updated = { ...draftItinerary };
    updated.itineraryDays[dayIndex].activities = newActivities;
    setDraftItinerary(updated);
  };

  const removeActivity = (dayIndex, actId) => {
    const updated = { ...draftItinerary };
    updated.itineraryDays[dayIndex].activities = updated.itineraryDays[dayIndex].activities.filter(a => a.id !== actId);
    setDraftItinerary(updated);
  };

  const addActivity = (dayIndex) => {
    const updated = { ...draftItinerary };
    const newAct = {
      id: `new-${Date.now()}`,
      activityType: 'ACTIVITY',
      activityTime: 'MORNING',
      description: 'New experience description',
      isHighlight: false
    };
    updated.itineraryDays[dayIndex].activities.push(newAct);
    setDraftItinerary(updated);
    setEditingActivity({ dayIndex, actId: newAct.id, text: newAct.description });
  };

  return (
    <div className="engine-wrapper">
      <nav className="engine-header-nav">
         <div className="maroon-logo">ROAM<span>SQUAD</span></div>
         <button onClick={() => navigate(-1)} className="customize-btn inactive">
           <ArrowLeft size={12} /> Discovery
         </button>
      </nav>

      <div className="hero-container">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          src={getImageUrl(draftItinerary.coverImage)} 
          className="hero-image" 
          alt="" 
        />
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h1 className="hero-title">{draftItinerary.name}</h1>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '13px', fontWeight: 600, marginTop: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', width: 'fit-content', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.3)' }}>
                <Users size={14} /> 12 people booked this in the last 24 hours
             </div>

             <div className="stats-row" style={{ marginTop: '24px' }}>
                <div className="stat-item">
                   <p className="stat-label">Timeline</p>
                   <p className="stat-value">
                     <Calendar size={14} color="#800000" />
                     {draftItinerary.daysCount}D / {Math.max(0, draftItinerary.daysCount - 1)}N
                   </p>
                </div>
                <div className="stat-item">
                   <p className="stat-label">Group</p>
                   <p className="stat-value">
                     <Users size={14} color="#800000" />
                     {totalPax} PAX
                   </p>
                </div>
                <div className="stat-item">
                   <p className="stat-label">Value</p>
                   <p className="stat-value">
                     <IndianRupee size={14} color="#800000" />
                     ₹{Number(draftItinerary.pricePerPax).toLocaleString()} / {draftItinerary.priceUnit || 'Pax'}
                   </p>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      <main className="main-content-grid">
        <div className="engine-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h2 className="engine-header-title">Itinerary Builder</h2>
             <button 
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { redirectTo: `/packages/${id}` }});
                  return;
                }
                setIsEditing(!isEditing);
              }}
              className={`customize-btn ${isEditing ? 'active' : 'inactive'}`}
             >
               {isEditing ? 'Save Session' : 'Customize Plan'}
             </button>
          </div>

          <div className="days-list">
             {(draftItinerary.itineraryDays || []).map((day, dIdx) => (
               <div key={day.id || `day-${dIdx}`} className="day-section" style={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div 
                    onClick={() => setExpandedDays(prev => ({ ...prev, [dIdx]: !prev[dIdx] }))}
                    className="day-title-maroon" 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: expandedDays[dIdx] ? '#800000' : 'white',
                      color: expandedDays[dIdx] ? 'white' : '#1A1A1A',
                      padding: '16px 24px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                     <span style={{ fontWeight: 800 }}>DAY {day.dayNumber}: {day.locationName || 'EXPLORATION'}</span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!expandedDays[dIdx] && <span style={{ fontSize: '11px', opacity: 0.6 }}>{day.activities?.length} activities</span>}
                        {expandedDays[dIdx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                     </div>
                  </div>

                  {expandedDays[dIdx] && (
                    <div className="activities-container" style={{ padding: '24px', background: 'white' }}>
                     <Reorder.Group 
                        axis="y" 
                        values={day.activities} 
                        onReorder={(val) => handleReorderActivities(dIdx, val)}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                     >
                        {(day.activities || []).map((act, aIdx) => {
                          const isAnchor = ANCHOR_TYPES.includes(act.activityType);
                          return (
                            <Reorder.Item 
                              key={act.id || `act-${dIdx}-${aIdx}`} 
                              value={act}
                              dragListener={!isAnchor && isEditing}
                              className={`activity-card ${isAnchor ? 'anchor' : ''}`}
                            >
                               <div style={{ color: isAnchor ? '#800000' : '#1A1A1A', opacity: 1 }}>
                                  {ICONS[act.activityType]}
                               </div>
                               
                               <div style={{ flex: 1 }}>
                                  {isAnchor && <span className="anchor-badge">{act.activityType}</span>}
                                  {editingActivity?.actId === act.id ? (
                                    <input 
                                      autoFocus
                                      className="edit-input-maroon"
                                      value={editingActivity.text}
                                      onChange={e => setEditingActivity({...editingActivity, text: e.target.value})}
                                      onBlur={() => {
                                        const updated = {...draftItinerary};
                                        const a = updated.itineraryDays[dIdx].activities.find(x => x.id === act.id);
                                        a.description = editingActivity.text;
                                        setDraftItinerary(updated);
                                        setEditingActivity(null);
                                      }}
                                    />
                                  ) : (
                                    <p className={`activity-text ${act.isHighlight ? 'highlight' : ''}`} onDoubleClick={() => isEditing && !isAnchor && setEditingActivity({dayIndex: dIdx, actId: act.id, text: act.description})}>
                                      {act.isHighlight ? `[${act.description}]` : act.description}
                                    </p>
                                  )}
                               </div>

                               {isEditing && !isAnchor && (
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                     <button onClick={() => removeActivity(dIdx, act.id)} style={{ color: '#800000', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}>
                                        <Trash2 size={14} />
                                     </button>
                                     <div className="drag-handle-maroon">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                                           {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: 2, height: 2, background: 'currentColor', borderRadius: '50%' }} />)}
                                        </div>
                                     </div>
                                  </div>
                                )}

                                {isAnchor && (
                                  <div style={{ color: 'rgba(0, 0, 0, 0.05)' }}>
                                     <Lock size={12} />
                                  </div>
                                )}
                            </Reorder.Item>
                          );
                        })}
                     </Reorder.Group>
                    </div>
                  )}
               </div>
             ))}
          </div>
        </div>

        <div className="sidebar-container">
           <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="sidebar-card">
                 <span className="sidebar-label">Participants Breakdown</span>
                 <div className="pricing-pax">
                    Pax: {activeGroups.map((group, index) => (
                      <React.Fragment key={`${group.id || group.name}-${index}`}>
                        <span className="count">{group.count}</span> {group.name}
                        {index < activeGroups.length - 1 ? ' + ' : ''}
                      </React.Fragment>
                    ))}
                 </div>

                 <div style={{ marginBottom: '24px' }}>
                    <p className="sidebar-label">Total Value Estimate</p>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: '#1A1A1A' }}>
                       ₹{Number(draftItinerary.pricePerPax).toLocaleString()} <span style={{ fontSize: '10px', opacity: 0.4 }}>/ {draftItinerary.priceUnit}</span>
                    </p>
                 </div>

                 {isAuthenticated ? (
                     <PDFDownloadLink 
                        document={<PDFBrochure data={{ ...draftItinerary, coverImage: getImageUrl(draftItinerary.coverImage) }} />} 
                        fileName={`${draftItinerary.name.replace(/\s+/g, '_')}_Itinerary.pdf`}
                        style={{ textDecoration: 'none' }}
                     >
                        {({ loading }) => (
                           <button className="export-btn-maroon" disabled={loading}>
                              <Download size={16} />
                              {loading ? 'Finalizing...' : 'Export Branded PDF'}
                           </button>
                        )}
                     </PDFDownloadLink>
                 ) : (
                     <button 
                        className="export-btn-maroon"
                        onClick={() => navigate('/login', { state: { redirectTo: `/packages/${id}` }})}
                     >
                        <Download size={16} />
                        Login to Export PDF
                     </button>
                 )}
              </div>

               <div className="grid grid-cols-1 gap-6" style={{ alignItems: 'start' }}>
                  <div className="sidebar-card" style={{ background: '#F0FDF4', border: 'none', height: 'auto' }}>
                     <span className="sidebar-label" style={{ color: '#166534' }}>Inclusions</span>
                     <div className="inclusions-list">
                        {(Array.isArray(draftItinerary.inclusions) ? draftItinerary.inclusions : []).map((inc, i) => (
                          <div key={i} className="inclusion-item" style={{ alignItems: 'flex-start' }}>
                             <div style={{ width: '18px', height: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={14} style={{ color: '#166534' }} />
                             </div>
                             <span style={{ color: '#166534', fontSize: '13px' }}>{inc}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  {(draftItinerary.exclusions?.length > 0) && (
                    <div className="sidebar-card" style={{ background: '#F9FAFB', border: 'none', height: 'auto', marginTop: '32px' }}>
                       <span className="sidebar-label" style={{ color: '#4B5563' }}>Exclusions</span>
                       <div className="inclusions-list">
                          {(Array.isArray(draftItinerary.exclusions) ? draftItinerary.exclusions : []).map((exc, i) => (
                            <div key={i} className="inclusion-item" style={{ alignItems: 'flex-start' }}>
                               <div style={{ width: '18px', height: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <X size={14} style={{ color: '#6B7280' }} />
                               </div>
                               <span style={{ color: '#4B5563', fontSize: '13px' }}>{exc}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               {(draftItinerary.terms?.length > 0) && (
                 <div className="sidebar-card" style={{ background: 'rgba(0, 0, 0, 0.02)', border: 'none', marginTop: '16px' }}>
                    <span className="sidebar-label">Terms & Conditions</span>
                    <div className="inclusions-list">
                       {(Array.isArray(draftItinerary.terms) ? draftItinerary.terms : (typeof draftItinerary.terms === 'string' ? draftItinerary.terms.split('\n') : [])).map((term, i) => (
                         <div key={i} className="inclusion-item" style={{ alignItems: 'flex-start' }}>
                            <div style={{ width: '20px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <AlertCircle size={14} style={{ color: '#800000' }} />
                            </div>
                            <span style={{ fontSize: '11px', lineHeight: '1.4' }}>{term}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
           </div>
        </div>
      </main>

      <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          padding: '16px 24px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          zIndex: 2000
      }}>
          <button 
            onClick={() => handleProtectedAction('CUSTOMIZE')}
            style={{ 
              flex: 1, 
              maxWidth: '300px',
              height: '56px',
              borderRadius: '16px',
              background: isEditing ? '#800000' : 'white',
              color: isEditing ? 'white' : '#800000',
              border: '2px solid #800000',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isEditing ? <Check size={20} /> : <Edit3 size={20} />}
            {isEditing ? 'Save Customization' : 'Customize Plan'}
          </button>

          <button 
            onClick={() => handleProtectedAction('SEND')}
            style={{ 
              flex: 1, 
              maxWidth: '300px',
              height: '56px',
              borderRadius: '16px',
              background: '#800000',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <Send size={20} />
            Send to Us
          </button>

          {isAuthenticated && (
             <PDFDownloadLink 
                document={<PDFBrochure data={{ ...draftItinerary, coverImage: getImageUrl(draftItinerary.coverImage) }} />} 
                fileName={`${draftItinerary.name.replace(/\s+/g, '_')}_Itinerary.pdf`}
                style={{ textDecoration: 'none' }}
             >
                {({ loading }) => (
                   <button 
                      style={{ 
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#1A1A1A',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }} 
                      disabled={loading}
                   >
                      <Download size={24} />
                   </button>
                )}
             </PDFDownloadLink>
          )}

          {!isAuthenticated && (
            <button 
              onClick={() => handleProtectedAction('DOWNLOAD')}
              style={{ 
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#1A1A1A',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Download size={24} />
            </button>
          )}

      </div>

      <AnimatePresence>
        {false && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Confirm Selection</h2>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280' }}>Experiences</span>
                  <span style={{ fontWeight: 600 }}>{(draftItinerary.itineraryDays || []).reduce((acc, d) => acc + (d.activities?.length || 0), 0)} items</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: '#6B7280' }}>Duration</span>
                  <span style={{ fontWeight: 600 }}>{draftItinerary.daysCount} Days</span>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#800000' }}>Total Budget</span>
                  <span style={{ fontWeight: 800, color: '#800000', fontSize: '20px' }}>₹{(Number(draftItinerary.pricePerPax) * totalPax).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="tel" 
                  placeholder="WhatsApp Number" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    padding: '0 20px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button 
                onClick={submitToSquad}
                disabled={submitting || whatsappNumber.length < 10}
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#800000',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  opacity: (submitting || whatsappNumber.length < 10) ? 0.5 : 1
                }}
              >
                {submitting ? 'Sending...' : 'Submit to Squad'}
                <ArrowRight size={20} />
              </button>

              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
