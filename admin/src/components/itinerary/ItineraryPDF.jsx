import React from 'react';
import { 
  Page, Text, View, Document, StyleSheet, Image, Svg, Path, G 
} from '@react-pdf/renderer';

// Premium Color Palette
const COLORS = {
  primary: '#d32f2f', // Roam Red
  dark: '#1a1a1a',
  white: '#ffffff',
  lightGray: '#f8f8f8',
  textSecondary: '#666',
  border: '#e0e0e0',
  accent: '#fdeaea',
  green: '#4caf50'
};

// SVG ICONS
const Icons = {
  MapPin: () => (
    <Svg width="18" height="18" viewBox="0 0 24 24">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill={COLORS.primary} />
    </Svg>
  ),
  Calendar: () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" fill={COLORS.textSecondary} />
    </Svg>
  ),
  Users: () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill={COLORS.textSecondary} />
    </Svg>
  ),
  Vibe: () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M9.5 22L8 16.22 3 15V13.5L8 12.28 9.5 6.5l1.5 5.78 5 1.22v1.5l-5 1.22L9.5 22zM17.5 11l-1-3.85-3.5-1V5l3.5-.9L17.5 0l1 3.5 3.5 1.15v1.25l-3.5 1L17.5 11z" fill={COLORS.textSecondary} />
    </Svg>
  ),
  Rupee: () => (
    <Svg width="12" height="12" viewBox="0 0 24 24">
      <Path d="M13.98 11.07c-2.07 0-3.39-2-3.39-2h3.39V6.36h-4s.22-3.65 3-3.65H15V0H6v2.71h2.24c-2.71 0-2.73 3.65-2.73 3.65h-2v2.71h2.27c.18 2.05 1.35 4.71 4.21 4.71V15c-3.12 0-3.54-2-3.54-2h-3c0 3.86 4.38 5 6.27 5h.27l1 6h3.45l-1.35-6.23V11.07z" fill={COLORS.dark} />
    </Svg>
  ),
  Hotel: () => (
    <Svg width="22" height="22" viewBox="0 0 24 24">
      <Path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill={COLORS.primary} />
    </Svg>
  ),
  Food: () => (
    <Svg width="22" height="22" viewBox="0 0 24 24">
      <Path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill={COLORS.green} />
    </Svg>
  ),
  Clock: () => (
    <Svg width="10" height="10" viewBox="0 0 24 24">
      <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill={COLORS.primary} />
    </Svg>
  )
};

const styles = StyleSheet.create({
  page: { padding: 0, fontFamily: 'Helvetica', backgroundColor: COLORS.white },
  
  // --- PAGE 1: COVER ---
  coverPage: { height: '100vh', justifyContent: 'center', padding: 50, backgroundColor: COLORS.white },
  coverContent: { marginTop: -100 },
  brandLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  journeyBy: { fontSize: 13, letterSpacing: 2, color: COLORS.textSecondary },
  roamSquad: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark, marginLeft: 6 },
  mainTitle: { fontSize: 40, fontWeight: 'black', color: COLORS.primary, textTransform: 'uppercase', marginBottom: 30, lineHeight: 1.1 },
  
  // --- STATS RIBBON ---
  statsRibbon: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 40 },
  statCard: { 
    flex: 1, minWidth: '45%', padding: 20, backgroundColor: COLORS.white, borderRadius: 10, 
    borderBottom: `4pt solid ${COLORS.primary}`, border: '1pt solid #efefef', minHeight: 80
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  statLabel: { fontSize: 9, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark },

  // --- ITINERARY SECTION ---
  itineraryPage: { padding: '50 50 80 50', backgroundColor: COLORS.white },
  sectionHeader: { 
    fontSize: 28, fontWeight: 'bold', color: COLORS.dark, 
    borderBottom: `2pt solid ${COLORS.primary}`, paddingBottom: 15, marginBottom: 40 
  },
  dayContainer: { marginBottom: 50, position: 'relative' },
  dayMarker: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { marginRight: 15 },
  dayTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, letterSpacing: -0.5 },
  
  activityList: { marginLeft: 45, borderLeft: `1pt dashed ${COLORS.primary}`, paddingLeft: 25 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  activityBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 7, marginRight: 15 },
  activityText: { fontSize: 15, color: '#333', flex: 1, lineHeight: 1.5 },
  durationBadge: { 
    backgroundColor: COLORS.accent, padding: '3 8', borderRadius: 4, 
    flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 10
  },
  badgeText: { fontSize: 9, color: COLORS.primary, fontWeight: 'bold' },

  richCard: {
    marginTop: 20, padding: 15, backgroundColor: COLORS.lightGray,
    borderRadius: 10, borderLeft: `4pt solid ${COLORS.primary}`,
    flexDirection: 'row', alignItems: 'center', gap: 15, minHeight: 60
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark, marginBottom: 2 },
  cardSub: { fontSize: 11, color: COLORS.textSecondary },

  // --- TERMS & FINANCIALS PAGE ---
  termsPage: { padding: 50, backgroundColor: COLORS.white },
  cardRow: { flexDirection: 'row', gap: 20, marginBottom: 40 },
  termCard: { 
    flex: 1, padding: 25, borderRadius: 12, backgroundColor: COLORS.white,
    border: '1pt solid #f0f0f0' 
  },
  inclusionCard: { borderRight: `4pt solid ${COLORS.green}`, borderBottom: `4pt solid ${COLORS.green}` },
  exclusionCard: { borderRight: `4pt solid ${COLORS.primary}`, borderBottom: `4pt solid ${COLORS.primary}` },
  
  termTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },
  termItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  termDot: { width: 4, height: 4, borderRadius: 2, marginRight: 10 },
  termText: { fontSize: 12, color: COLORS.dark },

  priceSummary: { 
    marginTop: 'auto', padding: 40, backgroundColor: COLORS.dark, 
    borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  totalLabel: { color: '#aaa', fontSize: 12, marginBottom: 8, letterSpacing: 1 },
  priceBigRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceBig: { fontSize: 36, fontWeight: 'bold', color: COLORS.white },

  // --- FOOTER ---
  footer: {
    position: 'absolute', bottom: 30, left: 50, right: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderTop: `1pt solid #eee`, paddingTop: 15
  },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  footerLogoText: { fontSize: 12, fontWeight: 'bold', color: COLORS.dark },
  footerLogoRed: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary }
});

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const ItineraryPDF = ({ data }) => {
  if (!data) return null;
  const { destinationInfo, tripConfig, timeline, snapshots } = data;

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={{ fontSize: 9, color: '#aaa' }}>ROAMSQUAD TRAVEL BROCHURE</Text>
      <View style={styles.logoGroup}>
        <Text style={styles.footerLogoText}>ROAM</Text>
        <Text style={styles.footerLogoRed}>SQUAD</Text>
      </View>
    </View>
  );

  const dayChunks = chunkArray(timeline || [], 2);

  return (
    <Document>
      {/* PAGE 1: COVER */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContent}>
          <View style={styles.brandLine}>
            <Text style={styles.journeyBy}>YOUR JOURNEY BY</Text>
            <Text style={styles.roamSquad}>ROAMSQUAD</Text>
          </View>
          <Text style={styles.mainTitle} hyphenation={false}>
            {destinationInfo?.destinationName || 'THE ADVENTURE'}
          </Text>
          
          <View style={styles.statsRibbon}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}><Icons.Calendar /><Text style={styles.statLabel}>Duration</Text></View>
              <Text style={styles.statValue}>{tripConfig?.days || 1} Days / {(tripConfig?.days || 1) - 1} Nights</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}><Icons.Users /><Text style={styles.statLabel}>Group Size</Text></View>
              <Text style={styles.statValue}>{tripConfig?.people || 1} Travelers</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}><Icons.Vibe /><Text style={styles.statLabel}>Experience Vibe</Text></View>
              <Text style={styles.statValue}>{tripConfig?.vibe || 'Discovery'}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}><Icons.Rupee /><Text style={styles.statLabel}>Estimated Budget</Text></View>
              <View style={styles.statValueRow}>
                <Icons.Rupee />
                <Text style={styles.statValue}>{Number(tripConfig?.totalBudget || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
        <Footer />
      </Page>

      {/* ITINERARY PAGES (2 DAYS PER PAGE) */}
      {dayChunks.map((chunk, chunkIdx) => (
        <Page key={chunkIdx} size="A4" style={styles.itineraryPage}>
          <Text style={styles.sectionHeader}>Itinerary Breakdown (Part {chunkIdx + 1})</Text>
          {chunk.map((day, idx) => {
             const actualDayIdx = chunkIdx * 2 + idx;
             return (
              <View key={idx} style={styles.dayContainer} wrap={false}>
                <View style={styles.dayMarker}>
                  <View style={styles.iconBox}><Icons.MapPin /></View>
                  <Text style={styles.dayTitle}>DAY {String(actualDayIdx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.activityList}>
                  {day.activities?.map((act, i) => (
                    <View key={i} style={styles.activityRow}>
                      <View style={styles.activityBullet} />
                      <Text style={styles.activityText}>{act}</Text>
                      <View style={styles.durationBadge}><Icons.Clock /><Text style={styles.badgeText}>2.5 HR</Text></View>
                    </View>
                  ))}
                  {actualDayIdx === 0 && snapshots?.hotel && (
                    <View style={styles.richCard}>
                      <Icons.Hotel /><View><Text style={styles.cardTitle}>{snapshots.hotel.name || 'Premium Stay'}</Text><Text style={styles.cardSub}>Selected Luxury Accommodation</Text></View>
                    </View>
                  )}
                  {snapshots?.food?.length > 0 && actualDayIdx % 2 === 0 && (
                    <View style={[styles.richCard, { borderLeftColor: COLORS.green }]}>
                      <Icons.Food /><View><Text style={styles.cardTitle}>Local Dining: {snapshots.food[0] || 'Specials'}</Text><Text style={styles.cardSub}>Authentic Culinary Experience</Text></View>
                    </View>
                  )}
                </View>
              </View>
             );
          })}
          <Footer />
        </Page>
      ))}

      {/* FINAL PAGE: TERMS & FINANCIALS */}
      <Page size="A4" style={styles.termsPage}>
        <Text style={styles.sectionHeader}>Project Summary & Terms</Text>
        
        <View style={styles.cardRow}>
          <View style={[styles.termCard, styles.inclusionCard]}>
            <Text style={[styles.termTitle, { color: COLORS.green }]}>INCLUSIONS</Text>
            {['Stay: Comfort Stay', 'Curated Local Activities', '24/7 Dedicated Support', 'Local Dining Recommendations'].map((item, i) => (
              <View key={i} style={styles.termItem}>
                <View style={[styles.termDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.termText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={[styles.termCard, styles.exclusionCard]}>
            <Text style={[styles.termTitle, { color: COLORS.primary }]}>EXCLUSIONS</Text>
            {['Inter-state Flights', 'Personal Expenses', 'Travel Insurance'].map((item, i) => (
              <View key={i} style={styles.termItem}>
                <View style={[styles.termDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.termText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceSummary}>
          <View>
            <Text style={styles.totalLabel}>ESTIMATED TRIP TOTAL</Text>
            <View style={styles.priceBigRow}>
              <Svg width="24" height="24" viewBox="0 0 24 24"><Path d="M13.98 11.07c-2.07 0-3.39-2-3.39-2h3.39V6.36h-4s.22-3.65 3-3.65H15V0H6v2.71h2.24c-2.71 0-2.73 3.65-2.73 3.65h-2v2.71h2.27c.18 2.05 1.35 4.71 4.21 4.71V15c-3.12 0-3.54-2-3.54-2h-3c0 3.86 4.38 5 6.27 5h.27l1 6h3.45l-1.35-6.23V11.07z" fill="white" /></Svg>
              <Text style={styles.priceBig}>{Number(tripConfig?.totalBudget || 0).toLocaleString()}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: 'bold' }}>hello@roamsquad.com</Text>
            <Text style={{ color: '#888', fontSize: 11, marginTop: 5 }}>www.roamsquad.com</Text>
          </View>
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

export default ItineraryPDF;
