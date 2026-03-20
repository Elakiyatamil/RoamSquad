import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Calendar, Users, MapPin, Phone, ImagePlus, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

function EventForm({ onSave, isSaving }) {
  const [form, setForm] = useState({ title: '', description: '', location: '', dateTime: '', contactNumber: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form, imageFile);
    setForm({ title: '', description: '', location: '', dateTime: '', contactNumber: '' });
    setImageFile(null);
    setPreview(null);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-ink/5 space-y-4">
      <h3 className="text-xl font-bold text-ink mb-4">Create Event</h3>
      <input
        required
        className="w-full p-4 bg-ink/5 text-ink rounded-xl border-2 border-transparent focus:border-gold outline-none"
        placeholder="Event Title *"
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
      />
      <textarea
        className="w-full p-4 bg-ink/5 text-ink rounded-xl border-2 border-transparent focus:border-gold outline-none resize-none"
        rows={3}
        placeholder="Description"
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          className="p-4 bg-ink/5 text-ink rounded-xl border-2 border-transparent focus:border-gold outline-none"
          placeholder="Location"
          value={form.location}
          onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
        />
        <input
          type="datetime-local"
          className="p-4 bg-ink/5 text-ink rounded-xl border-2 border-transparent focus:border-gold outline-none"
          value={form.dateTime}
          onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))}
        />
      </div>
      <input
        className="w-full p-4 bg-ink/5 text-ink rounded-xl border-2 border-transparent focus:border-gold outline-none"
        placeholder="Contact Number"
        value={form.contactNumber}
        onChange={e => setForm(p => ({ ...p, contactNumber: e.target.value }))}
      />

      {/* Image Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-ink/10 rounded-xl p-4 cursor-pointer hover:border-gold transition text-center"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-ink/40">
            <ImagePlus size={32} />
            <p className="text-sm font-semibold">Click to upload event image</p>
            <p className="text-xs">JPEG, PNG, WebP – max 5MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 bg-ink text-cream rounded-xl font-bold hover:bg-ink/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        {isSaving ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

export default function EventsManager() {
  const [activeTab, setActiveTab] = useState('events');
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await apiClient.get('/events');
      return res.data.data || [];
    }
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['eventInterests'],
    queryFn: async () => {
      const res = await apiClient.get('/event-interest');
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async ({ formData, imageFile }) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);
      return apiClient.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminEvents'] }),
    onError: (err) => console.error('createEvent failed:', err)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
  });

  const formatDate = (dt) => {
    try { return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return dt || '-'; }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-display font-bold text-ink mb-2">Events</h1>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'events' ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}
          >
            <Calendar size={16} className="inline mr-2" />Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'interests' ? 'bg-gold text-ink' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}
          >
            <Users size={16} className="inline mr-2" />Registrations ({interests.length})
          </button>
        </div>
      </div>

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EventForm
              isSaving={createMutation.isPending}
              onSave={(formData, imageFile) => createMutation.mutate({ formData, imageFile })}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {isLoading && <p className="text-ink/40 font-bold animate-pulse">Loading events...</p>}
            {(Array.isArray(events) ? events : []).map(evt => (
              <div key={evt.id} className="bg-white rounded-2xl border border-ink/5 shadow-sm overflow-hidden flex">
                {evt.image && (
                  <img src={evt.image} alt={evt.title} className="w-28 h-full object-cover shrink-0" />
                )}
                <div className="p-6 flex-1">
                  <h3 className="font-bold text-ink text-lg mb-1">{evt.title}</h3>
                  {evt.description && <p className="text-sm text-ink/50 mb-3 line-clamp-2">{evt.description}</p>}
                  <div className="flex flex-wrap gap-4 text-xs text-ink/50">
                    {evt.location && <span className="flex items-center gap-1"><MapPin size={12} />{evt.location}</span>}
                    {evt.dateTime && <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(evt.dateTime)}</span>}
                    {evt.contactNumber && <span className="flex items-center gap-1"><Phone size={12} />{evt.contactNumber}</span>}
                  </div>
                </div>
                <div className="p-4 flex items-center shrink-0">
                  <button
                    onClick={() => { if (window.confirm('Delete this event?')) deleteMutation.mutate(evt.id); }}
                    className="p-2 rounded-xl bg-red/10 text-red hover:bg-red hover:text-white transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && events.length === 0 && (
              <div className="text-center py-16 bg-ink/5 rounded-3xl">
                <Calendar size={40} className="mx-auto text-ink/20 mb-4" />
                <p className="font-bold text-ink/40">No events yet. Create one!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interests' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/60">
              <tr>
                {(Array.isArray(['Email', 'Name', 'Phone', 'Event', 'Registered']) ? ['Email', 'Name', 'Phone', 'Event', 'Registered'] : []).map(h => (
                  <th key={h} className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(interests) ? interests : []).map(i => (
                <tr key={i.id} className="border-t border-ink/5 hover:bg-ink/5">
                  <td className="p-4 font-bold text-ink">{i.email}</td>
                  <td className="p-4 text-ink/70">{i.name || '-'}</td>
                  <td className="p-4 text-ink/70">{i.phone || '-'}</td>
                  <td className="p-4 text-ink/70 font-semibold">{i.event?.title || '-'}</td>
                  <td className="p-4 text-ink/50 text-xs">{new Date(i.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {interests.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-ink/40 font-bold">No registrations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
