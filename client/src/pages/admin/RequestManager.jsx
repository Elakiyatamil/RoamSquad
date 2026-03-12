import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
    Search,
    MessageSquare,
    Calendar,
    User,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Hash
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { io } from 'socket.io-client';

const statusColors = {
    'New Inquiry': 'bg-ocean',
    'Needs Clarification': 'bg-gold',
    'In Conversation': 'bg-red',
    'Journey Confirmed': 'bg-forest',
    'Not Feasible': 'bg-ink/40'
};

const KanbanCard = ({ request }) => (
    <motion.div
        layoutId={request.id}
        className="bg-white p-5 rounded-2xl border border-ink/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-[10px] font-bold text-ink/40">
                    <User size={14} />
                </div>
                <div>
                    <p className="text-sm font-bold text-ink truncate max-w-[120px]">{request.userName}</p>
                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{request.userEmail?.split('@')[0]}</p>
                </div>
            </div>
            <button className="text-ink/10 group-hover:text-ink/30"><MoreVertical size={16} /></button>
        </div>

        <div className="space-y-3 mb-4">
            <p className="text-xs text-ink/60 font-medium leading-relaxed line-clamp-2">
                {request.extraRequirements || 'No specific requirements mentioned.'}
            </p>
            <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-ink/5 rounded text-[10px] font-bold text-ink/40 uppercase tracking-tighter flex items-center gap-1">
                    <Calendar size={10} /> {request.duration} Days
                </span>
                <span className="px-2 py-0.5 bg-ink/5 rounded text-[10px] font-bold text-ink/40 uppercase tracking-tighter flex items-center gap-1">
                    <Hash size={10} /> {request.travelers} PAX
                </span>
            </div>
        </div>

        <div className="pt-4 border-t border-ink/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-ink/30">
                <MessageSquare size={12} />
                <span className="text-[10px] font-bold">12</span>
            </div>
            <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                {new Date(request.createdAt).toLocaleDateString()}
            </p>
        </div>
    </motion.div>
);

const RequestManager = () => {
    const queryClient = useQueryClient();
    const columns = ['New Inquiry', 'Needs Clarification', 'In Conversation', 'Journey Confirmed', 'Not Feasible'];

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: async () => {
            const response = await apiClient.get('/requests');
            return response.data;
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

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Inquiries</h1>
                    <p className="text-ink/60 font-medium">Real-time itinerary requests from travelers.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start">
                {columns.map(col => (
                    <div key={col} className="w-80 shrink-0 flex flex-col h-full bg-ink/[0.02] rounded-3xl p-4">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusColors[col]}`} />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{col}</h3>
                            </div>
                            <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-ink/30 shadow-sm border border-ink/5">
                                {requests.filter(r => r.status === col).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {isLoading ? (
                                [1, 2].map(i => <div key={i} className="h-40 bg-white/50 rounded-2xl animate-pulse" />)
                            ) : (
                                requests.filter(r => r.status === col).map(req => (
                                    <KanbanCard key={req.id} request={req} />
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RequestManager;
