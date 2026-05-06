import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingNav from '../components/FloatingNav/FloatingNav'

export default function TravellerLayout() {
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/planner')
  
  return (
    <div className="min-h-screen">
      {!hideNav && <FloatingNav />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

