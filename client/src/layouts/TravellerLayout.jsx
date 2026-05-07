import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingNav from '../components/FloatingNav/FloatingNav'

export default function TravellerLayout() {
  const location = useLocation()
  // Hide the floating nav on the planner page — it has its own WizardHeader
  const isPlanner = location.pathname === '/planner'

  return (
    <div className="min-h-screen bg-bg-cream text-primary">
      {!isPlanner && <FloatingNav />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
