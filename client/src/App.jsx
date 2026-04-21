import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import TravellerLayout from './layouts/TravellerLayout.jsx'
import { Toaster } from 'react-hot-toast'
import PageLoader from './components/Loader/PageLoader.jsx'

import DiscoveryPage from './pages/traveller/DiscoveryPage.jsx'
import PlannerPage from './pages/traveller/PlannerPage.jsx'
import WishlistPage from './pages/traveller/WishlistPage.jsx'
import MyTripsPage from './pages/traveller/MyTripsPage.jsx'
import DestinationDetailsPage from './pages/traveller/DestinationDetailsPage.jsx'
import JourneyDetails from './pages/JourneyDetails.jsx'
import MyJourneys from './pages/MyJourneys.jsx'
import PackagesPage from './pages/traveller/PackagesPage.jsx'
import EventsPage from './pages/traveller/EventsPage.jsx'
import ComingSoonPage from './pages/traveller/ComingSoonPage.jsx'

export default function App() {
  return (
    <>
    <PageLoader />
    <Routes>
      <Route path="/" element={<TravellerLayout />}>
        <Route index element={<DiscoveryPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="my-trips" element={<MyTripsPage />} />
        <Route path="journey/:id" element={<JourneyDetails />} />
        <Route path="my-journeys" element={<MyJourneys />} />
        <Route path="destinations/:slug" element={<DestinationDetailsPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:id" element={<ComingSoonPage type="Package" />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<ComingSoonPage type="Event" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Toaster position="top-center" />
    </>
  )
}

