import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Traveller Pages
import TravellerLayout from './layouts/TravellerLayout';
import DiscoveryPage from './pages/traveller/DiscoveryPage';
import PlannerPage from './pages/traveller/PlannerPage';
import DestinationDetailsPage from './pages/traveller/DestinationDetailsPage';
import WishlistPage from './pages/traveller/WishlistPage';
import MyTripsPage from './pages/traveller/MyTripsPage';
import LoginPage from './pages/auth/LoginPage'; // Might still need login for traveller profile

// Initialize React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Traveller Routes */}
          <Route path="/" element={<TravellerLayout />}>
            <Route index element={<DiscoveryPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="my-trips" element={<MyTripsPage />} />
            <Route path="destinations/:slug" element={<DestinationDetailsPage />} />
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
