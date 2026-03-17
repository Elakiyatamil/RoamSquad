import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, Calendar, User, MoreVertical,
    CheckCircle2, Clock, AlertCircle, XCircle, Hash, ChevronDown, X
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { io } from 'socket.io-client';

const STATUS_OPTIONS = ['New Inquiry', 'Needs Clarification', 'In Conversation', 'Journey Confirmed', 'Not Feasible'];

const statusColors = {
    'New Inquiry': 'bg-ocean',
    'Needs Clarification': 'bg-gold',
    'In Conversation': 'bg-red',
    'Journey Confirmed': 'bg-forest',
    'Not Feasible': 'bg-ink/40'
};

// --- Request Detail Modal ---
const RequestDetail = ({ request, onClose }) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState(request.status);

    const updateMutation = useMutation({
        mutationFn: async (newStatus) => await apiClient.patch(`/requests/${request.id}`, { status: newStatus }),
        onSuccess: (_, newStatus) => {
            setStatus(newStatus);
            queryClient.invalidateQueries(['requests']);
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-ink">{request.userName}</h2>
                        <p className="text-sm text-ink/40 font-medium">{request.userEmail}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all mt-1"><X size={18} /></button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-ink/5 rounded-xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Duration</p>
                            <p className="font-bold text-ink">{request.duration} Days</p>
                        </div>
                        <div className="p-4 bg-ink/5 rounded-xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Travelers</p>
                            <p className="font-bold text-ink">{request.travelers} PAX</p>
                        </div>
                    </div>
                    {request.extraRequirements && (
                        <div className="p-4 bg-ink/5 rounded-xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Requirements</p>
                            <p className="text-sm text-ink/70 font-medium leading-relaxed">{request.extraRequirements}</p>
                        </div>
                    )}
                    <div className="p-4 bg-ink/5 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Submitted</p>
                        <p className="text-sm font-medium text-ink/70">{new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Update Status</p>
                    <div className="grid grid-cols-1 gap-2">
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => updateMutation.mutate(s)}
                                disabled={updateMutation.isPending}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${status === s
                                        ? 'bg-ink text-white shadow-lg'
                                        : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${statusColors[s]}`} />
                                {s}
                                {status === s && <span className="ml-auto text-[10px] uppercase tracking-widest opacity-60">Current</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- Kanban Card ---
const KanbanCard = ({ request, onClick }) => (
    <motion.div
        layoutId={request.id}
        onClick={() => onClick(request)}
        className="bg-white p-5 rounded-2xl border border-ink/5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-ink/10"
        whileHover={{ scale: 1.01 }}
    >
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center">
                    <User size={14} className="text-ink/30" />
                </div>
                <div>
                    <p className="text-sm font-bold text-ink truncate max-w-[120px]">{request.userName}</p>
                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{request.userEmail?.split('@')[0]}</p>
                </div>
            </div>
            <button className="text-ink/10 group-hover:text-ink/30 transition-colors"><MoreVertical size={16} /></button>
        </div>

        {request.extraRequirements && (
            <p className="text-xs text-ink/60 font-medium leading-relaxed line-clamp-2 mb-3">
                {request.extraRequirements}
            </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 bg-ink/5 rounded text-[10px] font-bold text-ink/40 flex items-center gap-1">
                <Calendar size={10} /> {request.duration} Days
            </span>
            <span className="px-2 py-0.5 bg-ink/5 rounded text-[10px] font-bold text-ink/40 flex items-center gap-1">
                <Hash size={10} /> {request.travelers} PAX
            </span>
        </div>

        <div className="pt-3 border-t border-ink/5 flex items-center justify-between">
            <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest">Click to manage</p>
            <p className="text-[10px] text-ink/40 font-bold">{new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
    </motion.div>
);

// --- Main Manager ---
const RequestManager = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: async () => {
            const res = await apiClient.get('/requests');
            return res.data;
        }
    });

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socket.on('request:updated', (updated) => {
            queryClient.setQueryData(['requests'], (old) => {
                if (!old) return old;
                return old.map(r => r.id === updated.id ? updated : r);
            });
        });
        return () => socket.disconnect();
    }, [queryClient]);

    const filtered = requests.filter(r =>
        r.userName?.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Inquiries</h1>
                    <p className="text-ink/60 font-medium">Real-time itinerary requests from travelers.</p>
                </div>
                <div className="relative group min-w-[280px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start">
                {STATUS_OPTIONS.map(col => (
                    <div key={col} className="w-72 shrink-0 flex flex-col bg-ink/[0.02] rounded-3xl p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusColors[col]}`} />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{col}</h3>
                            </div>
                            <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-ink/30 shadow-sm border border-ink/5">
                                {filtered.filter(r => r.status === col).length}
                            </span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar max-h-[calc(100vh-320px)]">
                            {isLoading ? (
                                [1, 2].map(i => <div key={i} className="h-36 bg-white/50 rounded-2xl animate-pulse" />)
                            ) : filtered.filter(r => r.status === col).length === 0 ? (
                                <div className="py-8 text-center text-ink/20">
                                    <p className="text-xs font-bold">No requests here</p>
                                </div>
                            ) : (
                                filtered.filter(r => r.status === col).map(req => (
                                    <KanbanCard key={req.id} request={req} onClick={setSelectedRequest} />
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedRequest && (
                    <RequestDetail
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default RequestManager;
