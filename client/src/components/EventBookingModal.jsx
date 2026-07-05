import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Users, CreditCard, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

const STEPS = ['details', 'summary'];
const STEP_LABELS = ['Details', 'Review'];

export default function EventBookingModal({ isOpen, onClose, event, step, setStep, initialPhone }) {
    const { token, user } = useAuthStore();
    const navigate = useNavigate();

    const [phone, setPhone] = useState(initialPhone || user?.phone || '');
    const [persons, setPersons] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    if (!isOpen) return null;

    const stepIndex = STEPS.indexOf(step);
    const progress = step === 'success' ? 100 : ((stepIndex + 1) / STEPS.length) * 100;

    const goNext = () => {
        if (!phone || phone.length < 10) return toast.error("Enter a valid 10-digit number");
        if (persons < 1 || persons > event.seatsRemaining) return toast.error("Invalid number of guests");

        if (!user) { // Not authenticated
            sessionStorage.setItem('pendingBooking', JSON.stringify({
                eventId: event.id,
                phone: phone,
                persons,
                step: 'summary'
            }));
            navigate('/login', { state: { returnToBooking: true } });
            return;
        }

        setStep('summary');
    };

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);

            const orderRes = await axios.post(`${API}/events/${event.id}/register`, {
                phone, persons
            }, { headers: { Authorization: `Bearer ${token}` } });

            const { registrationId, razorpayOrderId, amount } = orderRes.data.data;

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                const options = {
                    key: 'rzp_test_T95RBuwm7rTtUz', // Hardcoded as provided in .env
                    amount,
                    currency: "INR",
                    name: "RoamSquad Meetups",
                    description: `Booking for ${event.title}`,
                    order_id: razorpayOrderId,
                    handler: async function (response) {
                        try {
                            const verifyRes = await axios.post(`${API}/events/verify-payment`, {
                                registrationId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature
                            }, { headers: { Authorization: `Bearer ${token}` } });

                            setBookingResult(verifyRes.data.data);
                            setStep('success');
                        } catch (err) {
                            toast.error("Payment verification failed");
                            setIsProcessing(false);
                        }
                    },
                    prefill: {
                        name: user?.name || "",
                        email: user?.email || "",
                        contact: phone
                    },
                    theme: { color: "#800020" }
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', () => {
                    toast.error("Payment failed. Please try again.");
                    setIsProcessing(false);
                });
                rzp.open();
                setIsProcessing(false);
            };
            script.onerror = () => {
                toast.error("Failed to load payment gateway");
                setIsProcessing(false);
            };
            document.body.appendChild(script);

        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                useAuthStore.getState().logout();
                navigate('/login');
            } else {
                toast.error(error.response?.data?.error || "Failed to initiate booking");
            }
            setIsProcessing(false);
        }
    };

    const totalAmount = event.price * persons;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={step !== 'success' ? onClose : undefined}
            />

            {/* Modal Card */}
            <div className="relative w-[95vw] md:w-[800px] max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

                {/* Gradient Header Bar */}
                <div className="h-2 shrink-0 bg-gradient-to-r from-[#800020] to-[#5a0016]" />

                {step !== 'success' && (
                    <div className="shrink-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-8 pb-5">
                            <div className="flex items-center gap-3">
                                {STEP_LABELS.map((label, i) => (
                                    <React.Fragment key={label}>
                                        <div className={`flex items-center gap-1.5 ${i <= stepIndex ? 'text-[#800020]' : 'text-gray-300'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < stepIndex ? 'bg-[#800020] text-white' :
                                                    i === stepIndex ? 'bg-[#800020]/10 text-[#800020] ring-2 ring-[#800020]/40' :
                                                        'bg-gray-100 text-gray-400'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <span className={`text-xs font-semibold hidden sm:block ${i <= stepIndex ? 'text-[#800020]' : 'text-gray-400'}`}>{label}</span>
                                        </div>
                                        {i < STEP_LABELS.length - 1 && (
                                            <div className={`h-px w-6 ${i < stepIndex ? 'bg-[#800020]/50' : 'bg-gray-200'}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="mx-8 mb-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#800020] to-[#b3002d] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="px-10 py-8 flex-1 flex flex-col min-h-0 overflow-y-auto">
                        {/* ── STEP 1: Details ── */}
                        {step === 'details' && (
                            <div className="flex flex-col space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Booking details</h3>
                                        <p className="max-w-2xl text-gray-500 text-base mt-4">
                                            Enter your contact number and attendee count so we can reserve your spot and show the final total.
                                        </p>
                                    </div>

                                   <div className="rounded-3xl border border-gray-200 shadow-sm p-8 bg-white">  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-8">
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-600 block mb-4">WhatsApp / Mobile</label>
                                                    <div className="relative">
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                                            <Phone size={22} />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            className="w-full h-16 pl-14 pr-4 rounded-2xl border border-gray-300 bg-gray-50 text-gray-900 text-lg font-medium outline-none focus:border-[#800020] focus:bg-white transition-all placeholder:text-gray-400"
                                                            placeholder="10-digit mobile number"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-600 mb-2">Attendees</div>
                                                        <div className="text-xs text-gray-500">₹{event.price} per person</div>
                                                    </div>
                                                    <div className="inline-flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPersons(p => Math.max(1, p - 1))}
                                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-xl hover:border-[#800020]/50 hover:text-[#800020] transition"
                                                        >−</button>
                                                        <span className="w-14 text-center text-xl font-black text-gray-900">{persons}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPersons(p => Math.min(event.seatsRemaining, p + 1))}
                                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-xl hover:border-[#800020]/50 hover:text-[#800020] transition"
                                                        >+</button>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-[#800020]/10 bg-[#FEF6F8] p-7 text-sm text-gray-700 space-y-3">
                                                    <div className="flex justify-between gap-4">
                                                        <span>Subtotal</span>
                                                        <span className="font-semibold text-gray-900">₹{event.price * persons}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 leading-relaxed">{event.seatsRemaining} spots remaining</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Summary & Pay ── */}
                        {step === 'summary' && (
                            <div className="flex flex-col space-y-8">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Confirm & Pay</h3>
                                    <p className="text-gray-500 text-base mt-4">Review your booking details and complete payment with a single tap.</p>
                                </div>

                                <div className="rounded-[28px] border border-gray-200 shadow-sm overflow-hidden bg-white">
                                   <div className="flex items-center gap-5 p-8 border-b border-gray-100">   {event.coverImage ? (
                                            <img src={event.coverImage} alt={event.title} className="w-24 h-24 rounded-2xl object-cover bg-gray-100 flex-shrink-0" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold flex-shrink-0">No image</div>
                                        )}
                                        <div className="flex-1">
                                            <div className="text-sm uppercase tracking-[0.2em] text-[#800020] font-bold mb-3">Meetup</div>
                                            <div className="font-bold text-2xl text-gray-900 leading-tight">{event.title}</div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7">
                                                <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-4">Contact Number</div>
                                                <div className="text-lg font-semibold text-gray-900 leading-relaxed">{phone}</div>
                                            </div>
                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-7">
                                                <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-4">Attendees</div>
                                                <div className="text-lg font-semibold text-gray-900 leading-relaxed">{persons} person{persons > 1 ? 's' : ''}</div>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-gray-100 bg-white p-7">
                                                <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-4">Price per person</div>
                                                <div className="text-lg font-semibold text-gray-900 leading-relaxed">₹{event.price}</div>
                                            </div>
                                            <div className="rounded-2xl border border-gray-100 bg-white p-7">
                                                <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-4">Total amount</div>
                                                <div className="text-3xl font-black text-[#800020]">₹{totalAmount}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7 mt-8 text-sm text-amber-900 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                                        <p className="font-semibold leading-relaxed">
                                            By paying, you agree to our strict <span className="text-amber-700">No Cancellations / No Refunds</span> policy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    {step !== 'success' ? (
                        <div className="shrink-0 border-t border-gray-200 px-10 py-6 bg-white">
                            {step === 'details' && (
                                <button
                                    onClick={goNext}
                                    className="w-full h-16 rounded-2xl bg-[#800020] text-white font-semibold text-lg hover:bg-[#5a0016] transition-all shadow-lg shadow-[#800020]/20 flex items-center justify-center gap-2.5"
                                >
                                    Review & Pay →
                                </button>
                            )}

                            {step === 'summary' && (
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white font-semibold text-lg hover:opacity-95 transition-all shadow-lg shadow-[#800020]/20 flex items-center justify-center gap-2.5"
                                >
                                    {isProcessing ? (
                                        <><Loader2 size={22} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><CreditCard size={22} /> Pay ₹{totalAmount} Securely</>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between text-center py-6 overflow-y-auto">
                            <div className="space-y-8">
                                <div className="relative w-28 h-28 mx-auto">
                                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-40" />
                                    <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                                        <CheckCircle2 size={52} className="text-white" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">You're In! 🎉</h3>
                                    <p className="text-gray-500 text-lg mt-2">Booking confirmed successfully.</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-200 shadow-sm">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs font-semibold uppercase">Booking ID</span>
                                            <span className="font-bold font-mono text-[#800020] text-lg">{bookingResult?.bookingId}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs font-semibold uppercase">Event</span>
                                            <span className="font-semibold text-gray-800 line-clamp-1">{event.title}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-xs font-semibold uppercase">Date</span>
                                                <span className="font-semibold text-gray-800 text-sm">{new Date(event.date).toDateString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-xs font-semibold uppercase">Guests</span>
                                                <span className="font-semibold text-gray-800 text-sm">{bookingResult?.persons}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => { onClose(); navigate('/my-meetups'); }}
                                    className="w-full bg-[#800020] text-white font-bold py-4 rounded-2xl hover:bg-[#5a0016] transition-all shadow-lg shadow-[#800020]/20 text-lg"
                                >
                                    View My Meetups
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}