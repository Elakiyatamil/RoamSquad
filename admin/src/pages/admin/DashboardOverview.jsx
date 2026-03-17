import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Globe,
    MapPin,
    Palmtree,
    ClipboardCheck,
    Clock,
} from 'lucide-react';

// Native SVG Area Chart — no recharts needed
const NativeAreaChart = ({ data }) => {
    const width = 500;
    const height = 280;
    const padL = 40, padR = 20, padT = 20, padB = 40;
    const W = width - padL - padR;
    const H = height - padT - padB;

    const allVals = data.flatMap(d => [d.bookings, d.confirmed]);
    const maxVal = Math.max(...allVals, 1);

    const toX = i => padL + (i / (data.length - 1)) * W;
    const toY = v => padT + H - (v / maxVal) * H;

    const makePath = key =>
        data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d[key])}`).join(' ');
    const makeArea = key => {
        const last = data.length - 1;
        return `${makePath(key)} L${toX(last)},${padT + H} L${toX(0)},${padT + H} Z`;
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <defs>
                <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8391A" stopOpacity="0.15" />
                    <stop offset="95%" stopColor="#C8391A" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gForest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A4A38" stopOpacity="0.15" />
                    <stop offset="95%" stopColor="#2A4A38" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <line key={t} x1={padL} x2={padL + W} y1={padT + H * t} y2={padT + H * t}
                    stroke="#1C1410" strokeOpacity="0.06" strokeDasharray="4 4" />
            ))}
            {/* Areas */}
            <path d={makeArea('bookings')} fill="url(#gRed)" />
            <path d={makeArea('confirmed')} fill="url(#gForest)" />
            {/* Lines */}
            <path d={makePath('bookings')} fill="none" stroke="#C8391A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={makePath('confirmed')} fill="none" stroke="#2A4A38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* X labels */}
            {data.map((d, i) => (
                <text key={i} x={toX(i)} y={height - 8} textAnchor="middle"
                    fontSize="11" fill="#1C141066">{d.name}</text>
            ))}
            {/* Legend */}
            <circle cx={padL + 8} cy={height - 22} r="4" fill="#C8391A" />
            <text x={padL + 16} y={height - 18} fontSize="10" fill="#1C141080">Total Requests</text>
            <circle cx={padL + 110} cy={height - 22} r="4" fill="#2A4A38" />
            <text x={padL + 118} y={height - 18} fontSize="10" fill="#1C141080">Confirmed</text>
        </svg>
    );
};

// Native SVG Pie/Donut Chart — no recharts needed
const NativePieChart = ({ data, colors }) => {
    const cx = 100, cy = 90, ro = 65, ri = 40;
    let total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;
    let angle = -Math.PI / 2;
    const slices = data.map((d, i) => {
        const sweep = (d.value / total) * 2 * Math.PI;
        const x1 = cx + ro * Math.cos(angle), y1 = cy + ro * Math.sin(angle);
        const x2 = cx + ri * Math.cos(angle), y2 = cy + ri * Math.sin(angle);
        angle += sweep;
        const x3 = cx + ro * Math.cos(angle), y3 = cy + ro * Math.sin(angle);
        const x4 = cx + ri * Math.cos(angle), y4 = cy + ri * Math.sin(angle);
        const lg = sweep > Math.PI ? 1 : 0;
        return { path: `M${x1},${y1} A${ro},${ro} 0 ${lg},1 ${x3},${y3} L${x4},${y4} A${ri},${ri} 0 ${lg},0 ${x2},${y2} Z`, color: colors[i % colors.length], label: d.name };
    });
    return (
        <svg viewBox="0 0 200 180" className="w-full h-full">
            {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.9" />)}
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1C1410">{total}</text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="#1C141060">total</text>
            {slices.map((s, i) => (
                <g key={i} transform={`translate(4, ${145 + Math.floor(i / 2) * 16})`}>
                    {i % 2 === 0 ? null : null}
                </g>
            ))}
            {data.map((d, i) => (
                <g key={i}>
                    <rect x={4 + (i % 2) * 96} y={140 + Math.floor(i / 2) * 16} width="8" height="8" rx="2" fill={colors[i % colors.length]} />
                    <text x={16 + (i % 2) * 96} y={148 + Math.floor(i / 2) * 16} fontSize="9" fill="#1C141080">{d.name} ({d.value})</text>
                </g>
            ))}
        </svg>
    );
};
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, index }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (end === 0) return setDisplayValue(0);

        const incrementTime = Math.max(10, 1500 / end);
        const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>

            <h3 className="text-ink/40 text-xs font-bold uppercase tracking-widest mb-1">{label}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-[38px] font-display font-bold text-ink leading-none">
                    {displayValue}
                </span>
            </div>

            <div className={`absolute bottom-0 left-0 h-[3px] w-full ${color} transition-all duration-300 group-hover:h-full group-hover:opacity-[0.02]`} />
        </motion.div>
    );
};

const COLORS = ['#C8391A', '#2A4A38', '#C4973A', '#2E6F95'];

const DashboardOverview = () => {
    const navigate = useNavigate();

    const { data: stats = {} } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await apiClient.get('/stats');
            return res.data;
        }
    });

    const { data: recentRequests = [] } = useQuery({
        queryKey: ['requests'],
        queryFn: async () => {
            const res = await apiClient.get('/requests');
            return res.data;
        }
    });

    const areaData = [
        { name: 'Jan', bookings: 0, confirmed: 0 },
        { name: 'Feb', bookings: 0, confirmed: 0 },
        { name: 'Mar', bookings: recentRequests.length, confirmed: stats.confirmedRequests || 0 },
    ];

    const pieData = [
        { name: 'New Inquiry', value: recentRequests.filter(r => r.status === 'New Inquiry').length || 0 },
        { name: 'Confirmed', value: stats.confirmedRequests || 0 },
        { name: 'In Progress', value: recentRequests.filter(r => r.status === 'In Conversation').length || 0 },
        { name: 'Not Feasible', value: recentRequests.filter(r => r.status === 'Not Feasible').length || 0 },
    ].filter(d => d.value > 0);

    const statusColors = {
        'New Inquiry': 'bg-ocean',
        'Needs Clarification': 'bg-gold',
        'In Conversation': 'bg-red',
        'Journey Confirmed': 'bg-forest',
        'Not Feasible': 'bg-ink/40'
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Workspace</h1>
                    <p className="text-ink/60 font-medium">Monitoring Roam Squad's performance &amp; growth.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/admin/destinations')}
                        className="btn-primary"
                    >
                        New Destination
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard label="Total Countries" value={stats.countries ?? 0} icon={Globe} color="bg-red" index={0} />
                <StatCard label="Destinations" value={stats.destinations ?? 0} icon={MapPin} color="bg-forest" index={1} />
                <StatCard label="Experiences" value={stats.activities ?? 0} icon={Palmtree} color="bg-gold" index={2} />
                <StatCard label="Pending" value={stats.pendingRequests ?? 0} icon={Clock} color="bg-ocean" index={3} />
                <StatCard label="Confirmed" value={stats.confirmedRequests ?? 0} icon={ClipboardCheck} color="bg-red" index={4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Request Analytics</h2>
                            <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Booking Overview</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <NativeAreaChart data={areaData} />
                    </div>
                </div>

                <div className="card p-8 flex flex-col items-center justify-center">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Request Status</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">By category</p>
                    </div>
                    {pieData.length > 0 ? (
                        <div className="h-[220px] w-full">
                            <NativePieChart data={pieData} colors={COLORS} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <p className="text-ink/20 font-bold">No requests yet</p>
                            <p className="text-xs text-ink/30 mt-1">Data will appear as requests come in</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6">Recent Inquiries</h2>
                {recentRequests.length === 0 ? (
                    <div className="py-12 text-center text-ink/30">
                        <p className="font-bold">No requests yet</p>
                        <p className="text-sm mt-1">Inquiries from travelers will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentRequests.slice(0, 6).map((req, i) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-ink/5 transition-all cursor-pointer"
                            >
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[req.status] || 'bg-ink/20'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-ink truncate">{req.userName}</p>
                                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{req.userEmail}</p>
                                </div>
                                <div className="flex items-center gap-3 text-ink/40 text-xs font-bold uppercase tracking-widest">
                                    <span>{req.duration} Days</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${statusColors[req.status]?.replace('bg-', 'bg-') || ''} bg-opacity-10 text-ink/60`}>{req.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
