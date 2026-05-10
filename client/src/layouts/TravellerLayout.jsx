import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingNav from '../components/FloatingNav/FloatingNav'

export default function TravellerLayout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen bg-bg-cream text-primary" style={{ paddingTop: '80px' }}>
      <FloatingNav />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
