import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import LocationTreeManager from './pages/admin/LocationTreeManager';
import DestinationManager from './pages/admin/DestinationManager';
import ActivitiesManager from './pages/admin/ActivitiesManager';
import FoodOptionsManager from './pages/admin/FoodOptionsManager';
import AccommodationManager from './pages/admin/AccommodationManager';
import PackagesManager from './pages/admin/PackagesManager';
import RequestManager from './pages/admin/RequestManager';
import LoginPage from './pages/auth/LoginPage';
import ActivityLog from './pages/admin/ActivityLog';

// Initialize React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="tree" element={<LocationTreeManager />} />
            <Route path="destinations" element={<DestinationManager />} />
            <Route path="activities" element={<ActivitiesManager />} />
            <Route path="food" element={<FoodOptionsManager />} />
            <Route path="accommodation" element={<AccommodationManager />} />
            <Route path="packages" element={<PackagesManager />} />
            <Route path="requests" element={<RequestManager />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
