import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Clock,
    IndianRupee,
    Zap,
    MoreVertical,
    Edit2,
    Trash2
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const ActivityCard = ({ activity, index, onDelete }) => {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-forest';
            case 'moderate': return 'bg-gold';
            case 'hard': return 'bg-red';
            default: return 'bg-ink/10';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="card group cursor-pointer"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center text-2xl">
                        {activity.icon || '🏕️'}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-ink/40 hover:text-ink transition-colors p-1">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => onDelete(activity.id)} className="text-ink/40 hover:text-red transition-colors p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-1">{activity.name}</h3>
                <p className="text-xs text-ink/40 font-bold uppercase tracking-widest mb-4">
                    {activity.destination?.name || 'Global'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-ink/60 text-sm font-medium">
                        <Clock size={14} className="text-ocean" />
                        {activity.duration || '2h'}
                    </div>
                    <div className="flex items-center gap-2 text-ink/60 text-sm font-medium">
                        <IndianRupee size={14} className="text-forest" />
                        {activity.price || '500'}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <span>Difficulty: {activity.difficulty || 'Easy'}</span>
                        <Zap size={10} />
                    </div>
                    <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: activity.difficulty === 'Hard' ? '100%' : activity.difficulty === 'Moderate' ? '60%' : '30%' }}
                            className={`h-full ${getDifficultyColor(activity.difficulty)}`}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ActivitiesManager = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await apiClient.get('/activities');
            return response.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/activities/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['activities'])
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Activities</h1>
                    <p className="text-ink/60 font-medium">Manage thrills, culture, and nature experiences.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Activity
                </button>
            </div>

            <div className="relative max-w-md group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                <input
                    type="text"
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card h-[250px] animate-pulse bg-white/50" />
                    ))
                ) : (
                    activities
                        .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
                        .map((activity, i) => (
                            <ActivityCard key={activity.id} activity={activity} index={i} onDelete={handleDelete} />
                        ))
                )}
            </div>
        </div>
    );
};

export default ActivitiesManager;
