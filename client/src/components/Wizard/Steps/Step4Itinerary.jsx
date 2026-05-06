import React from 'react';
import ItineraryBuilder from '../../TravelMachine/ItineraryBuilder';
import usePlannerStore from '../../../store/usePlannerStore';

/**
 * Step 4 — Itinerary Architect
 * Renders the full, original ItineraryBuilder component using the planner wizard state.
 */
const Step4Itinerary = () => {
  const { destination, duration, startDate, travelers, vibe } = usePlannerStore();

  return (
    <ItineraryBuilder
      destination={destination}
      duration={duration}
      startDate={startDate}
      tripConfig={{
        adults: travelers.adults,
        children: travelers.kids,
        tripType: vibe,
      }}
    />
  );
};

export default Step4Itinerary;
