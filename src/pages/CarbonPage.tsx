import { useState } from 'react';
import { Leaf, Plus, Trash2, Plane, Train, Bus, Car, Ship, Bike, Footprints, TrendingDown, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCarbonStore, useTripStore } from '../store';
import { CO2_FACTORS } from '../data/seed';
import type { TransportMode } from '../types';

const TRANSPORT_CONFIG: Record<TransportMode, { icon: React.ElementType; label: string; color: string }> = {
  FLIGHT: { icon: Plane, label: 'Flight', color: '#6366f1' },
  TRAIN: { icon: Train, label: 'Train', color: '#14b8a6' },
  BUS: { icon: Bus, label: 'Bus', color: '#f59e0b' },
  CAR: { icon: Car, label: 'Car', color: '#8b5cf6' },
  FERRY: { icon: Ship, label: 'Ferry', color: '#06b6d4' },
  TAXI: { icon: Car, label: 'Taxi', color: '#ec4899' },
  METRO: { icon: Train, label: 'Metro', color: '#10b981' },
  WALK: { icon: Footprints, label: 'Walk', color: '#22c55e' },
  BIKE: { icon: Bike, label: 'Bike', color: '#84cc16' },
};

export default function CarbonPage() {
  const { entries, addEntry, deleteEntry, getTotalCO2 } = useCarbonStore();
  const { trips } = useTripStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tripId: trips[0]?.id || '',
    transportMode: 'FLIGHT' as TransportMode,
    distance: '',
    fromCity: '',
    toCity: '',
    date: new Date().toISOString().split('T')[0],
  });

  const totalCO2 = entries.reduce((s, e) => s + e.co2Kg, 0);
  const treesNeeded = Math.ceil(totalCO2 / 21); // avg tree absorbs 21kg CO2/year
  const offsetPct = Math.min(Math.round((entries.filter(e => e.transportMode === 'WALK' || e.transportMode === 'BIKE').length / Math.max(entries.length, 1)) * 100), 100);

  // By transport mode
  const modeData = Object.keys(TRANSPORT_CONFIG).map(mode => ({
    name: TRANSPORT_CONFIG[mode as TransportMode].label,
    co2: entries.filter(e => e.transportMode === mode).reduce((s, e) => s + e.co2Kg, 0),
    color: TRANSPORT_CONFIG[mode as TransportMode].color,
  })).filter(d => d.co2 > 0);

  // By trip
  const tripData = trips.map(trip => ({
    name: trip.name.length > 15 ? trip.name.slice(0, 15) + '…' : trip.name,
    co2: getTotalCO2(trip.id),
  })).filter(d => d.co2 > 0);

  const handleAdd = () => {
    if (!form.distance || !form.tripId) return;
    const distance = parseFloat(form.distance);
    const co2Kg = distance * (CO2_FACTORS[form.transportMode] || 0);
    addEntry({
      tripId: form.tripId,
      transportMode: form.transportMode,
      distance,
      co2Kg,
      fromCity: form.fromCity || undefined,
      toCity: form.toCity || undefined,
      date: form.date,
    });
    setShowForm(false);
    setForm({ tripId: trips[0]?.id || '', transportMode: 'FLIGHT', distance: '', fromCity: '', toCity: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Leaf className="text-green-400" size={24} /> Carbon Tracker
          </h1>
          <p className="text-white/50 mt-1">Track and offset your travel carbon footprint</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Journey
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Leaf, label: 'Total CO₂', value: `${totalCO2.toFixed(1)} kg`, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: TrendingDown, label: 'Trees Needed', value: treesNeeded, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: Plane, label: 'Journeys', value: entries.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Bike, label: 'Green %', value: `${offsetPct}%`, color: 'text-lime-400', bg: 'bg-lime-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {entries.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">CO₂ by Transport Mode</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={modeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="co2">
                  {modeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, '']} contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {modeData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/50">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">CO₂ by Trip</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tripData}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg CO₂`, 'CO₂']} contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="co2" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Journey Log ({entries.length})</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">No journeys logged yet</div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const config = TRANSPORT_CONFIG[entry.transportMode];
              const Icon = config.icon;
              const trip = trips.find(t => t.id === entry.tripId);
              return (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${config.color}20` }}>
                    <Icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
                      {entry.fromCity && entry.toCity ? `${entry.fromCity} → ${entry.toCity}` : config.label}
                    </div>
                    <div className="text-xs text-white/40">{trip?.name} · {entry.distance} km · {entry.date}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-400">{entry.co2Kg.toFixed(1)} kg</div>
                  <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400/50 hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offset Tips */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Leaf size={16} className="text-green-400" /> Reduce Your Footprint</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { tip: 'Choose trains over flights for distances under 500km', saving: 'Save ~80% CO₂' },
            { tip: 'Stay in eco-certified accommodations', saving: 'Save ~30% CO₂' },
            { tip: 'Use public transport instead of taxis', saving: 'Save ~60% CO₂' },
            { tip: 'Walk or cycle for short distances', saving: 'Save 100% CO₂' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
              <div className="text-sm text-white/70">{item.tip}</div>
              <div className="text-xs text-green-400 mt-1 font-medium">{item.saving}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Journey Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Log Journey</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Trip</label>
                <select value={form.tripId} onChange={e => setForm(p => ({ ...p, tripId: e.target.value }))} className="input-field">
                  {trips.map(t => <option key={t.id} value={t.id} className="bg-[#1c1c26]">{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Transport Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TRANSPORT_CONFIG) as TransportMode[]).map(mode => {
                    const config = TRANSPORT_CONFIG[mode];
                    const Icon = config.icon;
                    return (
                      <button key={mode} onClick={() => setForm(p => ({ ...p, transportMode: mode }))} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all ${form.transportMode === mode ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        <Icon size={13} />{config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Distance (km) *</label>
                <input type="number" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} className="input-field" placeholder="e.g. 500" min="0" />
                {form.distance && (
                  <div className="text-xs text-green-400 mt-1">
                    ≈ {(parseFloat(form.distance) * (CO2_FACTORS[form.transportMode] || 0)).toFixed(1)} kg CO₂
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">From City</label>
                  <input type="text" value={form.fromCity} onChange={e => setForm(p => ({ ...p, fromCity: e.target.value }))} className="input-field" placeholder="Departure" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">To City</label>
                  <input type="text" value={form.toCity} onChange={e => setForm(p => ({ ...p, toCity: e.target.value }))} className="input-field" placeholder="Destination" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAdd} disabled={!form.distance || !form.tripId} className="btn-primary flex-1 py-3">Log Journey</button>
                <button onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}