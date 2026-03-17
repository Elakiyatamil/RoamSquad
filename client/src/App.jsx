import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import TravellerLayout from './layouts/TravellerLayout.jsx'

import DiscoveryPage from './pages/traveller/DiscoveryPage.jsx'
import PlannerPage from './pages/traveller/PlannerPage.jsx'
import WishlistPage from './pages/traveller/WishlistPage.jsx'
import MyTripsPage from './pages/traveller/MyTripsPage.jsx'
import DestinationDetailsPage from './pages/traveller/DestinationDetailsPage.jsx'
import JourneyDetails from './pages/JourneyDetails.jsx'
import MyJourneys from './pages/MyJourneys.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TravellerLayout />}>
        <Route index element={<DiscoveryPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="my-trips" element={<MyTripsPage />} />
        <Route path="journey/:id" element={<JourneyDetails />} />
        <Route path="my-journeys" element={<MyJourneys />} />
        <Route path="destinations/:slug" element={<DestinationDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

