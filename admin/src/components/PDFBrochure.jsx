import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  // Page 1: Cover
  coverPage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#1A1A1A',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.8
  },
  coverOverlay: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 60,
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 42,
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textShadow: '0 4 10 rgba(0,0,0,0.5)'
  },
  coverTagline: {
    fontSize: 14,
    color: 'white',
    letterSpacing: 5,
    textTransform: 'uppercase',
    opacity: 0.9,
    marginBottom: 40
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  infoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '8 16',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  pillText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  // Page 2+: Content
  contentPage: {
    padding: '40 50',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    color: '#1A1A1A',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 15
  },
  headerBrand: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#800000',
    letterSpacing: 1
  },
  headerPkg: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase'
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 40
  },
  leftCol: {
    width: '65%'
  },
  rightCol: {
    width: '35%'
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#800000',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  dayBox: {
    marginBottom: 25,
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#800000',
    paddingLeft: 10
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 15
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 5,
    marginRight: 10
  },
  activityText: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.5
  },
  sidebarCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 25
  },
  inclusionCard: {
    backgroundColor: '#F0FDF4'
  },
  exclusionCard: {
    backgroundColor: '#F9FAFB'
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 7,
    alignItems: 'flex-start'
  },
  listIcon: {
    fontSize: 10,
    marginRight: 8,
    width: 12,
    textAlign: 'center'
  },
  listText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 20
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF'
  },
  pageNumber: {
    fontSize: 8,
    color: '#D1D5DB'
  }
});

const PDFBrochure = ({ data }) => {
  const activeGroups = (data.participantGroups || []).filter(g => (parseInt(g.count) || 0) > 0);
  const totalPax = activeGroups.reduce((acc, g) => acc + (parseInt(g.count) || 0), 0);
  const duration = data.itineraryDays?.length || 0;
  
  return (
    <Document>
      {/* Page 1: Full Background Cover */}
      <Page size="A4" style={styles.coverPage}>
        {data.coverImage && (
          <Image src={data.coverImage} style={styles.coverImage} />
        )}
        <View style={styles.coverOverlay}>
          <Text style={styles.coverTitle}>{data.name}</Text>
          <Text style={styles.coverTagline}>RoamSquad Experience Engine</Text>
          
            <View style={styles.infoBar}>
              <View style={styles.infoPill}>
                <Text style={styles.pillText}>{duration}D / {Math.max(0, duration-1)}N</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.pillText}>{totalPax} Adults</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.pillText}>Total: ₹{(data.totalBudget || (Number(data.pricePerPax || 0) * totalPax)).toLocaleString()}</Text>
              </View>
            </View>
        </View>
      </Page>

      {/* Page 2: Detailed Content */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.headerRow}>
          <Text style={styles.headerBrand}>ROAMSQUAD</Text>
          <Text style={styles.headerPkg}>{data.name} | Confidential</Text>
        </View>

        <View style={styles.contentGrid}>
          {/* Left Column: Itinerary */}
          <View style={styles.leftCol}>
            <Text style={styles.sectionTitle}>The Journey</Text>
            {(data.itineraryDays || []).map((day, dIdx) => (
              <View key={dIdx} style={styles.dayBox} wrap={false}>
                <Text style={styles.dayHeader}>Day {day.dayNumber}: {day.locationName}</Text>
                {(day.activities || []).map((act, aIdx) => (
                  <View key={aIdx} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>{act.description}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Right Column: Inclusions/Exclusions */}
          <View style={styles.rightCol}>
            <View style={[styles.sidebarCard, styles.inclusionCard]}>
              <Text style={[styles.cardTitle, { color: '#166534' }]}>Inclusions</Text>
              {(Array.isArray(data.inclusions) ? data.inclusions : []).map((inc, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={[styles.listIcon, { color: '#166534' }]}>✓</Text>
                  <Text style={styles.listText}>{inc}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.sidebarCard, styles.exclusionCard]}>
              <Text style={[styles.cardTitle, { color: '#4B5563' }]}>Exclusions</Text>
              {(Array.isArray(data.exclusions) ? data.exclusions : []).map((exc, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={[styles.listIcon, { color: '#6B7280' }]}>✕</Text>
                  <Text style={styles.listText}>{exc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2024 RoamSquad. All rights reserved.</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </View>
      </Page>
    </Document>
  );
};

export default PDFBrochure;
