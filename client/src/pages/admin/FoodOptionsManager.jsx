import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    IndianRupee,
    Leaf,
    MoreVertical,
    Edit2,
    Trash2,
    ChevronDown
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const FoodCard = ({ food, index, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white p-4 rounded-xl border border-ink/5 shadow-sm group hover:border-red/20 transition-all flex items-center gap-4"
        >
            <div className="w-12 h-12 bg-cream rounded-lg flex items-center justify-center text-xl shrink-0">
                {food.emoji || '🍲'}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-ink truncate">{food.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-widest flex items-center gap-0.5">
                        <Leaf size={10} /> {food.dietaryTag || 'Veg'}
                    </span>
                    <span className="text-xs text-ink/40 font-bold">₹{food.price}</span>
                </div>
            </div>
            <button onClick={() => onDelete(food.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-ink/20 hover:text-red">
                <Trash2 size={16} />
            </button>
        </motion.div>
    );
};

const FoodOptionsManager = () => {
    const queryClient = useQueryClient();
    const [selectedDestId, setSelectedDestId] = useState('');

    const { data: destinations = [] } = useQuery({
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

    const { data: foodOptions = [], isLoading } = useQuery({
        queryKey: ['food', selectedDestId],
        queryFn: async () => {
            const response = await apiClient.get(`/destinations/${selectedDestId}/food`);
            return response.data;
        },
        enabled: !!selectedDestId
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/food/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['food', selectedDestId])
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this food option?')) {
            deleteMutation.mutate(id);
        }
    };

    const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Food Palette</h1>
                    <p className="text-ink/60 font-medium">Curate authentic culinary experiences per destination.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Food Option
                </button>
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
                {meals.map(meal => (
                    <div key={meal} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">{meal}</h3>
                            <span className="w-8 h-8 rounded-lg bg-white border border-ink/5 flex items-center justify-center text-xs font-bold text-ink/20">
                                {foodOptions.filter(f => f.mealType === meal).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-20 bg-white/50 rounded-xl animate-pulse" />)
                            ) : (
                                foodOptions.filter(f => f.mealType === meal).map((food, i) => (
                                    <FoodCard key={food.id} food={food} index={i} onDelete={handleDelete} />
                                ))
                            )}
                            {!isLoading && foodOptions.filter(f => f.mealType === meal).length === 0 && (
                                <div className="py-12 border-2 border-dashed border-ink/5 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                                    <p className="text-sm font-bold text-ink/20 mb-2">No {meal.toLowerCase()} options</p>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-red hover:underline">Add First Option</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FoodOptionsManager;
