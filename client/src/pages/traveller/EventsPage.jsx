import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Loader2, CalendarDays, Star } from 'lucide-react';
import axios from 'axios';
import './EventsPage.css';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

export default function EventsPage() {
    const navigate = useNavigate();

    const { data: events = [], isLoading, error } = useQuery({
        queryKey: ['publicEvents'],
        queryFn: async () => {
            const res = await axios.get(`${API}/events/public`);
            return res.data.data || [];
        }
    });

    const formatDate = (dt) => {
        if (!dt) return null;
        try {
            return new Date(dt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dt; }
    };

    const getImgUrl = (url) => {
        const PLACEHOLDER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
        if (!url || url === 'null' || url === 'undefined') return PLACEHOLDER;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${base}${path}`;
    };

    return (
        <div className="events-page">
            <header className="events-header-premium">
                <h1 className="events-title-premium">Community Meetups</h1>
                <p className="events-subtitle-premium">Exclusive experiences curated for the RoamSquad community.</p>
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 size={32} className="animate-spin mr-3" /> 
                    <span>Curating experiences...</span>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 font-bold">
                    <p>Failed to load meetups. Please try again.</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No upcoming meetups right now. Stay tuned!</p>
                </div>
            ) : (
                <div className="meetups-grid">
                    {events.map((evt) => (
                        <div key={evt.id} className="meetup-card" onClick={() => navigate(`/events/${evt.id}`)}>
                            <div className="meetup-image-container">
                                <img src={getImgUrl(evt.coverImage || evt.image || evt.imageUrl || evt.photo || evt.bannerImage || evt.image_url)} alt={evt.title} />
                                {evt.seatsRemaining > 0 && evt.seatsRemaining <= 5 && (
                                    <div className="meetup-badge-urgent">🔥 Only {evt.seatsRemaining} Left</div>
                                )}
                                {evt.seatsRemaining === 0 && (
                                    <div className="meetup-badge-soldout">Sold Out</div>
                                )}
                            </div>
                            <div className="meetup-card-body">
                                <div className="meetup-header-row">
                                    <h3 className="meetup-title">{evt.title}</h3>
                                    <div className="meetup-rating">
                                        <Star size={14} className="star-icon" /> {evt.rating || 'New'}
                                    </div>
                                </div>
                                
                                <div className="meetup-meta-row">
                                    <span className="meetup-date">{formatDate(evt.date)}</span>
                                    <span className="dot-separator">•</span>
                                    <span className="meetup-venue">
                                        <MapPin size={12} className="inline mr-1" />
                                        {evt.venue}
                                    </span>
                                </div>
                                
                                <div className="meetup-footer-row">
                                    <div className="meetup-price">
                                        <span className="currency">₹</span>{evt.price}
                                        <span className="per-person">/person</span>
                                    </div>
                                    <button 
                                        className="meetup-join-btn"
                                        disabled={evt.seatsRemaining === 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (evt.seatsRemaining > 0) navigate(`/events/${evt.id}`);
                                        }}
                                    >
                                        {evt.seatsRemaining === 0 ? 'Waitlist' : 'Join Meetup'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
