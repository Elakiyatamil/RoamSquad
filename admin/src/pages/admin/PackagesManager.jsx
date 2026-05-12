import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, IndianRupee, Calendar, Edit2, Trash2, X, Eye, FileText, Settings, Info, Users, Minus
} from 'lucide-react';
import apiClient from '../../services/apiClient';

import ImageUpload from '../../components/ui/ImageUpload';
import ItineraryBuilder from '../../components/admin/ItineraryBuilder';
import PDFLitePreview from '../../components/admin/PDFLitePreview';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';

// --- Package Form Modal ---
const PackageForm = ({ pkg, onClose }) => {
    const queryClient = useQueryClient();
    const [itineraryType, setItineraryType] = useState(pkg?.itineraryType || 'LEGACY');
    const [showPreview, setShowPreview] = useState(false);
    
    const [form, setForm] = useState({
        name: pkg?.name || '',
        daysCount: pkg?.daysCount ?? '',
        totalPrice: pkg?.totalPrice ?? '',
        amount: pkg?.amount ?? '',
        highlights: pkg?.highlights || '',
        tag: pkg?.tag || 'Bestseller',
        vibe: pkg?.vibe || 'Stranger',
        altText: pkg?.altText || '',
        coverImage: pkg?.coverImage || '',
        isActive: pkg?.isActive ?? true,
        description: pkg?.description || '',
        pricePerPax: pkg?.pricePerPax ?? '',
        priceUnit: pkg?.priceUnit || 'PER PERSON',
        participantGroups: pkg?.participantGroups?.length > 0 
            ? pkg.participantGroups.map(g => ({ name: g.name, count: g.count }))
            : [{ name: 'Students', count: '' }, { name: 'Staff', count: '' }],
        inclusions: pkg?.inclusions || '',
        exclusions: pkg?.exclusions || '',
        terms: pkg?.terms || '',
        itineraryDays: pkg?.itineraryDays || [],
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (pkg?.id) return await apiClient.patch(`/packages/${pkg.id}`, data);
            return await apiClient.post('/packages', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['packages']);
            onClose();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    const loadTermsTemplate = async () => {
        try {
            const res = await apiClient.get('/settings/STANDARD_TERMS');
            if (res.data.data?.value?.content) {
                setForm(prev => ({ ...prev, terms: res.data.data.value.content }));
            } else {
                alert('No standard terms template found. Please create one in Global Settings.');
            }
        } catch (err) {
            alert('Error loading template');
        }
    };

    const addParticipantGroup = () => {
        setForm(prev => ({
            ...prev,
            participantGroups: [...prev.participantGroups, { name: '', count: '' }]
        }));
    };

    const updateParticipantGroup = (index, field, value) => {
        const newGroups = [...form.participantGroups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        setForm(prev => ({ ...prev, participantGroups: newGroups }));
    };

    const removeParticipantGroup = (index) => {
        setForm(prev => ({
            ...prev,
            participantGroups: prev.participantGroups.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { alert('Package name is required.'); return; }
        
        const highlightsArray = typeof form.highlights === 'string' 
            ? form.highlights.split(',').map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(form.highlights) ? form.highlights : []);

        const inclusionsArray = typeof form.inclusions === 'string'
            ? form.inclusions.split('\n').map(s => s.trim()).filter(Boolean)
            : (Array.isArray(form.inclusions) ? form.inclusions : []);

        const exclusionsArray = typeof form.exclusions === 'string'
            ? form.exclusions.split('\n').map(s => s.trim()).filter(Boolean)
            : (Array.isArray(form.exclusions) ? form.exclusions : []);

        mutation.mutate({
            ...form,
            itineraryType,
            vibe: form.vibe,
            altText: form.altText,
            daysCount: parseInt(form.daysCount) || 0,
            totalPrice: parseFloat(form.totalPrice) || 0,
            amount: (form.amount !== '' && form.amount !== null) ? parseInt(form.amount) : null,
            highlights: highlightsArray,
            inclusions: inclusionsArray,
            exclusions: exclusionsArray,
            pricePerPax: parseFloat(form.pricePerPax) || 0,
            participantGroups: form.participantGroups.filter(g => g.name.trim() !== ''),
        });
    };

    const highlightsStr = Array.isArray(form.highlights) ? form.highlights.join(', ') : form.highlights;
    const inclusionsStr = Array.isArray(form.inclusions) ? form.inclusions.join('\n') : form.inclusions;
    const exclusionsStr = Array.isArray(form.exclusions) ? form.exclusions.join('\n') : form.exclusions;

    const totalPax = form.participantGroups.reduce((acc, g) => acc + (parseInt(g.count) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className={`relative bg-white rounded-3xl shadow-2xl w-full ${showPreview ? 'max-w-6xl' : 'max-w-4xl'} flex z-10 max-h-[90vh] transition-all duration-500`}
            >
                {/* Form Section */}
                <div className={`flex-1 p-8 overflow-y-auto custom-scrollbar ${showPreview ? 'border-r border-ink/5' : ''}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-ink">{pkg ? 'Edit' : 'New'} Package</h2>
                            <div className="flex gap-4 mt-2">
                                <button 
                                    type="button"
                                    onClick={() => setItineraryType('LEGACY')}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition ${itineraryType === 'LEGACY' ? 'bg-ink text-white' : 'bg-ink/5 text-ink/40'}`}
                                >
                                    Legacy Mode
                                </button>
                                {itineraryType !== 'STRUCTURED' && (
                                    <button 
                                        type="button"
                                        onClick={() => setItineraryType('STRUCTURED')}
                                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition ${itineraryType === 'STRUCTURED' ? 'bg-primary text-white' : 'bg-ink/5 text-ink/40'}`}
                                    >
                                        Structured Mode
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                type="button" 
                                onClick={() => setShowPreview(!showPreview)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${showPreview ? 'bg-primary text-white shadow-lg' : 'bg-ink/5 text-ink/40 hover:bg-ink/10'}`}
                                title="Live Preview"
                             >
                                <Eye size={18} />
                             </button>
                             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Group */}
                        <div className="bg-ink/5 p-6 rounded-2xl space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Base Information</h4>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Package Name *</label>
                                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" placeholder="e.g. Dandeli Industrial Tour" required />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Days *</label>
                                    <input type="number" value={form.daysCount ?? ''} onChange={e => setForm({ ...form, daysCount: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" placeholder="3" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Base Price (₹) *</label>
                                    <input type="number" value={form.totalPrice ?? ''} onChange={e => setForm({ ...form, totalPrice: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" placeholder="24999" required />
                                </div>
                            </div>

                            <div className="space-y-1 mt-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 block mb-2">Trip Vibe</label>
                                <div className="flex gap-2">
                                    {['Stranger', 'Family', 'Couple', 'Solo', 'Friends'].map(vibeOption => (
                                        <button
                                            key={vibeOption}
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => {
                                                    const newForm = { ...prev, vibe: vibeOption };
                                                    // Simple suggestion logic
                                                    if (!prev.name) {
                                                        if (vibeOption === 'Stranger') newForm.name = 'Vibrant Solo Expedition';
                                                        if (vibeOption === 'Family') newForm.name = 'The Perfect Family Getaway';
                                                        if (vibeOption === 'Couple') newForm.name = 'Romantic Escape';
                                                        if (vibeOption === 'Solo') newForm.name = 'Solo Backpacker Adventure';
                                                        if (vibeOption === 'Friends') newForm.name = 'Ultimate Gang Trip';
                                                    }
                                                    if (!prev.highlights) {
                                                        if (vibeOption === 'Stranger') newForm.highlights = 'Solo-Friendly, Group Activities, Networking';
                                                        if (vibeOption === 'Family') newForm.highlights = 'Kid-Friendly, Comfortable Pace, Spacious Stay';
                                                        if (vibeOption === 'Couple') newForm.highlights = 'Private Candlelight Dinner, Scenic Views, Luxury Stay';
                                                        if (vibeOption === 'Solo') newForm.highlights = 'Budget Friendly, Local Experience, Freedom';
                                                        if (vibeOption === 'Friends') newForm.highlights = 'Late Night Bonfire, Adventure Sports, Group Discounts';
                                                    }
                                                    return newForm;
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${form.vibe === vibeOption ? 'bg-ink text-white' : 'bg-white text-ink/60 hover:bg-ink/5'}`}
                                        >
                                            {vibeOption}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Experience Engine Group */}
                        <div className="bg-ink/5 p-6 rounded-2xl space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">Participant Breakdown</h4>
                            
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Adults', key: 'Adults' },
                                    { label: 'Students', key: 'Students' },
                                    { label: 'Staff', key: 'Staff' }
                                ].map((type) => (
                                    <div key={type.key} className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{type.label}</label>
                                        <input 
                                            type="number"
                                            placeholder="0"
                                            value={form.participantGroups.find(g => g.name === type.key)?.count || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const newGroups = [...form.participantGroups];
                                                const idx = newGroups.findIndex(g => g.name === type.key);
                                                if (idx > -1) {
                                                    newGroups[idx].count = val;
                                                } else {
                                                    newGroups.push({ name: type.key, count: val });
                                                }
                                                setForm(prev => ({ ...prev, participantGroups: newGroups }));
                                            }}
                                            className="w-full px-4 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold focus:ring-2 focus:ring-gold/20"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price / Unit (₹)</label>
                                    <input type="number" value={form.pricePerPax ?? ''} onChange={e => setForm({ ...form, pricePerPax: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" placeholder="7700" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Unit Label</label>
                                    <input value={form.priceUnit} onChange={e => setForm({ ...form, priceUnit: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" placeholder="PER PERSON" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between px-2 pt-2">
                                <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">Total Pax Calculation</span>
                                <span className="text-lg font-black text-primary">{totalPax}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUpload 
                                label="Package Cover Image"
                                value={form.coverImage || ''}
                                onChange={(url) => setForm({ ...form, coverImage: url })}
                                existingPreview={form.coverImage}
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Image Alt Text (SEO)</label>
                                <input 
                                    value={form.altText || ''} 
                                    onChange={e => setForm({ ...form, altText: e.target.value })} 
                                    className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-gold/20 transition-all" 
                                    placeholder="e.g. Scenic view of Dandeli forest" 
                                />
                            </div>
                        </div>

                        {/* Mode Content */}
                        <div className="pt-4">
                            {itineraryType === 'LEGACY' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-ink/40 mb-2">
                                        <Info size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Legacy Monolithic Mode</span>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description / Itinerary Text</label>
                                        <textarea 
                                            value={form.description || ''} 
                                            onChange={e => setForm({ ...form, description: e.target.value })} 
                                            className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium min-h-[300px] focus:ring-2 focus:ring-gold/20 transition-all" 
                                            placeholder="Paste your existing itinerary text here..." 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <ItineraryBuilder 
                                    days={form.itineraryDays} 
                                    onChange={(newDays) => setForm({ ...form, itineraryDays: newDays })} 
                                />
                            )}
                        </div>

                        {/* Logistics Section */}
                        <div className="space-y-6 pt-8 border-t border-ink/5">
                            <h3 className="text-lg font-bold text-ink">Inclusions & Logistics</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Inclusions (One per line)</label>
                                    <textarea 
                                        value={inclusionsStr || ''} 
                                        onChange={e => setForm({ ...form, inclusions: e.target.value })} 
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium min-h-[150px] focus:ring-2 focus:ring-gold/20 transition-all" 
                                        placeholder="Stay: Comfort Stay&#10;Industrial Visit" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Exclusions (One per line)</label>
                                    <textarea 
                                        value={exclusionsStr || ''} 
                                        onChange={e => setForm({ ...form, exclusions: e.target.value })} 
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium min-h-[150px] focus:ring-2 focus:ring-gold/20 transition-all" 
                                        placeholder="Personal Expenses&#10;Travel Insurance" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Terms & Conditions</label>
                                    <button 
                                        type="button" 
                                        onClick={loadTermsTemplate}
                                        className="text-[10px] font-bold text-gold hover:text-ink flex items-center gap-1 transition"
                                    >
                                        <FileText size={12} /> Load Standard Template
                                    </button>
                                </div>
                                <textarea 
                                    value={form.terms || ''} 
                                    onChange={e => setForm({ ...form, terms: e.target.value })} 
                                    className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium min-h-[150px] focus:ring-2 focus:ring-gold/20 transition-all" 
                                    placeholder="Cancellation policy, etc." 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-8">
                            <button type="button" onClick={onClose} className="flex-1 py-4 border border-ink/10 rounded-2xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                            <button type="submit" disabled={mutation.isPending} className="flex-[2] btn-primary py-4 disabled:opacity-70 flex items-center justify-center gap-2">
                                {mutation.isPending ? 'Saving...' : (pkg ? 'Update Package' : 'Publish Package')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-[450px] bg-ink/5 overflow-y-auto custom-scrollbar flex flex-col"
                        >
                            <div className="p-6 border-b border-ink/5 bg-white flex items-center justify-between sticky top-0 z-10">
                                <h3 className="font-bold flex items-center gap-2"><FileText size={16} /> PDF-Lite Preview</h3>
                                <div className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">A4 Layout</div>
                            </div>
                            <div className="p-8 flex-1">
                                <PDFLitePreview data={{ ...form, itineraryType, totalPax }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- Package Card ---
const PackageCard = ({ item, index, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="card group cursor-pointer"
    >
        <div className="aspect-[16/10] bg-ink/5 relative overflow-hidden">
            {item.coverImage ? (
                <img 
                    src={item.coverImage.startsWith('http') ? item.coverImage : `${IMAGE_BASE_URL}${item.coverImage}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/10"><Package size={48} /></div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 shadow-sm">
                <Calendar size={10} />
                {item.daysCount} Days
            </div>
            {item.itineraryType === 'STRUCTURED' && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <FileText size={10} /> PDF PRO
                </div>
            )}
        </div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold truncate pr-4 text-ink">{item.name}</h3>
                <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/20 hover:text-ink transition-all"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red/5 text-ink/20 hover:text-red transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-forest font-bold">
                    <IndianRupee size={14} />
                    <span>{item.totalPrice?.toLocaleString()}</span>
                </div>
                {item.pricePerPax > 0 && (
                    <>
                        <div className="w-1.5 h-1.5 bg-ink/10 rounded-full" />
                        <div className="text-primary font-bold text-xs">₹{item.pricePerPax?.toLocaleString()}/{item.priceUnit === 'PER PERSON' ? 'pax' : 'unit'}</div>
                    </>
                )}
            </div>
            <button onClick={() => onEdit(item)} className="w-full py-4 bg-ink/5 hover:bg-primary text-ink hover:text-white rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-[0.98]">
                {item.itineraryType === 'STRUCTURED' ? 'Edit Pro Itinerary' : 'Manage Package'}
            </button>
        </div>
    </motion.div>
);

// --- Main Manager ---
const PackagesManager = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const res = await apiClient.get('/packages');
            return res.data.data || [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/packages/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['packages'])
    });

    const handleDelete = (id) => { if (window.confirm('Delete this package?')) deleteMutation.mutate(id); };
    const openAdd = () => { setEditingPkg(null); setIsFormOpen(true); };
    const openEdit = (pkg) => { setEditingPkg(pkg); setIsFormOpen(true); };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Package Manager</h1>
                    <p className="text-ink/60 font-medium">Create premium PDF-ready itineraries with the Experience Engine.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> New Package
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="card h-[400px] animate-pulse bg-white/50" />)}
                </div>
            ) : packages.length === 0 ? (
                <div className="py-24 flex flex-col items-center text-center text-ink/30">
                    <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mb-6"><Package size={40} /></div>
                    <p className="font-bold text-lg mb-2">No packages yet</p>
                    <p className="text-sm mb-6">Create your first curated travel package.</p>
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create First Package</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(Array.isArray(packages) ? packages : []).map((pkg, i) => (
                        <PackageCard key={pkg.id} item={pkg} index={i} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isFormOpen && (
                    <PackageForm pkg={editingPkg} onClose={() => { setIsFormOpen(false); setEditingPkg(null); }} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PackagesManager;
