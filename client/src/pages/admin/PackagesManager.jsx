import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Package,
    Plus,
    Search,
    IndianRupee,
    Calendar,
    MoreVertical,
    Edit2,
    Trash2
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const PackageCard = ({ item, index, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="card group cursor-pointer"
    >
        <div className="aspect-[16/10] bg-ink/5 relative overflow-hidden">
            {item.image ? (
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/10"><Package size={48} /></div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-widest text-red">
                {item.days} Days
            </div>
        </div>

        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold truncate pr-4">{item.name}</h3>
                <div className="flex gap-2">
                    <button className="text-ink/20 hover:text-ink"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(item.id)} className="text-ink/20 hover:text-red"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-forest font-bold">
                    <IndianRupee size={14} />
                    <span>{item.price}</span>
                </div>
                <div className="w-1 h-1 bg-ink/10 rounded-full" />
                <div className="flex items-center gap-1.5 text-ink/40 font-bold text-xs uppercase tracking-widest">
                    <Calendar size={14} />
                    <span>Seasonal</span>
                </div>
            </div>

            <p className="text-sm text-ink/60 mb-6 line-clamp-2">{item.description}</p>
            <button className="w-full py-3 bg-red/5 hover:bg-red text-red hover:text-white rounded-xl font-bold text-sm transition-all">Edit Package</button>
        </div>
    </motion.div>
);

const PackagesManager = () => {
    const queryClient = useQueryClient();

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const response = await apiClient.get('/packages');
            return response.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/packages/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['packages'])
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Global Packages</h1>
                    <p className="text-ink/60 font-medium">Manage multi-destination curated itineraries.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> New Package
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="card h-[400px] animate-pulse bg-white/50" />)
                ) : (
                    packages.map((pkg, i) => (
                        <PackageCard key={pkg.id} item={pkg} index={i} onDelete={handleDelete} />
                    ))
                )}
            </div>
        </div>
    );
};

export default PackagesManager;
