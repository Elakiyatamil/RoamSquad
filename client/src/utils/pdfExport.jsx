import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React from 'react';
import ItineraryPDF from '../components/itinerary/ItineraryPDF';

/**
 * Normalizes inquiry or trip data into the format expected by ItineraryPDF
 */
const normalizeData = (raw) => {
    const itinerary = raw.itinerarySnapshot || raw.itinerary || {};
    
    return {
        userInfo: {
            name: raw.name || raw.itinerary?.user?.name || 'Traveler',
            email: raw.email || 'N/A',
            phone: raw.phone || raw.itinerary?.user?.phone || 'N/A'
        },
        destinationInfo: {
            destinationName: raw.destinationName || raw.destination || 'Multiple Destinations',
            state: raw.state || '',
            district: raw.district || ''
        },
        tripConfig: {
            days: itinerary.days || raw.days || 0,
            people: itinerary.people || raw.people || 1,
            vibe: itinerary.vibe || raw.vibe || 'Discovery',
            totalBudget: raw.totalBudget || 0
        },
        timeline: (itinerary.timeline || []).map(day => ({
            day: day.day,
            activities: (day.activities || []).map(a => `${a.name} (${a.destinationName || ''})`)
        })),
        snapshots: {
            hotel: {
                name: raw.hotelSnapshot?.name || raw.hotel || 'Comfort Stay',
                description: raw.hotelSnapshot?.description || 'A curated selection from our premium network.'
            },
            food: raw.foodSnapshot?.items || (raw.foodSnapshot?.name ? [raw.foodSnapshot.name] : (typeof raw.food === 'string' ? [raw.food] : []))
        }
    };
};

export const generatePDF = async (rawData) => {
    try {
        const data = normalizeData(rawData);
        const blob = await pdf(<ItineraryPDF data={data} />).toBlob();
        saveAs(blob, `Itinerary-${data.destinationInfo.destinationName.replace(/\s+/g, '-')}.pdf`);
        return true;
    } catch (err) {
        console.error("PDF Export Error:", err);
        return false;
    }
};
