import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Edit2, Trash2, ChevronRight,
    Globe, Map, MapPin, TreePalm, Search, X,
    Image as ImageIcon
} from 'lucide-react';
import { useTreeStore } from '../../store/adminStore';
import apiClient from '../../services/apiClient';

// --- Generic CRUD Modal ---
const NodeForm = ({ node, parentType, parentId, onClose, onSaved }) => {
    const queryClient = useQueryClient();
    const isEdit = !!node?.id;
    const [name, setName] = useState(node?.name || '');
    const [saving, setSaving] = useState(false);

    const getTitle = () => {
        if (isEdit) return `Edit ${parentType}`;
        const childMap = { root: 'Country', country: 'State', state: 'District', district: 'Destination' };
        return `Add ${childMap[parentType] || 'Node'}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { alert('Name is required.'); return; }
        setSaving(true);
        try {
            if (isEdit) {
                const typePathMap = {
                    country: `/countries/${node.id}`,
                    state: `/states/${node.id}`,
                    district: `/districts/${node.id}`,
                    destination: `/destinations/${node.id}`
                };
                await apiClient.patch(typePathMap[parentType], { name });
            } else {
                const createPathMap = {
                    root: `/countries`,
                    country: `/countries/${parentId}/states`,
                    state: `/states/${parentId}/districts`,
                    district: `/districts/${parentId}/destinations`,
                };
                const payload = { name };
                if (parentType === 'district') {
                    payload.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                }
                await apiClient.post(createPathMap[parentType], payload);
            }
            queryClient.invalidateQueries(['countries']);
            queryClient.invalidateQueries(['states']);
            queryClient.invalidateQueries(['districts']);
            onSaved();
            onClose();
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-ink">{getTitle()}</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Location Hierarchy</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Name *</label>
                        <input autoFocus value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="Enter name..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-[2] btn-primary py-3 disabled:opacity-70">
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Tree Node ---
const TreeNode = ({ node, depth, type, onSelect, onRefresh }) => {
    const { expandedIds, toggleExpand, selectedNode, setSelectedNode } = useTreeStore();
    const [isHovering, setIsHovering] = useState(false);
    const [modal, setModal] = useState(null); // {mode:'add'|'edit', parentType, parentId, node?}
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedNode?.id === node.id;

    const getIcon = () => {
        switch (type) {
            case 'country': return <Globe size={16} className="text-red" />;
            case 'state': return <Map size={16} className="text-forest" />;
            case 'district': return <MapPin size={16} className="text-gold" />;
            case 'destination': return <TreePalm size={16} className="text-ocean" />;
            default: return null;
        }
    };

    const childType = { country: 'state', state: 'district', district: 'destination' }[type];
    const children = node.states || node.districts || node.destinations || [];
    const hasChildren = children.length > 0;

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${node.name}"? This cannot be undone.`)) return;
        try {
            const pathMap = {
                country: `/countries/${node.id}`,
                state: `/states/${node.id}`,
                district: `/districts/${node.id}`,
                destination: `/destinations/${node.id}`
            };
            await apiClient.delete(pathMap[type]);
            onRefresh();
        } catch (err) {
            alert(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="select-none">
            <motion.div
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                onClick={() => {
                    if (hasChildren) toggleExpand(node.id);
                    setSelectedNode({ ...node, type });
                    onSelect(node, type);
                }}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all relative group ${isSelected ? 'bg-ink/5' : 'hover:bg-ink/5'}`}
                style={{ marginLeft: `${depth * 20}px` }}
            >
                {hasChildren ? (
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }} className="text-ink/30">
                        <ChevronRight size={16} />
                    </motion.div>
                ) : <div className="w-4" />}

                <div className="shrink-0">{getIcon()}</div>
                <span className={`text-sm font-medium flex-1 truncate ${isSelected ? 'text-ink font-bold' : 'text-ink/70'}`}>{node.name}</span>

                <AnimatePresence>
                    {isHovering && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-0.5 ml-auto shrink-0" onClick={e => e.stopPropagation()}
                        >
                            {childType && (
                                <button onClick={e => { e.stopPropagation(); setModal({ mode: 'add', parentType: type, parentId: node.id }); }}
                                    title={`Add ${childType}`}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-forest transition-all">
                                    <Plus size={13} />
                                </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); setModal({ mode: 'edit', parentType: type, node }); }}
                                title="Edit"
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-ink transition-all">
                                <Edit2 size={13} />
                            </button>
                            <button onClick={handleDelete}
                                title="Delete"
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-red transition-all">
                                <Trash2 size={13} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        {children.map(child => (
                            <TreeNode
                                key={child.id} node={child} depth={depth + 1}
                                type={childType}
                                onSelect={onSelect}
                                onRefresh={onRefresh}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modal && (
                    <NodeForm
                        node={modal.mode === 'edit' ? modal.node : null}
                        parentType={modal.mode === 'edit' ? modal.parentType : modal.parentType}
                        parentId={modal.parentId}
                        onClose={() => setModal(null)}
                        onSaved={onRefresh}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Manager ---
const LocationTreeManager = () => {
    const { tree, setTree, selectedNode, setSelectedNode } = useTreeStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [addCountryModal, setAddCountryModal] = useState(false);
    const [globalModal, setGlobalModal] = useState(null); // Add this

    const fetchTree = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/tree');
            setTree(response.data);
        } catch (error) {
            console.error('Failed to fetch tree:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTree(); }, []);

    const handleSelect = (node, type) => setSelectedNode({ ...node, type });

    const filteredTree = search.trim()
        ? tree.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : tree;

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            <div className="w-1/3 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-ink">Hierarchy</h1>
                        <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Structure Manager</p>
                    </div>
                    <button
                        onClick={() => setAddCountryModal(true)}
                        className="w-10 h-10 bg-red text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red/20"
                        title="Add Country"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input
                        type="text" placeholder="Search hierarchy..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-white/50 rounded-lg animate-pulse" />)}
                        </div>
                    ) : filteredTree.length === 0 ? (
                        <div className="py-16 text-center text-ink/30">
                            <Globe size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-bold text-sm">Start by adding your first country.</p>
                            <p className="text-xs mt-1">Click the + button above to begin building the hierarchy.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredTree.map(country => (
                                <TreeNode
                                    key={country.id} node={country} depth={0} type="country"
                                    onSelect={handleSelect}
                                    onRefresh={fetchTree}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    {selectedNode ? (
                        <motion.div
                            key={selectedNode.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="card h-full flex flex-col"
                        >
                            <div className="p-8 border-b border-ink/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="px-3 py-1 bg-ink/5 rounded text-[10px] font-bold uppercase tracking-widest text-ink/60">{selectedNode.type}</div>
                                    <div className="ml-auto flex gap-2">
                                        <button
                                            onClick={() => setGlobalModal({ mode: 'edit', parentType: selectedNode.type, node: selectedNode })}
                                            className="btn-primary flex items-center gap-2 text-sm px-4"
                                        >
                                            <Edit2 size={14} /> Edit {selectedNode.type}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-5xl font-display font-bold text-ink mb-2">{selectedNode.name}</h2>
                                        <div className="flex items-center gap-4 text-ink/40 text-sm font-medium">
                                            <span>ID: {selectedNode.id?.substring(0, 12)}...</span>
                                        </div>
                                    </div>
                                    
                                    {selectedNode.type !== 'destination' && (
                                        <button
                                            onClick={() => setGlobalModal({ mode: 'add', parentType: selectedNode.type, parentId: selectedNode.id })}
                                            className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-forest/20"
                                        >
                                            <Plus size={18} /> Add {
                                                selectedNode.type === 'country' ? 'State' : 
                                                selectedNode.type === 'state' ? 'District' : 
                                                'Destination'
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {selectedNode.type === 'destination' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Category</p>
                                                <p className="font-bold text-lg">{selectedNode.category || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Rating</p>
                                                <p className="font-bold text-lg">⭐ {selectedNode.rating || '—'}</p>
                                            </div>
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Status</p>
                                                <p className={`font-bold text-lg ${selectedNode.active !== false ? 'text-forest' : 'text-red'}`}>
                                                    ● {selectedNode.active !== false ? 'Active' : 'Draft'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedNode.description && (
                                            <div className="p-5 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Description</p>
                                                <p className="text-sm font-medium text-ink/70 leading-relaxed">{selectedNode.description}</p>
                                            </div>
                                        )}
                                        <div className="aspect-video bg-ink/5 rounded-3xl flex items-center justify-center border-2 border-dashed border-ink/10">
                                            {selectedNode.coverImage ? (
                                                <img src={selectedNode.coverImage} className="w-full h-full object-cover rounded-3xl" alt="" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto mb-2 text-ink/20" size={40} />
                                                    <p className="text-sm font-bold text-ink/20">No cover image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-ink">Manage Content</h3>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Children Of {selectedNode.name}</div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-2">
                                            {(selectedNode.states || selectedNode.districts || selectedNode.destinations || []).length === 0 ? (
                                                <div className="py-12 text-center border-2 border-dashed border-ink/10 rounded-3xl">
                                                    <p className="text-sm font-medium text-ink/20">No items found.</p>
                                                </div>
                                            ) : (
                                                (selectedNode.states || selectedNode.districts || selectedNode.destinations || []).map(child => (
                                                    <div 
                                                        key={child.id}
                                                        onClick={() => setSelectedNode({ ...child, type: selectedNode.type === 'country' ? 'state' : selectedNode.type === 'state' ? 'district' : 'destination' })}
                                                        className="p-4 bg-ink/5 rounded-2xl flex items-center justify-between group hover:bg-ink/10 cursor-pointer transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                                {selectedNode.type === 'country' ? <Map size={14} className="text-forest" /> : 
                                                                 selectedNode.type === 'state' ? <MapPin size={14} className="text-gold" /> : 
                                                                 <TreePalm size={14} className="text-ocean" />}
                                                            </div>
                                                            <span className="font-bold text-ink text-sm">{child.name}</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-ink/20 group-hover:text-ink/60 transition-all group-hover:translate-x-1" />
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-ink/5 mt-auto">
                                            <div className="p-6 bg-ink/5 rounded-3xl text-center">
                                                <p className="text-xs font-bold text-ink/40 uppercase tracking-widest mb-4">Discovery Tip</p>
                                                <p className="text-sm text-ink/60 font-medium leading-relaxed px-4">
                                                    You can also manage these nodes directly from the tree by hovering over them to reveal quick actions (Add, Edit, Delete).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 card flex flex-col items-center justify-center p-8 text-center text-ink/20">
                            <div className="w-32 h-32 border-4 border-dashed border-ink/5 rounded-full flex items-center justify-center mb-8">
                                <Map size={48} />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-2">No Node Selected</h2>
                            <p className="max-w-xs font-medium text-ink/40">Select a node from the tree, or click + to add a country.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {(addCountryModal || globalModal) && (
                    <NodeForm
                        node={(globalModal?.mode === 'edit') ? globalModal.node : null}
                        parentType={globalModal ? globalModal.parentType : 'root'}
                        parentId={globalModal ? globalModal.parentId : null}
                        onClose={() => { setAddCountryModal(false); setGlobalModal(null); }}
                        onSaved={fetchTree}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationTreeManager;
