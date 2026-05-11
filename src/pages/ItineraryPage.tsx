import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus, Trash2, Edit3, ArrowLeft, MapPin, Calendar, Clock,
  DollarSign, Plane, Train, Bus, Car, Ship, Bike, Footprints,
  ChevronDown, ChevronUp, Check, X, GripVertical, Star, Zap
} from 'lucide-react';
import { useTripStore, useItineraryStore, useCityStore } from '../store';
import type { TransportMode, ItineraryStop, ItineraryActivity } from '../types';

const TRANSPORT_ICONS: Record<TransportMode, React.ElementType> = {
  FLIGHT: Plane, TRAIN: Train, BUS: Bus, CAR: Car, FERRY: Ship,
  TAXI: Car, METRO: Train, WALK: Footprints, BIKE: Bike,
};

const TRANSPORT_MODES: TransportMode[] = ['FLIGHT', 'TRAIN', 'BUS', 'CAR', 'FERRY', 'TAXI', 'METRO', 'WALK', 'BIKE'];

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips } = useTripStore();
  const { getStops, addStop, updateStop, deleteStop, addActivity, updateActivity, deleteActivity } = useItineraryStore();
  const { cities } = useCityStore();

  const trip = trips.find(t => t.id === tripId);
  const stops = getStops(tripId!);

  const [expandedStop, setExpandedStop] = useState<string | null>(stops[0]?.id || null);
  const [addingStop, setAddingStop] = useState(false);
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [addingActivity, setAddingActivity] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<{ stopId: string; actId: string } | null>(null);

  // New stop form
  const [newStop, setNewStop] = useState({
    cityName: '', arrivalDate: trip?.startDate || '', departureDate: trip?.endDate || '',
    accommodation: '', accommodationCost: '', transportMode: 'FLIGHT' as TransportMode,
    transportCost: '', notes: '',
  });

  // New activity form
  const [newActivity, setNewActivity] = useState({
    name: '', startTime: '', endTime: '', cost: '', notes: '', description: '',
  });

  const handleAddStop = () => {
    if (!newStop.cityName || !newStop.arrivalDate || !newStop.departureDate) return;
    const stop = addStop(tripId!, {
      itineraryId: `itin-${tripId}`,
      cityName: newStop.cityName,
      name: newStop.cityName,
      arrivalDate: newStop.arrivalDate,
      departureDate: newStop.departureDate,
      dayNumber: stops.length + 1,
      orderIndex: stops.length,
      transportMode: newStop.transportMode,
      transportCost: newStop.transportCost ? parseFloat(newStop.transportCost) : undefined,
      accommodation: newStop.accommodation || undefined,
      accommodationCost: newStop.accommodationCost ? parseFloat(newStop.accommodationCost) : undefined,
      notes: newStop.notes || undefined,
      isHiddenGem: false,
    });
    setExpandedStop(stop.id);
    setAddingStop(false);
    setNewStop({ cityName: '', arrivalDate: '', departureDate: '', accommodation: '', accommodationCost: '', transportMode: 'FLIGHT', transportCost: '', notes: '' });
  };

  const handleAddActivity = (stopId: string) => {
    if (!newActivity.name) return;
    addActivity(tripId!, stopId, {
      stopId,
      name: newActivity.name,
      description: newActivity.description || undefined,
      startTime: newActivity.startTime || new Date().toISOString(),
      endTime: newActivity.endTime || new Date().toISOString(),
      cost: newActivity.cost ? parseFloat(newActivity.cost) : undefined,
      currency: trip?.currency || 'USD',
      notes: newActivity.notes || undefined,
      orderIndex: (stops.find(s => s.id === stopId)?.activities.length || 0),
      isBooked: false,
      isCompleted: false,
      weatherAlert: false,
    });
    setAddingActivity(null);
    setNewActivity({ name: '', startTime: '', endTime: '', cost: '', notes: '', description: '' });
  };

  const TransportIcon = ({ mode }: { mode: TransportMode }) => {
    const Icon = TRANSPORT_ICONS[mode] || Plane;
    return <Icon size={14} />;
  };

  if (!trip) return (
    <div className="page-container text-center py-20">
      <h2 className="text-xl text-white/50">Trip not found</h2>
      <Link to="/trips" className="btn-primary mt-4 inline-flex">Back to Trips</Link>
    </div>
  );

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-white/50 hover:text-white mb-2 transition-colors text-sm">
            <ArrowLeft size={14} /> {trip.name}
          </Link>
          <h1 className="text-2xl font-bold text-white">Itinerary Builder</h1>
          <p className="text-white/50 mt-1">{stops.length} stop{stops.length !== 1 ? 's' : ''} · {stops.reduce((s, st) => s + st.activities.length, 0)} activities</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/roadmap`} className="btn-secondary flex items-center gap-2 text-sm">
            <Zap size={14} /> Road Map
          </Link>
          <button onClick={() => setAddingStop(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Stop
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {stops.length === 0 && !addingStop && (
          <div className="glass-card p-16 text-center">
            <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/50 mb-2">No stops yet</h3>
            <p className="text-white/30 mb-6">Add your first city stop to start building your itinerary</p>
            <button onClick={() => setAddingStop(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Add First Stop
            </button>
          </div>
        )}

        {stops.map((stop, idx) => {
          const isExpanded = expandedStop === stop.id;
          const stopDuration = Math.ceil((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000);
          const stopCost = (stop.transportCost || 0) + (stop.accommodationCost || 0) + stop.activities.reduce((s, a) => s + (a.cost || 0), 0);

          return (
            <div key={stop.id} className="glass-card overflow-hidden">
              {/* Stop Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => setExpandedStop(isExpanded ? null : stop.id)}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {idx + 1}
                  </div>
                  {idx < stops.length - 1 && <div className="w-0.5 h-4 bg-white/10" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg">{stop.cityName}</h3>
                    {stop.isHiddenGem && <span className="badge badge-amber text-xs">💎 Hidden Gem</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Calendar size={11} />{format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d')}</span>
                    <span>{stopDuration}d</span>
                    <span className="flex items-center gap-1"><TransportIcon mode={stop.transportMode || 'FLIGHT'} />{stop.transportMode}</span>
                    <span className="flex items-center gap-1"><DollarSign size={10} />${stopCost.toLocaleString()}</span>
                    <span>{stop.activities.length} activities</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setEditingStop(stop.id); }} className="btn-ghost p-2 text-white/40 hover:text-white">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Remove this stop?')) deleteStop(tripId!, stop.id); }} className="btn-ghost p-2 text-red-400/50 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                </div>
              </div>

              {/* Stop Details */}
              {isExpanded && (
                <div className="border-t border-white/8 p-4 space-y-4">
                  {/* Stop Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stop.accommodation && (
                      <div className="p-3 rounded-xl bg-white/5">
                        <div className="text-xs text-white/40 mb-1">Accommodation</div>
                        <div className="text-sm text-white font-medium truncate">{stop.accommodation}</div>
                        {stop.accommodationCost && <div className="text-xs text-amber-400">${stop.accommodationCost}/night</div>}
                      </div>
                    )}
                    {stop.transportCost && (
                      <div className="p-3 rounded-xl bg-white/5">
                        <div className="text-xs text-white/40 mb-1">Transport</div>
                        <div className="text-sm text-white font-medium flex items-center gap-1"><TransportIcon mode={stop.transportMode || 'FLIGHT'} />{stop.transportMode}</div>
                        <div className="text-xs text-amber-400">${stop.transportCost}</div>
                      </div>
                    )}
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white/80 text-sm">Activities</h4>
                      <button onClick={() => setAddingActivity(stop.id)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                        <Plus size={12} /> Add Activity
                      </button>
                    </div>

                    {stop.activities.length === 0 && addingActivity !== stop.id && (
                      <div className="text-center py-6 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                        No activities yet. Add some!
                      </div>
                    )}

                    <div className="space-y-2">
                      {stop.activities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 group">
                          <button
                            onClick={() => updateActivity(tripId!, stop.id, activity.id, { isCompleted: !activity.isCompleted })}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {activity.isCompleted
                              ? <CheckCircle2 size={16} className="text-green-400" />
                              : <Circle size={16} className="text-white/30 hover:text-white/60" />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${activity.isCompleted ? 'line-through text-white/40' : 'text-white'}`}>
                              {activity.name}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                              {activity.startTime && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {format(new Date(activity.startTime), 'h:mm a')}
                                </span>
                              )}
                              {activity.cost !== undefined && activity.cost > 0 && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <DollarSign size={10} />{activity.cost}
                                </span>
                              )}
                              {activity.isBooked && <span className="badge badge-green text-xs">Booked</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateActivity(tripId!, stop.id, activity.id, { isBooked: !activity.isBooked })} className="btn-ghost p-1.5 text-xs text-teal-400/60 hover:text-teal-400">
                              <Check size={12} />
                            </button>
                            <button onClick={() => deleteActivity(tripId!, stop.id, activity.id)} className="btn-ghost p-1.5 text-red-400/50 hover:text-red-400">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Activity Form */}
                    {addingActivity === stop.id && (
                      <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                        <h5 className="text-sm font-semibold text-white">New Activity</h5>
                        <input
                          type="text"
                          value={newActivity.name}
                          onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))}
                          className="input-field text-sm py-2"
                          placeholder="Activity name *"
                          autoFocus
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">Start Time</label>
                            <input type="datetime-local" value={newActivity.startTime} onChange={e => setNewActivity(p => ({ ...p, startTime: e.target.value }))} className="input-field text-sm py-2" />
                          </div>
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">End Time</label>
                            <input type="datetime-local" value={newActivity.endTime} onChange={e => setNewActivity(p => ({ ...p, endTime: e.target.value }))} className="input-field text-sm py-2" />
                          </div>
                        </div>
                        <input
                          type="number"
                          value={newActivity.cost}
                          onChange={e => setNewActivity(p => ({ ...p, cost: e.target.value }))}
                          className="input-field text-sm py-2"
                          placeholder="Cost (optional)"
                          min="0"
                        />
                        <textarea
                          value={newActivity.notes}
                          onChange={e => setNewActivity(p => ({ ...p, notes: e.target.value }))}
                          className="input-field text-sm py-2 resize-none"
                          rows={2}
                          placeholder="Notes (optional)"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddActivity(stop.id)} disabled={!newActivity.name} className="btn-primary flex-1 text-sm py-2">Add Activity</button>
                          <button onClick={() => { setAddingActivity(null); setNewActivity({ name: '', startTime: '', endTime: '', cost: '', notes: '', description: '' }); }} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Stop Form */}
        {addingStop && (
          <div className="glass-card p-6 space-y-4 border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Add New Stop</h3>
              <button onClick={() => setAddingStop(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-white/50 mb-1.5 block">City Name *</label>
                <input
                  type="text"
                  value={newStop.cityName}
                  onChange={e => setNewStop(p => ({ ...p, cityName: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Paris, Tokyo, Bali"
                  list="city-suggestions"
                  autoFocus
                />
                <datalist id="city-suggestions">
                  {cities.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Arrival Date *</label>
                <input type="date" value={newStop.arrivalDate} onChange={e => setNewStop(p => ({ ...p, arrivalDate: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Departure Date *</label>
                <input type="date" value={newStop.departureDate} onChange={e => setNewStop(p => ({ ...p, departureDate: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Transport Mode</label>
                <select value={newStop.transportMode} onChange={e => setNewStop(p => ({ ...p, transportMode: e.target.value as TransportMode }))} className="input-field">
                  {TRANSPORT_MODES.map(m => <option key={m} value={m} className="bg-[#1c1c26]">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Transport Cost ($)</label>
                <input type="number" value={newStop.transportCost} onChange={e => setNewStop(p => ({ ...p, transportCost: e.target.value }))} className="input-field" placeholder="0" min="0" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Accommodation</label>
                <input type="text" value={newStop.accommodation} onChange={e => setNewStop(p => ({ ...p, accommodation: e.target.value }))} className="input-field" placeholder="Hotel name" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Accommodation Cost/night ($)</label>
                <input type="number" value={newStop.accommodationCost} onChange={e => setNewStop(p => ({ ...p, accommodationCost: e.target.value }))} className="input-field" placeholder="0" min="0" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 mb-1.5 block">Notes</label>
                <textarea value={newStop.notes} onChange={e => setNewStop(p => ({ ...p, notes: e.target.value }))} className="input-field resize-none" rows={2} placeholder="Any notes for this stop..." />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddStop} disabled={!newStop.cityName || !newStop.arrivalDate || !newStop.departureDate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Plus size={16} /> Add Stop
              </button>
              <button onClick={() => setAddingStop(false)} className="btn-secondary px-6">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {stops.length > 0 && (
        <div className="flex gap-3 pt-4 border-t border-white/8">
          <Link to={`/trips/${tripId}`} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={14} /> Trip Overview
          </Link>
          <Link to={`/trips/${tripId}/budget`} className="btn-secondary flex items-center gap-2">
            <DollarSign size={14} /> View Budget
          </Link>
          <button onClick={() => setAddingStop(true)} className="btn-primary ml-auto flex items-center gap-2">
            <Plus size={16} /> Add Stop
          </button>
        </div>
      )}
    </div>
  );
}