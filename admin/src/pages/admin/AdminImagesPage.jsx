import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
    Image as ImageIcon, 
    Search, 
    Filter, 
    MapPin, 
    Star, 
    Layers,
    ChevronRight,
    Loader2
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import ImageUploader from '../../components/admin/ImageUploader';

const AdminImagesPage = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('destinations');

    // Fetch Data
    const { data: destinations = [], isLoading: loadingDestinations } = useQuery({
        queryKey: ['destinations'],
        queryFn: async () => {
            const res = await apiClient.get('/destinations');
            return res.data.data || [];
        }
    });

    const { data: activities = [], isLoading: loadingActivities } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const res = await apiClient.get('/activities');
            return res.data.data || [];
        }
    });

    const { data: packages = [], isLoading: loadingPackages } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const res = await apiClient.get('/packages');
            return res.data.data || [];
        }
    });

    // Mutations
    const updateEntityMutation = useMutation({
        mutationFn: async ({ type, id, image_url, cloudinary_public_id }) => {
            let endpoint = '';
            switch(type) {
                case 'destinations': endpoint = `/destinations/${id}`; break;
                case 'activities': endpoint = `/activities/${id}`; break;
                case 'packages': endpoint = `/packages/${id}`; break;
                default: throw new Error('Invalid type');
            }
            return await apiClient.patch(endpoint, { image_url, cloudinary_public_id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['destinations']);
            queryClient.invalidateQueries(['activities']);
            queryClient.invalidateQueries(['packages']);
        }
    });

    const handleUpload = (type, id, url, publicId) => {
        updateEntityMutation.mutate({ type, id, image_url: url, cloudinary_public_id: publicId });
    };

    const filteredData = () => {
        let data = [];
        if (activeTab === 'destinations') data = destinations;
        if (activeTab === 'activities') data = activities;
        if (activeTab === 'packages') data = packages;

        return data.filter(item => 
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.id?.toLowerCase().includes(search.toLowerCase())
        );
    };

    const tabs = [
        { id: 'destinations', label: 'Destinations', icon: <MapPin size={14} />, folder: 'roamsquad/destinations' },
        { id: 'activities', label: 'Experiences', icon: <Star size={14} />, folder: 'roamsquad/experiences' },
        { id: 'packages', label: 'Hero Banners', icon: <Layers size={14} />, folder: 'roamsquad/heroes' }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-ink tracking-tight">Image Pipeline</h1>
                <p className="text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em]">Proto-Production Asset Management</p>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-ink/5 shadow-sm">
                <div className="flex bg-ink/5 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg
                                ${activeTab === tab.id ? 'bg-white text-red shadow-sm' : 'text-ink/40 hover:text-ink'}
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={16} />
                    <input 
                        type="text"
                        placeholder="Search entities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-ink/5 rounded-xl border-none outline-none text-xs font-bold"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {(loadingDestinations || loadingActivities || loadingPackages) ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-ink/20">
                        <Loader2 size={32} className="animate-spin" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Loading assets...</p>
                    </div>
                ) : filteredData().length === 0 ? (
                    <div className="py-20 bg-white border-2 border-dashed border-ink/5 rounded-3xl flex flex-col items-center justify-center gap-2 text-ink/20">
                        <ImageIcon size={48} />
                        <p className="text-sm font-bold">No {activeTab} found</p>
                    </div>
                ) : (
                    filteredData().map(item => (
                        <motion.div 
                            layout
                            key={item.id} 
                            className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="grid md:grid-cols-[1fr,250px] gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red/5 flex items-center justify-center text-red">
                                            {activeTab === 'destinations' ? <MapPin size={20} /> : activeTab === 'activities' ? <Star size={20} /> : <Layers size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink">{item.name}</h3>
                                            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">ID: {item.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-ink/5 rounded-lg w-fit">
                                        <div className={`w-2 h-2 rounded-full ${item.image_url ? 'bg-emerald-500' : 'bg-red'}`} />
                                        <span className="text-[10px] font-bold text-ink/60 uppercase tracking-widest">
                                            {item.image_url ? 'Active Asset' : 'Image Needed'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <ImageUploader 
                                        folder={tabs.find(t => t.id === activeTab).folder}
                                        currentUrl={item.image_url}
                                        onUpload={(url, publicId) => handleUpload(activeTab, item.id, url, publicId)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminImagesPage;
