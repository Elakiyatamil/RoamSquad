import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    Globe,
    Map,
    MapPin,
    Palmtree,
    Search,
    AlertTriangle
} from 'lucide-react';
import { useTreeStore } from '../../store/adminStore';
import apiClient from '../../services/apiClient';

const TreeNode = ({ node, depth, type, onSelect }) => {
    const { expandedIds, toggleExpand, selectedNode, setSelectedNode } = useTreeStore();
    const [isHovering, setIsHovering] = useState(false);
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedNode?.id === node.id;

    const getIcon = () => {
        switch (type) {
            case 'country': return <Globe size={16} className="text-red" />;
            case 'state': return <Map size={16} className="text-forest" />;
            case 'district': return <MapPin size={16} className="text-gold" />;
            case 'destination': return <Palmtree size={16} className="text-ocean" />;
            default: return null;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'country': return 'border-red';
            case 'state': return 'border-forest';
            case 'district': return 'border-gold';
            case 'destination': return 'border-ocean';
            default: return 'border-ink/10';
        }
    };

    const children = node.states || node.districts || node.destinations || [];
    const hasChildren = children.length > 0;

    return (
        <div className="select-none">
            <motion.div
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                onClick={() => {
                    if (hasChildren) toggleExpand(node.id);
                    onSelect(node, type);
                }}
                className={`
          flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all relative group
          ${isSelected ? 'bg-ink/5' : 'hover:bg-ink/5'}
        `}
                style={{ marginLeft: `${depth * 20}px` }}
            >
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 border-l-2 ${getBorderColor()} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />

                {hasChildren ? (
                    <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-ink/30"
                    >
                        <ChevronRight size={16} />
                    </motion.div>
                ) : (
                    <div className="w-4" />
                )}

                <div className="shrink-0">{getIcon()}</div>

                <span className={`text-sm font-medium ${isSelected ? 'text-ink font-bold' : 'text-ink/70'}`}>
                    {node.name}
                </span>

                <AnimatePresence>
                    {isHovering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1 ml-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-red transition-all">
                                <Plus size={14} />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-ink transition-all">
                                <Edit2 size={14} />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink/10 text-ink/40 hover:text-red transition-all">
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children.map((child) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                type={type === 'country' ? 'state' : type === 'state' ? 'district' : 'destination'}
                                onSelect={onSelect}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LocationTreeManager = () => {
    const { tree, setTree, selectedNode, setSelectedNode } = useTreeStore();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const response = await apiClient.get('/tree');
                setTree(response.data);
            } catch (error) {
                console.error('Failed to fetch tree:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [setTree]);

    const handleSelect = (node, type) => {
        setSelectedNode({ ...node, type });
    };

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            <div className="w-1/3 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-ink">Hierarchy</h1>
                        <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Structure Manager</p>
                    </div>
                    <button className="w-10 h-10 bg-red text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red/20">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input
                        type="text"
                        placeholder="Search hierarchy..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 bg-white/50 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tree.map(country => (
                                <TreeNode key={country.id} node={country} depth={0} type="country" onSelect={handleSelect} />
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
                                    <div className="px-3 py-1 bg-ink/5 rounded text-[10px] font-bold uppercase tracking-widest text-ink/60">
                                        {selectedNode.type}
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <button className="btn-primary flex items-center gap-2 text-sm px-4">
                                            <Edit2 size={14} /> Edit {selectedNode.type}
                                        </button>
                                        <button className="px-4 py-2 border border-red/20 text-red rounded-full font-bold text-sm hover:bg-red/5 transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h2 className="text-5xl font-display font-bold text-ink mb-2">{selectedNode.name}</h2>
                                <div className="flex items-center gap-4 text-ink/40 text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> Created 2 days ago</span>
                                    <span>•</span>
                                    <span>ID: {selectedNode.id.substring(0, 8)}...</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {selectedNode.type === 'destination' ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Category</p>
                                                <p className="font-bold text-lg">{selectedNode.category || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Rating</p>
                                                <p className="font-bold text-lg">⭐ {selectedNode.rating || 4.5}</p>
                                            </div>
                                            <div className="p-4 bg-ink/5 rounded-2xl">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Status</p>
                                                <p className="font-bold text-lg text-forest">● Active</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 border-b border-ink/5">
                                            {['Overview', 'Activities', 'Food', 'Accommodation', 'Travel'].map(tab => (
                                                <button key={tab} className="px-6 py-3 text-sm font-bold text-ink/40 hover:text-red transition-colors border-b-2 border-transparent hover:border-red">
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="aspect-video bg-ink/5 rounded-3xl flex items-center justify-center border-2 border-dashed border-ink/10 relative group cursor-pointer hover:border-red/20 transition-all">
                                            {selectedNode.coverImage ? (
                                                <img src={selectedNode.coverImage} className="w-full h-full object-cover rounded-3xl" alt="" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto mb-2 text-ink/20" size={48} />
                                                    <p className="text-sm font-bold text-ink/30">Click to upload cover image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
                                        <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mb-6">
                                            <MapPin size={40} className="text-ink/20" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Select a Destination</h3>
                                        <p className="text-sm text-ink/40 font-medium">To manage activities, food options, and accommodation, please select a specific destination from the hierarchy.</p>
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
                            <p className="max-w-xs font-medium text-ink/40">Select a country, state, or district to begin managing its structure and content.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LocationTreeManager;
