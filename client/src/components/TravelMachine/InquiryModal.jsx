import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, CheckCircle, Download, ArrowRight, Loader2, FileText, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { generatePDF } from '../../utils/pdfExport';
import './InquiryModal.css';

const InquiryModal = ({ isOpen, onClose, selectedItems, totalPrice, destination, user }) => {
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const handleSubmit = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                userId: user?.id,
                name: user?.name || 'Guest User',
                email: user?.email,
                phone: phone,
                destinationId: destination?.id,
                destinationName: destination?.name,
                itinerary: { items: selectedItems },
                itinerarySnapshot: { items: selectedItems },
                totalBudget: totalPrice,
                tripDate: new Date(), // Default to today or ask for date
                status: 'INQUIRY SENT'
            };

            await axios.post(`${API_BASE}/api/inquiry`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('roamsquad-traveller-auth') ? JSON.parse(localStorage.getItem('roamsquad-traveller-auth')).state.token : ''}` }
            });

            setSent(true);
        } catch (err) {
            console.error('Inquiry error:', err);
            setError(err.response?.data?.error || 'Failed to send inquiry');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const hotelItem = selectedItems.find(i => i.hotelNameInternal || i.tier);
        const foodItems = selectedItems.filter(i => i.category === 'Food' || i.type === 'Food').map(i => i.name);
        const activityNames = selectedItems.filter(i => !i.tier && !foodItems.includes(i.name)).map(i => i.name);

        const pdfData = {
            name: user?.name || 'Guest User',
            email: user?.email,
            phone: phone,
            destinationName: destination?.name,
            totalBudget: totalPrice,
            itinerary: {
                days: 1,
                people: 2, // Mock or get from props
                vibe: 'Discovery',
                timeline: [
                    { day: 1, activities: activityNames.map(name => ({ name, destinationName: destination?.name })) }
                ]
            },
            hotelSnapshot: hotelItem ? { name: hotelItem.name || hotelItem.tier, description: 'Selected Luxury Accommodation' } : null,
            foodSnapshot: { items: foodItems }
        };

        await generatePDF(pdfData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {sent ? 'Sent Successfully!' : 'Confirm Your Selection'}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {sent ? 'Your inquiry is on its way' : 'Almost there! Just a few more details'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {!sent ? (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Selected Summary Card */}
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-[#2D5A5A]/10 rounded-xl flex items-center justify-center text-[#2D5A5A]">
                                            <ShoppingBag size={20} />
                                        </div>
                                        <h3 className="font-bold text-slate-800">Trip Summary</h3>
                                    </div>
                                    <div className="space-y-3 mb-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 font-medium truncate flex-1">{item.name || item.tier}</span>
                                                <span className="text-slate-900 font-bold ml-4">₹{item.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                                        <span className="text-xl font-black text-[#2D5A5A]">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Whatsapp Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="tel" 
                                            placeholder="Enter your phone number" 
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#2D5A5A] rounded-2xl outline-none font-bold transition-all"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>
                                )}

                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-[#2D5A5A] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#2D5A5A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
                                    {!loading && <ArrowRight size={20} />}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-10 text-center"
                            >
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
                                <p className="text-slate-500 text-sm font-medium max-w-xs mb-10">
                                    Our travel designers are reviewing your choices. We'll contact you on <span className="font-bold text-slate-900">{phone}</span> shortly.
                                </p>

                                <div className="flex flex-col gap-3 w-full">
                                    <button 
                                        onClick={handleDownloadPDF}
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors"
                                    >
                                        <Download size={20} />
                                        Download Summary PDF
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="w-full bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Go Back to Discovery
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default InquiryModal;
