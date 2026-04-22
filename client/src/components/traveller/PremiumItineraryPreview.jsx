import React from 'react';
import { MapPin, Calendar, Users, Activity, Sparkles, ChevronRight, Tag } from 'lucide-react';

/* ─────────────────────────────────────────────
   SAMPLE DATA: 2-Day Edinburgh Itinerary
────────────────────────────────────────────── */
const ITINERARY_DATA = [
  {
    dayNumber: 1,
    title: "Castle Visit – Edinburgh",
    location: "Edinburgh Castle",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=300&q=80",
    activities: [
      { name: "Castle Visit", site: "Edinburgh Castle", time: "10:00 AM", cost: 1200, type: "primary" },
      { name: "Royal Mile Walk", site: "Royal Mile", time: "12:00 PM", cost: 0, type: "secondary" },
    ],
    dayCost: 1200
  },
  {
    dayNumber: 2,
    title: "Outdoor Exploration",
    location: "Arthur's Seat",
    image: "https://images.unsplash.com/photo-1533633858023-e666a01103f6?w=300&q=80",
    activities: [
      { name: "Arthur's Seat hike", site: "Arthur's Seat", time: "09:00 AM", cost: 0, type: "primary" },
      { name: "Whisky Museum", site: "Scotch Whisky Experience", time: "02:00 PM", cost: 800, type: "secondary" },
    ],
    dayCost: 800
  }
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT: Premium Itinerary Preview
────────────────────────────────────────────── */
const PremiumItineraryPreview = () => {
  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: '#FAF8F4',
      overflowX: 'hidden'
    },
    hero: {
      width: '100%',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    heroImg: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -2
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.85) 100%)',
      zIndex: -1
    },
    heroContent: {
      marginTop: '10vh', // Lowered as requested
      zIndex: 1,
      color: 'white',
      padding: '0 24px',
      maxWidth: 900
    },
    heroTag: {
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: 12,
        opacity: 0.9
    },
    heroTitle: {
        fontSize: 'clamp(32px, 8vw, 52px)',
        fontWeight: 800,
        margin: '0 0 12px',
        letterSpacing: '-1px'
    },
    heroSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 32
    },
    pillRow: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40
    },
    pill: {
        background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 999,
        padding: '6px 14px',
        fontSize: 13,
        color: 'white'
    },
    ctaButton: {
        background: 'white',
        color: '#1F3D2B',
        fontWeight: 700,
        border: 'none',
        borderRadius: 999,
        padding: '12px 28px',
        fontSize: 15,
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
    },
    itinerarySection: {
        padding: '80px 24px',
        maxWidth: 800,
        margin: '0 auto'
    },
    sectionHeader: {
        marginBottom: 40
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 800,
        color: '#1F3D2B',
        margin: '0 0 8px'
    },
    sectionSubtitle: {
        fontSize: 16,
        color: 'rgba(31,61,43,0.5)',
        margin: 0
    },
    card: {
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: 24,
        position: 'relative',
        borderLeft: '5px solid #5C6E4B',
        marginBottom: 24,
        overflow: 'hidden'
    },
    dayBadge: {
        background: '#5C6E4B',
        color: 'white',
        fontSize: 10,
        fontWeight: 800,
        padding: '4px 10px',
        borderRadius: 99,
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: 800,
        color: '#1F3D2B',
        marginLeft: 12
    },
    locationTag: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: 'rgba(31,61,43,0.4)',
        fontSize: 13
    },
    activityRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: '1px solid rgba(0,0,0,0.04)'
    },
    dot: (type) => ({
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: type === 'primary' ? '#E85D04' : '#F9A8D4',
        marginRight: 12
    }),
    activityName: {
        fontSize: 15,
        fontWeight: 600,
        color: '#0a0f1e'
    },
    activityMeta: {
        fontSize: 13,
        color: 'rgba(0,0,0,0.4)'
    },
    cardFooter: {
        background: '#f8f9fa',
        margin: '24px -24px -24px -24px',
        padding: '12px 24px',
        textAlign: 'right',
        fontSize: 13,
        color: '#5C6E4B',
        fontWeight: 700
    },
    polaroid: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 120,
        background: 'white',
        padding: '6px 6px 20px 6px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'rotate(3deg)',
        zIndex: 5
    },
    summaryStrip: {
        background: 'white',
        borderRadius: 20,
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        marginBottom: 32
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.4)',
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '0.05em'
    },
    statValue: {
        fontSize: 22,
        fontWeight: 800,
        color: '#1F3D2B'
    },
    statDivider: {
        width: 1,
        height: 40,
        background: 'rgba(0,0,0,0.06)'
    },
    confirmBtn: {
        width: '100%',
        background: '#3D5A3E',
        color: 'white',
        border: 'none',
        borderRadius: 16,
        padding: '20px',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      {/* ── HERO SECTION ── */}
      <header style={styles.hero}>
        <img 
            src="https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=1920&q=90" 
            alt="Mountains" 
            style={styles.heroImg} 
        />
        <div style={styles.heroOverlay} />
        
        <div style={styles.heroContent}>
            <p style={styles.heroTag}>ROAMSQUAD · YOUR ITINERARY</p>
            <h1 style={styles.heroTitle}>Edinburgh, Scotland</h1>
            <p style={styles.heroSubtitle}>12 May – 18 May · 6 Days</p>
            
            <div style={styles.pillRow}>
                {['Airfare', 'Hotels', 'Activities', 'Food'].map(p => (
                    <span key={p} style={styles.pill}>{p}</span>
                ))}
            </div>
            
            <button style={styles.ctaButton}>View Full Plan</button>
        </div>
      </header>

      {/* ── ITINERARY SECTION ── */}
      <main style={styles.itinerarySection}>
        <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Your Itinerary</h2>
            <p style={styles.sectionSubtitle}>Here's your full day-by-day plan</p>
        </div>

        {ITINERARY_DATA.map((day) => (
            <div key={day.dayNumber} style={styles.card}>
                {/* Polaroid Frame */}
                <div style={styles.polaroid}>
                    <img 
                        src={day.image} 
                        alt={day.title} 
                        style={{ width: '100%', height: 90, objectFit: 'cover' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={styles.dayBadge}>DAY {day.dayNumber}</span>
                        <span style={styles.dayTitle}>{day.title}</span>
                    </div>
                </div>

                <div style={styles.locationTag}>
                    <MapPin size={14} />
                    <span>{day.location}</span>
                </div>

                <div style={{ marginTop: 24 }}>
                    {day.activities.map((act, i) => (
                        <div key={i} style={styles.activityRow}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={styles.dot(act.type)} />
                                <span style={styles.activityName}>{act.name}</span>
                            </div>
                            <span style={styles.activityMeta}>
                                {act.cost > 0 ? `₹${act.cost.toLocaleString()}` : 'Free'} • {act.time}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={styles.cardFooter}>
                    EST. COST: ₹{day.dayCost.toLocaleString()}
                </div>
            </div>
        ))}

        {/* ── SUMMARY STRIP ── */}
        <div style={styles.summaryStrip}>
            <div style={styles.statItem}>
                <span style={styles.statLabel}>Total Days</span>
                <span style={styles.statValue}>06</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
                <span style={styles.statLabel}>Activities</span>
                <span style={styles.statValue}>14</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
                <span style={styles.statLabel}>Est. Budget</span>
                <span style={styles.statValue}>₹48,500</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
                <span style={styles.statLabel}>Destinations</span>
                <span style={styles.statValue}>02</span>
            </div>
        </div>

        <button style={styles.confirmBtn}>
            Confirm Inquiry <ChevronRight size={20} />
        </button>
      </main>
    </div>
  );
};

export default PremiumItineraryPreview;
