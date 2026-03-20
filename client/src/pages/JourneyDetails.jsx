import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useAuthStore from '../store/authStore'

export default function JourneyDetails() {
  const { id } = useParams()
  const token = useAuthStore((s) => s.token)

  const { data: inquiry, isLoading, error } = useQuery({
    queryKey: ['inquiry', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/inquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data?.data || res.data
    },
    enabled: Boolean(id && token),
  })

  if (!token) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="bg-white rounded-[2rem] p-10 border border-forest/5 shadow-sm">
          <h1 className="text-3xl font-display font-bold text-forest mb-2">Trip Summary</h1>
          <p className="text-forest/50 mb-6">Please log in to view your journey details.</p>
          <Link to="/planner" className="inline-flex px-6 py-3 bg-forest text-cream rounded-full font-bold">
            Back to Planner
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="container mx-auto px-6 py-16 text-forest/60 font-bold text-center py-20">Loading your journey...</div>
  if (error) return <div className="container mx-auto px-6 py-16 text-red font-bold text-center py-20">Failed to load journey details.</div>
  if (!inquiry) return <div className="container mx-auto px-6 py-16 text-forest/60 font-bold text-center py-20">No journey found.</div>

  const itinerary = inquiry?.itinerarySnapshot || inquiry?.itinerary || {}
  
  // Safely extract the itinerary array assuming the backend could store it directly as an array
  // OR as an object with { timeline: [...] }
  let itineraryArray = [];
  if (Array.isArray(inquiry?.itinerary)) {
      itineraryArray = inquiry.itinerary;
  } else if (Array.isArray(inquiry?.itinerary?.timeline)) {
      itineraryArray = inquiry.itinerary.timeline;
  } else if (Array.isArray(inquiry?.itinerarySnapshot?.timeline)) {
      itineraryArray = inquiry.itinerarySnapshot.timeline;
  }

  const timeline = itineraryArray;

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-display font-bold text-forest mb-2">Trip Summary</h1>
            <p className="text-forest/50 font-bold text-sm uppercase tracking-widest">INQUIRY SENT</p>
          </div>
          <Link to="/my-trips" className="px-6 py-3 bg-forest/5 text-forest rounded-full font-bold">
            Back
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-1">Name</p>
            <p className="font-bold text-forest">{inquiry?.name || 'Not provided'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-1">Trip date</p>
            <p className="font-bold text-forest">{(inquiry?.tripDate || inquiry?.startDate) ? new Date(inquiry?.tripDate || inquiry?.startDate).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-1">Destination</p>
            <p className="font-bold text-forest">{inquiry?.destinationName || inquiry?.district || inquiry?.state || 'Custom Trip'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-1">Days</p>
            <p className="font-bold text-forest">{inquiry?.days ?? itinerary?.days ?? 'Not provided'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-1">People</p>
            <p className="font-bold text-forest">{inquiry?.people ?? itinerary?.people ?? 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-forest/5 shadow-sm">
          <h2 className="text-2xl font-display font-bold text-forest mb-6">Itinerary</h2>
          <div className="space-y-6">
            {(Array.isArray(timeline) && timeline.length > 0) ? timeline.map((day, index) => (
              <div key={day.day || index} className="border-l-2 border-gold/40 pl-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Day {day.day || index + 1} {day.title ? `- ${day.title}` : ''}</p>
                <ul className="space-y-1">
                  {Array.isArray(day.activities) ? day.activities.map((act) => (
                    <li key={act.planId || `${act.destinationName}:${act.name}`} className="font-bold text-forest/80">
                      {act.destinationName}: {act.name}
                    </li>
                  )) : (
                    <li className="font-bold text-forest/80">
                      {day.location || 'Activity'}: {day.title || 'Details to be added'}
                    </li>
                  )}
                </ul>
              </div>
            )) : (
                <p className="text-forest/60 italic">No itinerary available</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-2">Accommodation</p>
            <p className="font-bold text-forest">{inquiry?.hotelSnapshot?.name || inquiry?.hotel || 'Not provided'}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-forest/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-2">Food</p>
            <p className="font-bold text-forest">{inquiry?.foodSnapshot?.name || inquiry?.food || 'Not provided'}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-forest/5 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest/40 mb-2">Budget</p>
            <p className="text-3xl font-display font-bold text-forest">₹{Number(inquiry?.totalBudget || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

