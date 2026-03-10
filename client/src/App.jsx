import React from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useStore from './store/useStore';
import Kanban from './pages/Kanban';
import DestinationManager from './pages/DestinationManager';

const queryClient = new QueryClient();

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardHome = () => (
  <div className="max-w-6xl mx-auto">
    <header className="mb-12">
      <h1 className="text-6xl font-display font-bold text-ink mb-4">Welcome back, Roam Squad</h1>
      <p className="text-ink/60 text-lg">Here's what's happening across Roam Reverie today.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { label: 'Pending Requests', value: '12', color: 'bg-gold/10 text-gold' },
        { label: 'Active Itineraries', value: '48', color: 'bg-forest/10 text-forest' },
        { label: 'Featured Destinations', value: '156', color: 'bg-red/10 text-red' }
      ].map((stat, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-2xl border border-ink/5 shadow-sm"
        >
          <p className="text-ink/40 text-xs uppercase tracking-widest font-bold mb-2">{stat.label}</p>
          <p className={`text-5xl font-display font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>

    <div className="bg-white p-8 rounded-2xl border border-ink/5 shadow-sm mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold text-ink">Recent Requests</h2>
        <button className="text-red font-bold text-sm hover:underline">View Kanban Board</button>
      </div>
      <Kanban />
    </div>
  </div>
);

function App() {
  const { currentDestinationId } = useStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CustomCursor />
        <DashboardLayout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <PageTransition>
                  {currentDestinationId ? (
                    <DestinationManager destinationName={currentDestinationId === 'munnar' ? 'Munnar' : 'Destination'} />
                  ) : (
                    <DashboardHome />
                  )}
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </DashboardLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
