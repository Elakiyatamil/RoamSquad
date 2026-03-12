import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Globe,
    MapPin,
    Palmtree,
    ClipboardCheck,
    TrendingUp,
    Clock,
    Bell
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, change, color, index }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        let totalMiliseconds = 1500;
        let incrementTime = (totalMiliseconds / end);

        let timer = setInterval(() => {
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
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-forest/10 text-forest text-[10px] font-bold">
                    <TrendingUp size={10} />
                    {change}
                </div>
            </div>

            <h3 className="text- ink/40 text-xs font-bold uppercase tracking-widest mb-1">{label}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-[38px] font-display font-bold text-ink leading-none">
                    {displayValue}
                </span>
            </div>

            <div className={`absolute bottom-0 left-0 h-[3px] w-full ${color} transition-all duration-300 group-hover:h-full group-hover:opacity-[0.02]`} />
        </motion.div>
    );
};

const DashboardOverview = () => {
    const areaData = [
        { name: 'Jan', bookings: 400, confirmed: 240 },
        { name: 'Feb', bookings: 300, confirmed: 139 },
        { name: 'Mar', bookings: 200, confirmed: 980 },
        { name: 'Apr', bookings: 278, confirmed: 390 },
        { name: 'May', bookings: 189, confirmed: 480 },
        { name: 'Jun', bookings: 239, confirmed: 380 },
        { name: 'Jul', bookings: 349, confirmed: 430 },
        { name: 'Aug', bookings: 500, confirmed: 450 },
    ];

    const pieData = [
        { name: 'Kerala', value: 400 },
        { name: 'Karnataka', value: 300 },
        { name: 'Coorg', value: 300 },
        { name: 'Munnar', value: 200 },
    ];

    const COLORS = ['#C8391A', '#2A4A38', '#C4973A', '#2E6F95'];

    const activities = [
        { type: 'booking', text: 'New request from Sarah J. for Munnar', time: '12m ago', color: 'bg-red' },
        { type: 'confirm', text: 'Confirmed Kerala 7-day Package', time: '45m ago', color: 'bg-forest' },
        { type: 'update', text: 'Price updated for Coorg stays', time: '2h ago', color: 'bg-gold' },
        { type: 'user', text: 'New admin account created: Raj K.', time: '5h ago', color: 'bg-ocean' },
        { type: 'alert', text: 'Weather alert for Gokarna region', time: '1d ago', color: 'bg-red' },
    ];

    const announcements = [
        { title: 'Summer Season Update', badge: 'Season', date: 'March 12' },
        { title: 'New Food Partners Karnataka', badge: 'Vendor', date: 'March 10' },
        { title: 'System Maintenance @ 2AM', badge: 'Tech', date: 'March 08' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Workspace</h1>
                    <p className="text-ink/60 font-medium">Monitoring Roam Squad's performance & growth.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Export Report</button>
                    <button className="btn-primary">New Destination</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard label="Total Countries" value="12" icon={Globe} change="+2 this week" color="bg-red" index={0} />
                <StatCard label="Destinations" value="156" icon={MapPin} change="+12 this week" color="bg-forest" index={1} />
                <StatCard label="Experiences" value="482" icon={Palmtree} change="+24 this week" color="bg-gold" index={2} />
                <StatCard label="Pending" value="18" icon={Clock} change="+5 this week" color="bg-ocean" index={3} />
                <StatCard label="Confirmed" value="124" icon={ClipboardCheck} change="+18 this week" color="bg-red" index={4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Booking Analytics</h2>
                            <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Yearly Performance Overview</p>
                        </div>
                        <select className="bg-ink/5 border-none rounded-lg px-3 py-1.5 text-sm font-bold outline-none cursor-pointer">
                            <option>Last 8 Months</option>
                            <option>All Time</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C8391A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#C8391A" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorForest" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2A4A38" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2A4A38" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C141010" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1C141040', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1C141040', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="bookings" stroke="#C8391A" strokeWidth={3} fillOpacity={1} fill="url(#colorRed)" />
                                <Area type="monotone" dataKey="confirmed" stroke="#2A4A38" strokeWidth={3} fillOpacity={1} fill="url(#colorForest)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-8 flex flex-col items-center justify-center">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Region Split</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Destinations by state</p>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {activities.map((activity, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-start gap-4"
                            >
                                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${activity.color}`} />
                                <div className="flex-1">
                                    <p className="text-ink font-medium leading-tight">{activity.text}</p>
                                    <p className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="card p-8">
                    <h2 className="text-2xl font-bold mb-6">Team Announcements</h2>
                    <div className="space-y-4">
                        {announcements.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ x: 3 }}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-ink/5 transition-all cursor-pointer"
                            >
                                <div className="px-2 py-1 bg-ink/5 rounded text-[10px] font-bold uppercase tracking-widest text-ink/60">
                                    {item.badge}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-ink">{item.title}</p>
                                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{item.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
