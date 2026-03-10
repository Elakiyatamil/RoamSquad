import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Utensils,
    Home,
    MapPin,
    Plus,
    Trash2,
    Edit2,
    Clock,
    DollarSign
} from 'lucide-react';

const DestinationTab = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${active ? 'border-red text-red bg-red/5' : 'border-transparent text-ink/40 hover:text-ink/60'
            }`}
    >
        {label}
    </button>
);

const ContentCard = ({ title, details, icon: Icon, price, onEdit, onDelete }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-cream border border-ink/5 flex items-center justify-center text-red">
                {Icon ? <Icon size={24} /> : <Activity size={24} />}
            </div>
            <div className="flex gap-2">
                <button onClick={onEdit} className="p-2 text-ink/20 hover:text-ink/60 transition-colors"><Edit2 size={16} /></button>
                <button onClick={onDelete} className="p-2 text-ink/20 hover:text-red transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
        <h4 className="text-xl font-display font-bold text-ink mb-2">{title}</h4>
        <div className="flex flex-wrap gap-4 text-ink/40 text-xs mb-4">
            {details.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                    {d.icon && <d.icon size={12} />}
                    <span>{d.text}</span>
                </div>
            ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-ink/5">
            <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">Starting from</span>
            <span className="text-xl font-bold text-gold font-display">₹{price}</span>
        </div>
    </motion.div>
);

const DestinationManager = ({ destinationName }) => {
    const [activeTab, setActiveTab] = React.useState('activities');

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-ink/30 text-sm font-bold uppercase tracking-widest mb-2">
                        <MapPin size={14} />
                        <span>Kerala / Idukki</span>
                    </div>
                    <h1 className="text-5xl font-display font-bold text-ink">{destinationName}</h1>
                </div>
                <button className="bg-red text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:bg-red/90 transition-all shadow-lg shadow-red/20">
                    <Plus size={20} />
                    <span>Add New</span>
                </button>
            </header>

            <div className="bg-white border border-ink/5 rounded-2xl overflow-hidden mb-10 shadow-sm">
                <div className="flex border-b border-ink/5 overflow-x-auto">
                    <DestinationTab label="Activities" active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} />
                    <DestinationTab label="Food Options" active={activeTab === 'food'} onClick={() => setActiveTab('food')} />
                    <DestinationTab label="Accommodation" active={activeTab === 'accommodation'} onClick={() => setActiveTab('accommodation')} />
                    <DestinationTab label="Travel" active={activeTab === 'travel'} onClick={() => setActiveTab('travel')} />
                    <DestinationTab label="Spots" active={activeTab === 'spots'} onClick={() => setActiveTab('spots')} />
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Conditional Rendering Based on activeTab */}
                        {activeTab === 'activities' && (
                            <>
                                <ContentCard
                                    title="Tea Plantation Walk"
                                    details={[
                                        { icon: Clock, text: '2 Hours' },
                                        { icon: Activity, text: 'Easy' }
                                    ]}
                                    price={450}
                                    icon={MapPin}
                                />
                                <ContentCard
                                    title="Anamudi Peak Trek"
                                    details={[
                                        { icon: Clock, text: '6 Hours' },
                                        { icon: Activity, text: 'Hard' }
                                    ]}
                                    price={1200}
                                    icon={Activity}
                                />
                            </>
                        )}
                        {activeTab === 'food' && (
                            <>
                                <ContentCard
                                    title="Authentic Kerala Thali"
                                    details={[{ text: 'Lunch' }, { text: 'Traditional' }]}
                                    price={250}
                                    icon={Utensils}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationManager;
