import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Activity,
  CheckCircle2, Circle, Plane, Train, Bus, Car, Ship,
  Footprints, Bike, ChevronRight, Zap
} from 'lucide-react';
import { useTripStore, useItineraryStore } from '../store';
import type { TransportMode } from '../types';

const TRANSPORT_ICONS: Record<TransportMode, React.ElementType> = {
  FLIGHT: Plane, TRAIN: Train, BUS: Bus, CAR: Car, FERRY: Ship,
  TAXI: Car, METRO: Train, WALK: Footprints, BIKE: Bike,
};

export default function RoadMapPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips } = useTripStore();
  const { getStops } = useItineraryStore();

  const trip = trips.find(t => t.id === tripId);
  const stops = getStops(tripId!);

  if (!trip) return (
    <div className="page-container text-center py-20">
      <h2 className="text-xl text-white/50">Trip not found</h2>
      <Link to="/trips" className="btn-primary mt-4 inline-flex">Back to Trips</Link>
    </div>
  );

  const totalCost = stops.reduce((s, stop) => {
    return s + (stop.transportCost || 0) + (stop.accommodationCost || 0) +
      stop.activities.reduce((as, a) => as + (a.cost || 0), 0);
  }, 0);

  const totalActivities = stops.reduce((s, st) => s + st.activities.length, 0);
  const completedActivities = stops.reduce((s, st) => s + st.activities.filter(a => a.isCompleted).length, 0);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-white/50 hover:text-white mb-2 transition-colors text-sm">
            <ArrowLeft size={14} /> {trip.name}
          </Link>
          <h1 className="text-2xl font-bold text-white">Road Map</h1>
          <p className="text-white/50 mt-1">{stops.length} stops · {totalActivities} activities</p>
        </div>
        <Link to={`/trips/${tripId}/itinerary`} className="btn-secondary flex items-center gap-2 text-sm">
          <Zap size={14} /> Edit Itinerary
        </Link>
      </div>

      {/* Trip Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: 'Stops', value: stops.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Activity, label: 'Activities', value: `${completedActivities}/${totalActivities}`, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: DollarSign, label: 'Est. Cost', value: `$${totalCost.toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Calendar, label: 'Duration', value: `${Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)}d`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
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

      {/* Road Map Visual */}
      {stops.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No stops yet</h3>
          <Link to={`/trips/${tripId}/itinerary`} className="btn-primary inline-flex items-center gap-2 mt-2">
            <Zap size={16} /> Build Itinerary
          </Link>
        </div>
      ) : (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-6">Journey Timeline</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-teal-500 to-purple-500 opacity-30" />

            <div className="space-y-0">
              {stops.map((stop, idx) => {
                const TransIcon = TRANSPORT_ICONS[stop.transportMode || 'FLIGHT'] || Plane;
                const stopDuration = Math.ceil((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000);
                const stopCost = (stop.transportCost || 0) + (stop.accommodationCost || 0) + stop.activities.reduce((s, a) => s + (a.cost || 0), 0);
                const completedInStop = stop.activities.filter(a => a.isCompleted).length;
                const isLast = idx === stops.length - 1;

                return (
                  <div key={stop.id} className="relative pl-16 pb-8">
                    {/* Stop node */}
                    <div className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-teal-600 flex items-center justify-center border-4 border-[#1c1c26] shadow-lg z-10">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>

                    {/* Transport connector (between stops) */}
                    {!isLast && (
                      <div className="absolute left-4 top-12 flex flex-col items-center gap-1 z-10">
                        <div className="w-4 h-4 rounded-full bg-[#1c1c26] border border-white/20 flex items-center justify-center">
                          <TransIcon size={8} className="text-white/50" />
                        </div>
                      </div>
                    )}

                    {/* Stop Card */}
                    <div className="glass-card p-5 ml-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{stop.cityName}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d')}
                            </span>
                            <span>{stopDuration} day{stopDuration !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-amber-400">${stopCost.toLocaleString()}</div>
                          <div className="text-xs text-white/30">est. cost</div>
                        </div>
                      </div>

                      {/* Stop details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {stop.accommodation && (
                          <div className="p-2.5 rounded-xl bg-white/5">
                            <div className="text-xs text-white/40 mb-0.5">Stay</div>
                            <div className="text-xs text-white font-medium truncate">{stop.accommodation}</div>
                            {stop.accommodationCost && <div className="text-xs text-amber-400">${stop.accommodationCost}/night</div>}
                          </div>
                        )}
                        {stop.transportMode && (
                          <div className="p-2.5 rounded-xl bg-white/5">
                            <div className="text-xs text-white/40 mb-0.5">Transport</div>
                            <div className="text-xs text-white font-medium flex items-center gap-1">
                              <TransIcon size={11} />{stop.transportMode}
                            </div>
                            {stop.transportCost && <div className="text-xs text-amber-400">${stop.transportCost}</div>}
                          </div>
                        )}
                        <div className="p-2.5 rounded-xl bg-white/5">
                          <div className="text-xs text-white/40 mb-0.5">Activities</div>
                          <div className="text-xs text-white font-medium">{completedInStop}/{stop.activities.length} done</div>
                          {stop.activities.length > 0 && (
                            <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${stop.activities.length ? (completedInStop / stop.activities.length) * 100 : 0}%` }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activities list */}
                      {stop.activities.length > 0 && (
                        <div className="mt-4 space-y-1.5">
                          {stop.activities.map(activity => (
                            <div key={activity.id} className="flex items-center gap-2 text-sm">
                              {activity.isCompleted
                                ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                                : <Circle size={14} className="text-white/20 flex-shrink-0" />
                              }
                              <span className={activity.isCompleted ? 'line-through text-white/30' : 'text-white/70'}>{activity.name}</span>
                              {activity.cost !== undefined && activity.cost > 0 && (
                                <span className="text-xs text-amber-400 ml-auto">${activity.cost}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <Link to={`/trips/${tripId}/itinerary`} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-3 transition-colors">
                        Edit stop <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* End marker */}
              <div className="relative pl-16">
                <div className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-[#1c1c26] shadow-lg">
                  <span className="text-white text-lg">🏁</span>
                </div>
                <div className="ml-2 py-3">
                  <div className="text-white/50 text-sm font-medium">Journey Complete</div>
                  <div className="text-xs text-white/30">{format(new Date(trip.endDate), 'MMMM d, yyyy')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}