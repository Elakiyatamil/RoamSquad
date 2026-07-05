import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';

const EMPTY_FORM = {
    title: '', tagline: '', description: '', venue: '', address: '', googleMap: '',
    date: '', startTime: '', endTime: '', hostName: '', contactNumber: '', emergencyContact: '',
    maxAttendees: 10, price: 0, highlights: '', thingsToBring: '', coverImage: '', status: 'DRAFT'
};

export default function EventsManager() {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [imgUploading, setImgUploading] = useState(false);

    // Reviews State
    const [selectedEventId, setSelectedEventId] = useState('');
    const [eventReviews, setEventReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, review: '' });

    useEffect(() => {
        if (activeTab === 'DASHBOARD' || activeTab === 'EVENTS' || activeTab === 'REVIEWS') fetchEvents();
        if (activeTab === 'REGISTRATIONS') fetchRegistrations();
    }, [activeTab]);

    useEffect(() => {
        if (selectedEventId) {
            fetchEventReviews(selectedEventId);
        } else {
            setEventReviews([]);
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events');
            setEvents(data.data || []);
        } catch (e) {
            console.error('Failed to fetch events', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events/admin/registrations');
            setRegistrations(data.data || []);
        } catch (e) {
            console.error('Failed to fetch registrations', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventReviews = async (eventId) => {
        try {
            const { data } = await api.get(`/events/${eventId}`);
            setEventReviews(data.data?.reviews || []);
        } catch (e) {
            console.error('Failed to fetch event reviews', e);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEventId) return alert('Select an event first');
        try {
            await api.post(`/events/${selectedEventId}/reviews`, reviewForm);
            alert('Review added successfully!');
            setReviewForm({ reviewerName: '', rating: 5, review: '' });
            fetchEventReviews(selectedEventId);
        } catch (e) {
            alert('Error adding review: ' + (e.response?.data?.error || e.message));
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await api.delete(`/events/reviews/${reviewId}`);
            fetchEventReviews(selectedEventId);
        } catch (e) {
            alert('Failed to delete review');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        try {
            setImgUploading(true);
            const { data } = await api.post('/upload/image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, coverImage: data.url }));
        } catch (e) {
            alert('Image upload failed: ' + (e.response?.data?.error || e.message));
        } finally {
            setImgUploading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                highlights: formData.highlights.split(',').map(s => s.trim()).filter(Boolean),
                thingsToBring: formData.thingsToBring.split(',').map(s => s.trim()).filter(Boolean),
            };
            if (editingId) {
                await api.patch(`/events/${editingId}`, payload);
                alert('Event updated!');
            } else {
                await api.post('/events', payload);
                alert('Event created!');
            }
            setEditingId(null);
            setFormData(EMPTY_FORM);
            setActiveTab('EVENTS');
        } catch (e) {
            alert('Error saving event: ' + (e.response?.data?.error || e.message));
        }
    };

    const editEvent = (event) => {
        setEditingId(event.id);
        setFormData({
            title: event.title || '',
            tagline: event.tagline || '',
            description: event.description || '',
            venue: event.venue || '',
            address: event.address || '',
            googleMap: event.googleMap || '',
            date: event.date?.split('T')[0] || '',
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            hostName: event.hostName || '',
            contactNumber: event.contactNumber || '',
            emergencyContact: event.emergencyContact || '',
            maxAttendees: event.maxAttendees || 10,
            price: event.price || 0,
            highlights: event.highlights?.join(', ') || '',
            thingsToBring: event.thingsToBring?.join(', ') || '',
            coverImage: event.coverImage || '',
            status: event.status || 'DRAFT',
        });
        setActiveTab('FORM');
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (e) {
            alert('Delete failed');
        }
    };

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const inputCls = "w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold text-gray-800">Community Meetups</h1>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto whitespace-nowrap">
                    {['DASHBOARD', 'FORM', 'EVENTS', 'REGISTRATIONS', 'REVIEWS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                activeTab === tab
                                    ? 'bg-white shadow text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-gray-400 text-center py-10">Loading...</p>}

            {/* ── DASHBOARD ── */}
            {!loading && activeTab === 'DASHBOARD' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Events</h3>
                        <p className="text-4xl font-black mt-2 text-gray-900">{events.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Published</h3>
                        <p className="text-4xl font-black mt-2 text-green-600">{events.filter(e => e.status === 'PUBLISHED').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Drafts</h3>
                        <p className="text-4xl font-black mt-2 text-amber-500">{events.filter(e => e.status === 'DRAFT').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Completed</h3>
                        <p className="text-4xl font-black mt-2 text-gray-400">{events.filter(e => e.status === 'COMPLETED').length}</p>
                    </div>
                </div>
            )}

            {/* ── FORM ── */}
            {!loading && activeTab === 'FORM' && (
                <form onSubmit={handleFormSubmit} className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-700 border-b pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Title" value={formData.title} onChange={e => set('title', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Tagline" value={formData.tagline} onChange={e => set('tagline', e.target.value)} className={inputCls} required />
                            <textarea placeholder="Description" value={formData.description} onChange={e => set('description', e.target.value)} className={`${inputCls} md:col-span-2 h-24`} required />
                        </div>
                    </div>

                    {/* Venue & Time */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-700 border-b pb-2">Venue & Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Venue Name" value={formData.venue} onChange={e => set('venue', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Address" value={formData.address} onChange={e => set('address', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Google Maps URL (optional)" value={formData.googleMap} onChange={e => set('googleMap', e.target.value)} className={`${inputCls} md:col-span-2`} />
                            <input type="date" value={formData.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
                            <div className="flex gap-2 items-center">
                                <input type="time" value={formData.startTime} onChange={e => set('startTime', e.target.value)} className={inputCls} required />
                                <span className="text-gray-400 text-sm shrink-0">to</span>
                                <input type="time" value={formData.endTime} onChange={e => set('endTime', e.target.value)} className={inputCls} required />
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-700 border-b pb-2">Logistics & Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="number" placeholder="Max Attendees" value={formData.maxAttendees} onChange={e => set('maxAttendees', e.target.value)} className={inputCls} required />
                            <input type="number" placeholder="Price (₹)" value={formData.price} onChange={e => set('price', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Host Name" value={formData.hostName} onChange={e => set('hostName', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Contact Number" value={formData.contactNumber} onChange={e => set('contactNumber', e.target.value)} className={inputCls} required />
                            <input type="text" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className={`${inputCls} md:col-span-2`} />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-700 border-b pb-2">Details (comma-separated)</h3>
                        <textarea placeholder="Highlights — e.g. Free Drinks, DJ Night, Live Music" value={formData.highlights} onChange={e => set('highlights', e.target.value)} className={`${inputCls} h-16`} />
                        <textarea placeholder="Things to bring — e.g. ID Card, Jacket, Water Bottle" value={formData.thingsToBring} onChange={e => set('thingsToBring', e.target.value)} className={`${inputCls} h-16`} />
                    </div>

                    {/* Media & Status */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-700 border-b pb-2">Media & Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cover Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className={`${inputCls} flex-1`}
                                    />
                                    {imgUploading && <span className="text-xs text-indigo-500 font-semibold">Uploading...</span>}
                                    {formData.coverImage && !imgUploading && (
                                        <img src={formData.coverImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg border" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
                                <select value={formData.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                            {editingId ? 'Update Event' : 'Create Event'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setActiveTab('EVENTS'); }}
                                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* ── EVENTS TABLE ── */}
            {!loading && activeTab === 'EVENTS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800">All Events ({events.length})</h2>
                        <button onClick={() => { setFormData(EMPTY_FORM); setEditingId(null); setActiveTab('FORM'); }} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-semibold">
                            + New Event
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seats</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {events.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img className="h-10 w-10 rounded-lg object-cover" src={event.coverImage || 'https://via.placeholder.com/40'} alt="" />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{event.title}</div>
                                                    <div className="text-xs text-gray-500">₹{event.price}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.date).toLocaleDateString('en-IN')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{event.maxAttendees - event.seatsRemaining} / {event.maxAttendees}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
                                                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button onClick={() => editEvent(event)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── REGISTRATIONS TABLE ── */}
            {!loading && activeTab === 'REGISTRATIONS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">All Registrations ({registrations.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {registrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-indigo-700 font-bold">{reg.bookingId}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{reg.user?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{reg.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{reg.event?.title}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{reg.amount} <span className="font-normal text-gray-500">({reg.persons} pax)</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
                                                reg.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {reg.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── REVIEWS MANAGER ── */}
            {!loading && activeTab === 'REVIEWS' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4">Manage Event Reviews (Testimonials)</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Select Event</label>
                            <select 
                                value={selectedEventId} 
                                onChange={e => setSelectedEventId(e.target.value)} 
                                className={inputCls}
                            >
                                <option value="">-- Choose an event --</option>
                                {events.filter(e => e.status === 'PUBLISHED').map(e => (
                                    <option key={e.id} value={e.id}>{e.title}</option>
                                ))}
                            </select>
                        </div>

                        {selectedEventId && (
                            <form onSubmit={handleReviewSubmit} className="space-y-4 border-t pt-6">
                                <h3 className="text-sm font-bold text-gray-700">Add New Review</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Reviewer Name" 
                                        value={reviewForm.reviewerName} 
                                        onChange={e => setReviewForm({...reviewForm, reviewerName: e.target.value})} 
                                        className={inputCls} 
                                        required 
                                    />
                                    <select 
                                        value={reviewForm.rating} 
                                        onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} 
                                        className={inputCls}
                                    >
                                        {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                    </select>
                                    <textarea 
                                        placeholder="Review text..." 
                                        value={reviewForm.review} 
                                        onChange={e => setReviewForm({...reviewForm, review: e.target.value})} 
                                        className={`${inputCls} md:col-span-2 h-20`} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 text-sm">
                                    Add Review
                                </button>
                            </form>
                        )}
                    </div>

                    {selectedEventId && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-800">Existing Reviews ({eventReviews.length})</h2>
                            </div>
                            <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                                {eventReviews.map(rev => (
                                    <div key={rev.id} className="border rounded-xl p-4 flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{rev.reviewerName || rev.user?.name || 'Anonymous'}</div>
                                            <div className="text-yellow-500 text-xs mb-2">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                                            <div className="text-sm text-gray-600 italic">"{rev.review}"</div>
                                        </div>
                                        <button onClick={() => deleteReview(rev.id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                {eventReviews.length === 0 && (
                                    <p className="text-gray-400 text-sm italic col-span-2">No reviews for this event yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
