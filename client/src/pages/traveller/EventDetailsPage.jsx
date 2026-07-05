import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, CalendarDays, CheckCircle2, ShieldAlert, Star } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import EventBookingModal from '../../components/EventBookingModal';
import './EventDetailsPage.css';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

export default function EventDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuthStore();
    
    const [openModal, setOpenModal] = useState(false);
    const [bookingStep, setBookingStep] = useState('phone'); // phone, persons, summary, payment
    const [initialPhone, setInitialPhone] = useState('');
    const [currentReviewIdx, setCurrentReviewIdx] = useState(0);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['eventDetails', id],
        queryFn: async () => {
            const res = await axios.get(`${API}/events/${id}`);
            return res.data.data;
        }
    });

    // Handle Auth-Interrupted Flow
    useEffect(() => {
        if (isAuthenticated) {
            const pending = sessionStorage.getItem('pendingBooking');
            if (pending) {
                try {
                    const data = JSON.parse(pending);
                    if (data.eventId === id) {
                        setInitialPhone(data.phone || '');
                        setBookingStep(data.step || 'summary');
                        setOpenModal(true);
                    }
                } catch(e) {}
                sessionStorage.removeItem('pendingBooking');
            }
        }
    }, [isAuthenticated, id]);

    // Auto-rotate reviews
    useEffect(() => {
        if (!event?.reviews || event.reviews.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentReviewIdx(prev => (prev + 1) % event.reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [event?.reviews]);

    const handleJoinClick = () => {
        setBookingStep('details');
        setOpenModal(true);
    };

    const formatDate = (dt) => {
        if (!dt) return null;
        return new Date(dt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) return <div className="loading-state">Loading Meetup Details...</div>;
    if (error || !event) return <div className="error-state">Meetup not found.</div>;

    const avgRating = event.reviews?.length 
        ? (event.reviews.reduce((acc, r) => acc + r.rating, 0) / event.reviews.length).toFixed(1)
        : 'New';

    return (
        <div className="event-details-page">
            {/* Hero Image */}
            <div className="event-hero" style={{ backgroundImage: `url(${event.coverImage})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>{event.title}</h1>
                    <p className="tagline">{event.tagline}</p>
                    <a 
                        href={event.googleMap && !event.googleMap.includes('<iframe') ? event.googleMap : `https://maps.google.com/?q=${encodeURIComponent(event.venue + ' ' + event.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hero-location"
                    >
                        <MapPin size={20} className="mt-0.5" />
                        <span>{event.venue}, {event.address}</span>
                    </a>
                </div>
            </div>

            <div className="event-content-grid">
                {/* Left Column */}
                <div className="event-main-content">
                    <section className="event-section">
                        <h2>About this Meetup</h2>
                        <p className="description">{event.description}</p>
                    </section>

                    {(event.highlights?.length > 0 || event.thingsToBring?.length > 0) && (
                        <div className="grid-2-col">
                            {event.highlights?.length > 0 && (
                                <section className="event-section box-section">
                                    <h3>Highlights</h3>
                                    <ul className="check-list">
                                        {event.highlights.map((h, i) => (
                                            <li key={i}><CheckCircle2 size={18} className="check-icon" /> {h}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                            
                            {event.thingsToBring?.length > 0 && (
                                <section className="event-section box-section">
                                    <h3>What to bring</h3>
                                    <ul className="dot-list">
                                        {event.thingsToBring.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    )}



                    <section className="event-section reviews-section">
                        <h2><Star size={24} className="star-icon" /> {avgRating} · {event.reviews?.length || 0} Community Stories</h2>
                        
                        {event.reviews?.length > 0 ? (
                            <div className="stacked-reviews-container">
                                {event.reviews.map((review, idx) => {
                                    // Calculate relative position (0 is active, 1 is next, 2 is after next...)
                                    const diff = (idx - currentReviewIdx + event.reviews.length) % event.reviews.length;
                                    
                                    // Only show up to 3 cards in the stack
                                    if (diff > 2 && event.reviews.length > 3) return null;

                                    return (
                                        <div 
                                            key={review.id} 
                                            className={`stacked-review-card stacked-card-${diff}`}
                                            onClick={() => setCurrentReviewIdx(idx)}
                                        >
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <div className="reviewer-avatar">
                                                        {review.reviewerName?.charAt(0) || review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="reviewer-name">{review.reviewerName || review.user?.name || 'Explorer'}</span>
                                                </div>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < review.rating ? "star-icon-active" : "star-icon-inactive"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="review-text">"{review.review}"</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-reviews-msg">Be the first to share your experience!</p>
                        )}
                        
                        {event.reviews?.length > 1 && (
                            <div className="review-dots">
                                {event.reviews.map((_, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setCurrentReviewIdx(idx)}
                                        className={`dot ${idx === currentReviewIdx ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Sticky Booking Card */}
                <div className="event-sidebar">
                    <div className="booking-card">
                        <div className="booking-header">
                            <div className="price-display">
                                <span className="price">₹{event.price}</span>
                                <span className="person">/ person</span>
                            </div>
                        </div>

                        <div className="logistics-box">
                            <div className="logistic-item">
                                <CalendarDays size={20} />
                                <div>
                                    <div className="label">Date</div>
                                    <div className="value">{formatDate(event.date)}</div>
                                </div>
                            </div>
                            <div className="logistic-item">
                                <Clock size={20} />
                                <div>
                                    <div className="label">Time</div>
                                    <div className="value">{event.startTime} - {event.endTime}</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            className="primary-booking-btn"
                            disabled={event.seatsRemaining === 0}
                            onClick={handleJoinClick}
                        >
                            {event.seatsRemaining === 0 ? 'Waitlist (Sold Out)' : 'Join Meetup'}
                        </button>
                        
                        <div className="seats-indicator">
                            {event.seatsRemaining > 0 ? (
                                <span className={event.seatsRemaining <= 5 ? 'urgent' : ''}>
                                    Only {event.seatsRemaining} spots left
                                </span>
                            ) : (
                                <span className="sold-out">No spots remaining</span>
                            )}
                        </div>

                        <div className="strict-policy-banner">
                            <ShieldAlert size={16} />
                            <span>Strictly No Cancellations or Refunds.</span>
                        </div>
                    </div>
                </div>
            </div>

            {openModal && (
                <EventBookingModal 
                    isOpen={openModal} 
                    onClose={() => setOpenModal(false)}
                    event={event}
                    step={bookingStep}
                    setStep={setBookingStep}
                    initialPhone={initialPhone}
                />
            )}
        </div>
    );
}
