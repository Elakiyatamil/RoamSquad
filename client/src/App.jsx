import React, { useState, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import TravellerLayout from './layouts/TravellerLayout.jsx'
import { useLoader } from './context/LoaderContext'
import { Toaster } from 'react-hot-toast'
import Loader from './components/Loader/Loader.jsx'

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
import AuthSuccess from './pages/traveller/AuthSuccess.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const { setIsLoading } = useLoader()
  const isFirstMount = React.useRef(true)

  // Route change loading trigger
  useEffect(() => {
    if (!loading) {
      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => {
        clearTimeout(timer)
        setIsLoading(false)
      }
    }
  }, [location.pathname, loading, setIsLoading])
  
  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
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
            <Route path="auth-success" element={<AuthSuccess />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </>
  )
}
