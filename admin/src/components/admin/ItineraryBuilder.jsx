import React from 'react';
import { 
  Plus, Trash2, Clock, MapPin, Bus, Utensils, Camera, HardHat, Mountain, Moon, Check, ChevronDown, ChevronUp
} from 'lucide-react';

const ACTIVITY_TIMES = [
  { value: 'MORNING', label: 'Morning', icon: <Clock size={14} /> },
  { value: 'AFTERNOON', label: 'Afternoon', icon: <Clock size={14} /> },
  { value: 'EVENING', label: 'Evening', icon: <Clock size={14} /> },
  { value: 'NIGHT', label: 'Night', icon: <Moon size={14} /> },
  { value: 'NIGHT_STAY', label: 'Overnight', icon: <Moon size={14} /> },
];

const ACTIVITY_TYPES = [
  { value: 'MEAL', label: 'Meal', icon: <Utensils size={14} /> },
  { value: 'SIGHTSEEING', label: 'Sightseeing', icon: <Camera size={14} /> },
  { value: 'ACTIVITY', label: 'Activity', icon: <Plus size={14} /> },
  { value: 'TRAVEL', label: 'Travel', icon: <Bus size={14} /> },
  { value: 'INDUSTRIAL_VISIT', label: 'Industrial Visit', icon: <HardHat size={14} /> },
  { value: 'ADVENTURE_SPORTS', label: 'Adventure Sports', icon: <Mountain size={14} /> },
];

const TRANSPORT_TYPES = ['TRAIN', 'PRIVATE_BUS', 'FLIGHT', 'NONE'];

const ItineraryBuilder = ({ days, onChange }) => {

  const addDay = () => {
    const nextDay = (days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) : -1) + 1;
    onChange([...days, {
      dayNumber: nextDay,
      locationName: '',
      dayTheme: '',
      transportType: 'NONE',
      transportNote: '',
      activities: []
    }]);
  };

  const removeDay = (index) => {
    const newDays = days.filter((_, i) => i !== index);
    onChange(newDays);
  };

  const updateDay = (index, field, value) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    onChange(newDays);
  };

  const addActivity = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = [
      ...(newDays[dayIndex].activities || []),
      { activityTime: 'MORNING', activityType: 'ACTIVITY', description: '', isHighlight: false }
    ];
    onChange(newDays);
  };

  const updateActivity = (dayIndex, actIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex] = { 
      ...newDays[dayIndex].activities[actIndex], 
      [field]: value 
    };
    onChange(newDays);
  };

  const removeActivity = (dayIndex, actIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== actIndex);
    onChange(newDays);
  };

  const moveDay = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === days.length - 1) return;
    
    const newDays = [...days];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newDays[index], newDays[targetIndex]] = [newDays[targetIndex], newDays[index]];
    
    // Auto-reassign day numbers
    const reordered = newDays.map((d, i) => ({ ...d, dayNumber: i }));
    onChange(reordered);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">Structured Itinerary</h3>
        <button 
          type="button" 
          onClick={addDay}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-xl text-xs font-bold hover:bg-ink/90 transition"
        >
          <Plus size={14} /> Add Day
        </button>
      </div>

      <div className="space-y-4">
        {days.map((day, dIdx) => (
          <div key={dIdx} className="bg-ink/5 rounded-2xl p-6 border border-ink/5 relative group">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button type="button" onClick={() => moveDay(dIdx, 'up')} className="p-1 bg-white shadow rounded-md hover:bg-gold transition"><ChevronUp size={14} /></button>
               <button type="button" onClick={() => moveDay(dIdx, 'down')} className="p-1 bg-white shadow rounded-md hover:bg-gold transition"><ChevronDown size={14} /></button>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-ink text-cream rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Day</span>
                  <span className="text-xl font-bold leading-none">{String(day.dayNumber).padStart(2, '0')}</span>
                </div>
                <div className="space-y-1">
                  <input 
                    placeholder="Location (e.g. Dandeli)"
                    value={day.locationName || ''}
                    onChange={(e) => updateDay(dIdx, 'locationName', e.target.value)}
                    className="bg-transparent border-none text-xl font-bold text-ink focus:ring-0 p-0 placeholder:text-ink/20"
                  />
                  <input 
                    placeholder="Theme (e.g. Arrival & Industrial Visit)"
                    value={day.dayTheme || ''}
                    onChange={(e) => updateDay(dIdx, 'dayTheme', e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-ink/60 focus:ring-0 p-0 placeholder:text-ink/10"
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => removeDay(dIdx)}
                className="text-ink/20 hover:text-red transition"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Activities Section */}
            <div className="space-y-3 mb-6">
              {(day.activities || []).map((act, aIdx) => (
                <div key={aIdx} className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-ink/5 shadow-sm">
                  <select 
                    value={act.activityTime}
                    onChange={(e) => updateActivity(dIdx, aIdx, 'activityTime', e.target.value)}
                    className="bg-ink/5 border-none rounded-lg text-xs font-bold text-ink p-2 focus:ring-0"
                  >
                    {ACTIVITY_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  
                  <select 
                    value={act.activityType}
                    onChange={(e) => updateActivity(dIdx, aIdx, 'activityType', e.target.value)}
                    className="bg-ink/5 border-none rounded-lg text-xs font-bold text-ink p-2 focus:ring-0"
                  >
                    {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>

                  <input 
                    placeholder="Activity description..."
                    value={act.description || ''}
                    onChange={(e) => updateActivity(dIdx, aIdx, 'description', e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-ink/20"
                  />

                  <div className="flex items-center gap-2 px-3">
                    <label className="flex items-center gap-2 cursor-pointer group/toggle">
                      <div 
                        onClick={() => updateActivity(dIdx, aIdx, 'isHighlight', !act.isHighlight)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${act.isHighlight ? 'bg-primary' : 'bg-ink/10'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${act.isHighlight ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Highlight</span>
                    </label>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => removeActivity(dIdx, aIdx)}
                    className="text-ink/10 hover:text-red transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addActivity(dIdx)}
                className="w-full py-3 border-2 border-dashed border-ink/10 rounded-xl flex items-center justify-center gap-2 text-ink/40 hover:border-gold hover:text-gold transition-all text-sm font-bold"
              >
                <Plus size={14} /> Add Activity
              </button>
            </div>

            {/* Transport Footer */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Transport</label>
                <select 
                   value={day.transportType}
                   onChange={(e) => updateDay(dIdx, 'transportType', e.target.value)}
                   className="w-full bg-white border-none rounded-xl text-xs font-bold text-ink p-3 focus:ring-2 focus:ring-gold/20"
                >
                  {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Transport Note (e.g. Night Travel)</label>
                <input 
                  placeholder="Journey towards..."
                  value={day.transportNote || ''}
                  onChange={(e) => updateDay(dIdx, 'transportNote', e.target.value)}
                  className="w-full bg-white border-none rounded-xl text-xs font-bold text-ink p-3 focus:ring-2 focus:ring-gold/20 placeholder:text-ink/20"
                />
              </div>
            </div>
          </div>
        ))}
        {days.length === 0 && (
          <div className="py-12 border-2 border-dashed border-ink/10 rounded-3xl flex flex-col items-center justify-center text-ink/30">
             <MapPin size={32} className="mb-3 opacity-20" />
             <p className="font-bold">No days added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryBuilder;
