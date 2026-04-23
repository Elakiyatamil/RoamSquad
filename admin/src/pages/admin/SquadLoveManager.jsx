import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Video, Image as ImageIcon, Heart, Loader2, X, CheckCircle2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import ImageUpload from '../../components/ui/ImageUpload';

const SquadLoveManager = () => {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ type: 'IMAGE', url: '', caption: '', name: '', location: '', sortOrder: 0 });

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['squad-love'],
        queryFn: async () => {
            const res = await apiClient.get('/squad-love');
            return res.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => apiClient.post('/squad-love', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['squad-love']);
            setIsAdding(false);
            setNewItem({ type: 'IMAGE', url: '', caption: '', name: '', location: '', sortOrder: 0 });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/squad-love/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['squad-love'])
    });

    const handleAdd = () => {
        if (!newItem.url) return alert('Please upload a file first');
        createMutation.mutate(newItem);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-display font-bold text-ink mb-2 flex items-center gap-3">
                        Love from the Squad <Heart className="text-red fill-red" size={28} />
                    </h1>
                    <p className="text-ink/40 font-bold uppercase tracking-widest text-[10px]">Social Proof & Community Media Management</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-red text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-red/20"
                >
                    <Plus size={20} /> Add New Moment
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-red" size={40} />
                    <p className="text-sm font-bold text-ink/40 uppercase tracking-widest">Loading Moments...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl border border-ink/5 overflow-hidden group shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="aspect-[4/5] relative bg-ink/5 overflow-hidden">
                                    {item.type === 'VIDEO' ? (
                                        <video src={item.url} className="w-full h-full object-cover" muted loop onMouseEnter={e => e.target.play()} onMouseLeave={e => {e.target.pause(); e.target.currentTime = 0;}} />
                                    ) : (
                                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={() => deleteMutation.mutate(item.id)}
                                            className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl text-red flex items-center justify-center shadow-lg hover:bg-red hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${item.type === 'VIDEO' ? 'bg-indigo-500/80 text-white' : 'bg-white/80 text-ink'}`}>
                                            {item.type === 'VIDEO' ? <Video size={12} /> : <ImageIcon size={12} />}
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-ink">{item.name || 'Anonymous'}</span>
                                        <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{item.location}</span>
                                    </div>
                                    <p className="text-sm font-medium text-ink/60 line-clamp-2 italic">"{item.caption || 'No caption provided'}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-cream w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-display font-bold text-ink">New Community Moment</h3>
                                    <button onClick={() => setIsAdding(false)} className="text-ink/40 hover:text-red transition-colors"><X size={24}/></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Media Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['IMAGE', 'VIDEO'].map(t => (
                                                <button 
                                                    key={t}
                                                    onClick={() => setNewItem({ ...newItem, type: t })}
                                                    className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${newItem.type === t ? 'bg-ink text-white' : 'bg-white border border-ink/5 text-ink/40'}`}
                                                >
                                                    {t === 'VIDEO' ? <Video size={14}/> : <ImageIcon size={14}/>}
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <ImageUpload 
                                        label={`Upload ${newItem.type}`}
                                        value={newItem.url}
                                        onChange={(url) => setNewItem({ ...newItem, url })}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Member Name</label>
                                            <input 
                                                value={newItem.name}
                                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/5 transition-all text-sm font-bold"
                                                placeholder="e.g. Aisha K."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Location</label>
                                            <input 
                                                value={newItem.location}
                                                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                                className="w-full px-4 py-3 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/5 transition-all text-sm font-bold"
                                                placeholder="e.g. Coorg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Caption / Quote</label>
                                        <textarea 
                                            value={newItem.caption}
                                            onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })}
                                            className="w-full px-4 py-3 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/5 transition-all text-sm font-medium resize-none"
                                            rows={2}
                                            placeholder="What did they say about the trip?"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleAdd}
                                        disabled={!newItem.url || createMutation.isLoading}
                                        className="w-full py-4 bg-red text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red/20 disabled:opacity-50"
                                    >
                                        {createMutation.isLoading ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20}/> Publish Moment</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SquadLoveManager;
