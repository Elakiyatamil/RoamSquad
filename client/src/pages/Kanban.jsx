import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Mail, Calendar, MapPin } from 'lucide-react';

const KanbanColumn = ({ title, count, children, color }) => (
    <div className="flex flex-col gap-4 min-w-[320px] w-full">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <h3 className="font-bold text-ink/80 text-sm">{title}</h3>
                <span className="bg-ink/5 text-ink/40 text-[10px] px-1.5 py-0.5 rounded-md font-bold">{count}</span>
            </div>
            <button className="text-ink/30 hover:text-ink/60"><MoreVertical size={16} /></button>
        </div>
        <div className="flex flex-col gap-4 p-2 bg-ink/[0.02] rounded-2xl min-h-[500px]">
            {children}
        </div>
    </div>
);

const KanbanCard = ({ request }) => (
    <motion.div
        whileHover={{ y: -4 }}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-5 rounded-xl border border-ink/5 shadow-sm group cursor-grab active:cursor-grabbing"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-cream border border-ink/5 flex items-center justify-center text-ink/40 font-bold text-xs uppercase">
                {request.userName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-[10px] text-ink/30 font-bold uppercase tracking-tighter">#RR-{Math.floor(Math.random() * 9000) + 1000}</span>
        </div>

        <h4 className="font-bold text-ink mb-1 group-hover:text-red transition-colors">{request.userName}</h4>
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-ink/40 text-xs">
                <Mail size={12} />
                <span>{request.userEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-ink/40 text-xs">
                <MapPin size={12} />
                <span>{request.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-ink/40 text-xs">
                <Calendar size={12} />
                <span>24 Mar - 28 Mar</span>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-ink/5 flex justify-between items-center">
            <div className="flex -space-x-2">
                {[1, 2].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-forest flex items-center justify-center text-[8px] text-white font-bold">AS</div>
                ))}
            </div>
            <div className="text-[10px] text-ink/30 font-bold">2h ago</div>
        </div>
    </motion.div>
);

const Kanban = () => {
    const mockRequests = [
        { id: '1', userName: 'Arjun Mehta', userEmail: 'arjun@example.com', destination: 'Munnar, Kerala', status: 'PENDING' },
        { id: '2', userName: 'Sarah Khan', userEmail: 'sarah@example.com', destination: 'Munnar, Kerala', status: 'PENDING' },
        { id: '3', userName: 'Rohan Sharma', userEmail: 'rohan@example.com', destination: 'Gavi, Kerala', status: 'REVIEWING' },
    ];

    return (
        <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar">
            <KanbanColumn title="Pending" count={2} color="bg-gold">
                {mockRequests.filter(r => r.status === 'PENDING').map(r => <KanbanCard key={r.id} request={r} />)}
            </KanbanColumn>
            <KanbanColumn title="Reviewing" count={1} color="bg-red">
                {mockRequests.filter(r => r.status === 'REVIEWING').map(r => <KanbanCard key={r.id} request={r} />)}
            </KanbanColumn>
            <KanbanColumn title="Confirmed" count={0} color="bg-forest">
            </KanbanColumn>
        </div>
    );
};

export default Kanban;
