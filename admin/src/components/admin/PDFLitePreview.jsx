import React from 'react';
import { MapPin, Clock, Utensils, Camera, HardHat, Mountain, Bus, Moon, Users } from 'lucide-react';

const ICONS = {
  MEAL: <Utensils size={14} className="text-green-500" />,
  SIGHTSEEING: <Camera size={14} className="text-blue-500" />,
  ACTIVITY: <Camera size={14} className="text-primary" />,
  TRAVEL: <Bus size={14} className="text-gray-500" />,
  INDUSTRIAL_VISIT: <HardHat size={14} className="text-yellow-600" />,
  ADVENTURE_SPORTS: <Mountain size={14} className="text-primary" />,
};

const PDFLitePreview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white border border-ink/10 shadow-2xl rounded-sm w-[210mm] min-h-[297mm] p-[20mm] mx-auto font-serif text-ink overflow-hidden transform scale-[0.4] origin-top">
      {/* Header */}
      <div className="border-b-4 border-primary pb-8 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] tracking-[4px] uppercase font-bold text-ink/40 mb-2">Your Journey By</p>
            <h1 className="text-5xl font-black text-primary uppercase leading-tight">
              {data.name || 'THE ADVENTURE'}
            </h1>
          </div>
          <div className="text-right">
             <p className="font-bold text-xl">ROAM<span className="text-primary">SQUAD</span></p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="border-b-2 border-ink/5 pb-4">
          <p className="text-[10px] uppercase font-bold text-ink/40 mb-1">Duration</p>
          <p className="font-bold text-lg">{data.daysCount} Days / {Math.max(0, data.daysCount - 1)} Nights</p>
        </div>
        <div className="border-b-2 border-ink/5 pb-4">
          <p className="text-[10px] uppercase font-bold text-ink/40 mb-1">Total Pax</p>
          <p className="font-bold text-lg">{data.totalPax || 0} Participants</p>
        </div>
        <div className="border-b-2 border-ink/5 pb-4">
          <p className="text-[10px] uppercase font-bold text-ink/40 mb-1">Experience</p>
          <p className="font-bold text-lg">{data.tag || 'Bestseller'}</p>
        </div>
      </div>

      {/* Breakdown (IV Specific/Custom) */}
      <div className="mb-16 flex gap-6">
        {(data.participantGroups || []).map((g, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
            <Users size={12} className="text-primary" />
            <span className="text-sm font-bold text-ink/80">{g.count} {g.name}</span>
          </div>
        ))}
      </div>

      {/* Itinerary */}
      <div className="space-y-12">
        {data.itineraryType === 'STRUCTURED' ? (
          (data.itineraryDays || []).map((day, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                    <MapPin size={16} className="text-primary" />
                 </div>
                 <h2 className="text-2xl font-black text-primary uppercase">
                   DAY {String(day.dayNumber + 1).padStart(2, '0')} {day.locationName && `(${day.locationName})`}
                 </h2>
              </div>
              
              <div className="ml-5 border-l-2 border-dashed border-primary/30 pl-10 space-y-6">
                 {day.dayTheme && <p className="font-bold text-lg text-ink/80 italic">"{day.dayTheme}"</p>}
                 
                 <div className="space-y-4">
                   {(day.activities || []).map((act, aIdx) => (
                     <div key={aIdx} className="flex items-start gap-4">
                        <div className="mt-1">{ICONS[act.activityType] || <Clock size={14} />}</div>
                        <p className={`text-base leading-relaxed ${act.isHighlight ? 'font-bold text-primary' : 'text-ink'}`}>
                          {act.isHighlight && '['}{act.description}{act.isHighlight && ']'}
                        </p>
                     </div>
                   ))}
                 </div>

                 {day.transportNote && (
                   <div className="mt-8 pt-4 border-t border-ink/5 flex items-center gap-3 text-ink/40">
                      <Bus size={14} />
                      <p className="text-sm font-bold uppercase tracking-widest">{day.transportNote}</p>
                   </div>
                 )}
              </div>
            </div>
          ))
        ) : (
          <div className="prose prose-lg max-w-none text-ink/70 whitespace-pre-wrap font-sans leading-relaxed">
            {data.description || 'No legacy description provided.'}
          </div>
        )}
      </div>

      {/* Pricing Table (at the end) */}
      <div className="mt-24 pt-12 border-t-8 border-ink bg-ink/5 p-10 rounded-xl">
         <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-ink/40 mb-1">Total Package Cost</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">₹{Number(data.pricePerPax || 0).toLocaleString()}</span>
                <span className="text-sm font-bold text-ink/40">/ {data.priceUnit || 'PER PERSON'}</span>
              </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-ink/60">
                 Total Pax: {data.totalPax} (
                 {(data.participantGroups || []).map(g => `${g.count} ${g.name}`).join(' + ')}
                 )
               </p>
               <p className="text-[10px] uppercase font-bold text-primary mt-2">Roam Squad Certified Experience</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PDFLitePreview;
