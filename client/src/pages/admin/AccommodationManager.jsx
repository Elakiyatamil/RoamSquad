import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Hotel,
    Star,
    IndianRupee,
    Plus,
    EyeOff,
    ChevronDown
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const AccommodationCard = ({ type, data, onEdit }) => {
    const getIconColor = () => {
        switch (type.toLowerCase()) {
            case 'luxury': return 'text-gold';
            case 'mid-range': return 'text-ocean';
            default: return 'text-forest';
        }
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="card p-8 group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${getIconColor()} opacity-[0.03] -mr-8 -mt-8`}>
                <Hotel size={128} />
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-lg bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/60 border border-ink/5`}>
                    {type}
                </div>
                <div className="flex text-gold">
                    {[...Array(data?.stars || 3)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
            </div>

            <h3 className="text-3xl font-display font-bold text-ink mb-4">{data?.price ? `₹${data.price}` : 'Not Configured'}</h3>
            <p className="text-sm text-ink/60 font-medium mb-6 line-clamp-3">
                {data?.description || 'No description provided for this tier.'}
            </p>

            <div className="space-y-4 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Includes</p>
                <div className="flex flex-wrap gap-2">
                    {(data?.includes || ['WiFi', 'Breakfast', 'Parking']).map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-ink/5 rounded-full text-[10px] font-bold text-ink/60">{item}</span>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-ink/5">
                <div className="flex items-center gap-2 text-red/40 mb-4">
                    <EyeOff size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Private: {data?.internalHotelName || 'Not Set'}</span>
                </div>
                <button onClick={onEdit} className="w-full py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold text-sm transition-all">Configure Tier</button>
            </div>
        </motion.div>
    );
};

const AccommodationManager = () => {
    const queryClient = useQueryClient();
    const [selectedDestId, setSelectedDestId] = useState('');

    const { data: destinations = [], isLoading: isLoadingDestinations } = useQuery({
        queryKey: ['destinations', 'all'],
        queryFn: async () => {
            const response = await apiClient.get('/destinations?limit=100');
            const dests = response.data.data;
            if (dests.length > 0 && !selectedDestId) {
                setSelectedDestId(dests[0].id);
            }
            return dests;
        }
    });

    const { data: accommodations = {}, isLoading: isLoadingAcc } = useQuery({
        queryKey: ['accommodation', selectedDestId],
        queryFn: async () => {
            const response = await apiClient.get(`/destinations/${selectedDestId}/accommodation`);
            return response.data;
        },
        enabled: !!selectedDestId
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Stays & Tiers</h1>
                    <p className="text-ink/60 font-medium">Manage accommodation packages for each destination.</p>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative group min-w-[300px]">
                    <label className="absolute -top-2 left-4 px-1 bg-cream text-[10px] font-bold uppercase tracking-widest text-ink/40 z-10">Select Destination</label>
                    <select
                        value={selectedDestId}
                        onChange={(e) => setSelectedDestId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 appearance-none font-bold text-ink shadow-sm"
                    >
                        {destinations.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoadingAcc ? (
                    [1, 2, 3].map(i => <div key={i} className="card h-96 animate-pulse" />)
                ) : (
                    <>
                        <AccommodationCard type="Budget" data={accommodations.budget} />
                        <AccommodationCard type="Mid-Range" data={accommodations.midRange} />
                        <AccommodationCard type="Luxury" data={accommodations.luxury} />
                    </>
                )}
            </div>
        </div>
    );
};

export default AccommodationManager;
