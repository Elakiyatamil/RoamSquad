import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Download, Ticket, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

export default function MyMeetupsProfile() {
    const { token } = useAuthStore();

    const { data: registrations = [], isLoading, error } = useQuery({
        queryKey: ['myRegistrations'],
        queryFn: async () => {
            const res = await axios.get(`${API}/events/me/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data || [];
        }
    });

    const formatDate = (dt) => {
        if (!dt) return null;
        return new Date(dt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleDownloadReceipt = (reg) => {
        const receiptHtml = `
            <html>
                <head>
                    <title>Receipt - ${reg.bookingId}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #800020; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 28px; font-weight: 900; color: #800020; margin-bottom: 5px; }
                        .title { font-size: 20px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
                        .content { margin-bottom: 40px; }
                        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
                        .label { font-weight: bold; color: #555; }
                        .value { text-align: right; }
                        .total-row { display: flex; justify-content: space-between; padding: 20px 0; font-size: 20px; font-weight: bold; color: #800020; border-top: 2px solid #800020; margin-top: 20px; }
                        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 50px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">ROAMSQUAD</div>
                        <div class="title">Booking Receipt</div>
                    </div>
                    <div class="content">
                        <div class="row">
                            <span class="label">Booking ID</span>
                            <span class="value">${reg.bookingId}</span>
                        </div>
                        <div class="row">
                            <span class="label">Event</span>
                            <span class="value">${reg.event?.title}</span>
                        </div>
                        <div class="row">
                            <span class="label">Date</span>
                            <span class="value">${formatDate(reg.event?.date)}</span>
                        </div>
                        <div class="row">
                            <span class="label">Venue</span>
                            <span class="value">${reg.event?.venue}</span>
                        </div>
                        <div class="row">
                            <span class="label">Attendees (Pax)</span>
                            <span class="value">${reg.persons}</span>
                        </div>
                        <div class="row">
                            <span class="label">Payment Status</span>
                            <span class="value" style="color: green; font-weight: bold;">${reg.paymentStatus}</span>
                        </div>
                        <div class="total-row">
                            <span>Total Amount Paid</span>
                            <span>Rs. ${reg.amount}</span>
                        </div>
                    </div>
                    <div class="footer">
                        This is an automatically generated receipt. Thank you for joining the RoamSquad community!<br>
                        Strictly no cancellations or refunds.
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-[#FDFCF0] pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">My Meetups</h1>
                    <p className="text-gray-500 text-lg">Manage your upcoming and past community experiences.</p>
                </header>

                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 mb-8">
                    <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-red-800 font-bold text-sm mb-1">Strict Policy Enforcement</h4>
                        <p className="text-red-700 text-xs leading-relaxed">
                            As per our terms, all meetup bookings are final. We strictly do not offer cancellations or refunds under any circumstances to ensure a seamless experience for all attendees.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-400">Loading your meetups...</div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 font-bold">Failed to load your meetups.</div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-[#800020]/20 shadow-sm">
                        <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Meetups Booked</h3>
                        <p className="text-gray-500 mb-6">You haven't joined any community meetups yet.</p>
                        <Link to="/events" className="bg-[#800020] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a0016] transition shadow-md">
                            Explore Meetups
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {registrations.map(reg => (
                            <div key={reg.id} className="bg-white rounded-3xl border border-[#800020]/10 overflow-hidden shadow-[0_2px_14px_rgba(128,0,32,0.08)] transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(128,0,32,0.12)]">
                                <div className="md:flex">
                                    <div className="w-full md:w-64 h-48 md:h-auto relative">
                                        <img 
                                            src={reg.event?.coverImage || 'https://via.placeholder.com/320x240?text=Meetup'} 
                                            alt={reg.event?.title} 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3 bg-[#800020] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                            {reg.paymentStatus || 'Confirmed'}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{reg.event?.title}</h3>
                                                <span className="text-sm font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-2xl">
                                                    {reg.bookingId}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                <span className="flex items-center gap-1"><CalendarDays size={16}/> {formatDate(reg.event?.date)}</span>
                                                <span className="flex items-center gap-1"><MapPin size={16}/> {reg.event?.venue || 'Venue TBD'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid gap-4 sm:grid-cols-2 items-center">
                                            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                                                <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-2">Total Paid</div>
                                                <div className="font-black text-xl text-gray-900">₹{reg.amount}</div>
                                                <div className="text-sm text-gray-500 mt-1">{reg.persons} pax</div>
                                            </div>
                                            <button 
                                                onClick={() => handleDownloadReceipt(reg)}
                                                className="self-start flex items-center justify-center gap-2 text-[#800020] font-bold hover:text-white hover:bg-[#800020] bg-[#800020]/10 px-4 py-3 rounded-2xl transition-colors border border-[#800020]/20"
                                            >
                                                <Download size={18} /> Receipt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
