import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';

import DashboardOverview from './pages/admin/DashboardOverview';
import LocationTreeManager from './pages/admin/LocationTreeManager';
import DestinationManager from './pages/admin/DestinationManager';
import ActivitiesManager from './pages/admin/ActivitiesManager';
import FoodOptionsManager from './pages/admin/FoodOptionsManager';
import AccommodationManager from './pages/admin/AccommodationManager';
import PackagesManager from './pages/admin/PackagesManager';
import GlobalPackagesManager from './pages/admin/GlobalPackagesManager';
import EventsManager from './pages/admin/EventsManager';
import RequestManager from './pages/admin/RequestManager';
import ActivityLog from './pages/admin/ActivityLog';
import InquiryManager from './pages/admin/InquiryManager';

// Initialize React Query client
const queryClient = new QueryClient();

const RequireAuth = ({ children }) => {
  // IMPORTANT: avoid returning new objects from selectors (React 19 + useSyncExternalStore)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center p-6">
        <div className="text-sm font-semibold">Loading auth…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="tree" element={<LocationTreeManager />} />
            <Route path="destinations" element={<DestinationManager />} />
            <Route path="activities" element={<ActivitiesManager />} />
            <Route path="food" element={<FoodOptionsManager />} />
            <Route path="accommodation" element={<AccommodationManager />} />
            <Route path="packages" element={<PackagesManager />} />
            <Route path="global-packages" element={<GlobalPackagesManager />} />
            <Route path="events" element={<EventsManager />} />
            <Route path="requests" element={<RequestManager />} />
            <Route path="inquiries" element={<InquiryManager />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
