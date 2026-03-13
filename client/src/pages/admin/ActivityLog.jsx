import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck, Filter, Search, FileClock, Plus, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

const ACTION_ICONS = {
    CREATE: { icon: Plus, color: 'text-forest', bg: 'bg-forest/10' },
    UPDATE: { icon: Edit2, color: 'text-ocean', bg: 'bg-ocean/10' },
    DELETE: { icon: Trash2, color: 'text-red', bg: 'bg-red/10' },
};

const ActivityLog = () => {
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', filterAction, filterEntity],
        queryFn: async () => {
            const params = new URLSearchParams({ limit: 100 });
            if (filterAction) params.set('action', filterAction);
            if (filterEntity) params.set('entity', filterEntity);
            const res = await apiClient.get(`/audit-logs?${params}`);
            return res.data;
        },
        refetchInterval: 15000, // auto-refresh every 15s
    });

    const logs = (data?.data || []).filter(log => {
        if (!search) return true;
        return (
            log.userName?.toLowerCase().includes(search.toLowerCase()) ||
            log.entityName?.toLowerCase().includes(search.toLowerCase()) ||
            log.entity?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { hour12: true, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Activity Log</h1>
                    <p className="text-ink/60 font-medium">Every admin action, tracked in real time.</p>
                </div>
                <div className="flex items-center gap-2 bg-forest/10 text-forest px-4 py-2 rounded-xl text-xs font-bold">
                    <ShieldCheck size={16} />
                    {data?.total || 0} Total Actions
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                    <input
                        type="text"
                        placeholder="Search user or item..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 bg-white border border-ink/5 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red/5 font-medium min-w-[220px]"
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-ink/5 rounded-xl text-sm outline-none font-bold text-ink/60"
                >
                    <option value="">All Actions</option>
                    <option value="CREATE">Creates</option>
                    <option value="UPDATE">Updates</option>
                    <option value="DELETE">Deletes</option>
                </select>
                <select
                    value={filterEntity}
                    onChange={e => setFilterEntity(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-ink/5 rounded-xl text-sm outline-none font-bold text-ink/60"
                >
                    <option value="">All Entities</option>
                    <option>Country</option>
                    <option>State</option>
                    <option>District</option>
                    <option>Destination</option>
                    <option>Activity</option>
                    <option>Accommodation</option>
                    <option>Package</option>
                </select>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-3xl border border-ink/5 overflow-hidden">
                {isLoading ? (
                    <div className="p-16 text-center text-ink/30 font-medium">Loading activity log...</div>
                ) : logs.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileClock size={32} className="text-ink/20" />
                        </div>
                        <p className="font-bold text-ink/40">No activity yet</p>
                        <p className="text-xs text-ink/30 mt-1">Admin actions will appear here as they happen.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-ink/5">
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-ink/40 px-6 py-4">Action</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-ink/40 px-6 py-4">Entity</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-ink/40 px-6 py-4">Item</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-ink/40 px-6 py-4">Admin</th>
                                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-ink/40 px-6 py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => {
                                const config = ACTION_ICONS[log.action] || ACTION_ICONS.CREATE;
                                const Icon = config.icon;
                                return (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.color}`}>
                                                <Icon size={12} />
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-ink/70">{log.entity}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-ink">{log.entityName || log.entityId || '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-red/10 flex items-center justify-center text-red font-bold text-xs shrink-0">
                                                    {log.userName?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <span className="text-sm font-medium text-ink/60">{log.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/40 font-medium whitespace-nowrap">{formatDate(log.createdAt)}</td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
