import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Shield, DollarSign, Calendar,
  Globe, Users, Clock, Plus, ChevronRight, Thermometer,
  Plane, Check, X
} from 'lucide-react';
import { useCityStore, useTripStore, useItineraryStore } from '../store';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CityDetailPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { getCity, getActivitiesByCity } = useCityStore();
  const { trips } = useTripStore();
  const { addStop, getStops } = useItineraryStore();

  const city = getCity(cityId!);
  const activities = getActivitiesByCity(cityId!);

  const [showAddToTrip, setShowAddToTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'midRange' | 'luxury'>('midRange');

  if (!city) return (
    <div className="page-container text-center py-20">
      <Globe className="w-16 h-16 text-white/10 mx-auto mb-4" />
      <h2 className="text-xl text-white/50">City not found</h2>
      <Link to="/cities" className="btn-primary mt-4 inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Cities</Link>
    </div>
  );

  const dailyCost = city.costs.accommodation[budgetLevel] + city.costs.food[budgetLevel] +
    city.costs.transport[budgetLevel] + city.costs.activities[budgetLevel];

  const handleAddToTrip = () => {
    if (!selectedTrip || !arrivalDate || !departureDate) return;
    const stops = getStops(selectedTrip);
    addStop(selectedTrip, {
      itineraryId: `itin-${selectedTrip}`,
      cityId: city.id,
      cityName: city.name,
      name: city.name,
      description: city.description,
      latitude: city.latitude,
      longitude: city.longitude,
      arrivalDate,
      departureDate,
      dayNumber: stops.length + 1,
      orderIndex: stops.length,
      transportMode: 'FLIGHT',
      isHiddenGem: false,
    });
    setShowAddToTrip(false);
    navigate(`/trips/${selectedTrip}/itinerary`);
  };

  const activePlanningTrips = trips.filter(t => ['PLANNING', 'DRAFT', 'CONFIRMED'].includes(t.status));

  return (
    <div className="page-container space-y-6">
      {/* Back */}
      <Link to="/cities" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
        <ArrowLeft size={14} /> All Cities
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-64">
        <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {city.isFeatured && <span className="badge badge-amber">Featured</span>}
                {city.isPopular && <span className="badge badge-indigo">Popular</span>}
                {city.visaRequired && <span className="badge badge-red">Visa Required</span>}
              </div>
              <h1 className="text-4xl font-bold text-white">{city.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-white/60 text-sm">
                <span className="flex items-center gap-1"><MapPin size={13} />{city.country}</span>
                {city.region && <span>{city.region}</span>}
                <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" />{city.rating} ({city.reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>
            <button
              onClick={() => setShowAddToTrip(true)}
              className="btn-primary flex items-center gap-2 flex-shrink-0"
            >
              <Plus size={16} /> Add to Trip
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Star, label: 'Rating', value: `${city.rating}/5`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Shield, label: 'Safety Score', value: `${city.safetyScore}/10`, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: DollarSign, label: 'Daily Cost', value: `~$${dailyCost}`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Users, label: 'Population', value: city.population ? `${(city.population / 1000000).toFixed(1)}M` : 'N/A', color: 'text-teal-400', bg: 'bg-teal-500/10' },
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card p-5">
            <h2 className="section-title">About {city.name}</h2>
            <p className="text-white/60 leading-relaxed">{city.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {city.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-sm">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Activities */}
          {activities.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Top Activities</h2>
                <Link to={`/activities?city=${cityId}`} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {activities.slice(0, 4).map(activity => (
                  <div key={activity.id} className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                    {activity.imageUrl && (
                      <img src={activity.imageUrl} alt={activity.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white text-sm">{activity.name}</h4>
                        <span className="text-xs text-amber-400 flex items-center gap-0.5 flex-shrink-0"><Star size={10} />{activity.rating}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                        {activity.duration && <span className="flex items-center gap-0.5"><Clock size={10} />{activity.duration}min</span>}
                        {activity.priceMin !== undefined && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <DollarSign size={10} />
                            {activity.priceMin === 0 ? 'Free' : `${activity.priceMin}–${activity.priceMax}`}
                          </span>
                        )}
                        {activity.isHiddenGem && <span className="badge badge-amber text-xs">💎 Hidden Gem</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Cost Breakdown */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-400" /> Daily Cost Estimate
            </h3>
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
              {(['budget', 'midRange', 'luxury'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setBudgetLevel(level)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${budgetLevel === level ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  {level === 'midRange' ? 'Mid' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { label: 'Accommodation', value: city.costs.accommodation[budgetLevel] },
                { label: 'Food', value: city.costs.food[budgetLevel] },
                { label: 'Transport', value: city.costs.transport[budgetLevel] },
                { label: 'Activities', value: city.costs.activities[budgetLevel] },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-medium">${item.value}/day</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                <span className="text-white/70">Total</span>
                <span className="text-white">${dailyCost}/day</span>
              </div>
            </div>
          </div>

          {/* Best Time to Visit */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-teal-400" /> Best Time to Visit
            </h3>
            <div className="grid grid-cols-6 gap-1">
              {MONTH_NAMES.map((month, idx) => {
                const isBest = city.bestMonths.includes(idx + 1);
                return (
                  <div key={month} className={`text-center py-2 rounded-lg text-xs font-medium transition-all ${isBest ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20' : 'bg-white/5 text-white/20'}`}>
                    {month}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-white">City Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Timezone</span>
                <span className="text-white">{city.timezone}</span>
              </div>
              {city.currency && (
                <div className="flex justify-between">
                  <span className="text-white/40">Currency</span>
                  <span className="text-white">{city.currency}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Visa Required</span>
                <span className={city.visaRequired ? 'text-red-400' : 'text-green-400'}>
                  {city.visaRequired ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Trip CTA */}
          <button onClick={() => setShowAddToTrip(true)} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Plane size={16} /> Add to My Trip
          </button>
        </div>
      </div>

      {/* Add to Trip Modal */}
      {showAddToTrip && (
        <div className="modal-overlay" onClick={() => setShowAddToTrip(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add {city.name} to Trip</h3>
              <button onClick={() => setShowAddToTrip(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {activePlanningTrips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50 mb-4">No active trips to add to</p>
                <Link to="/trips/new" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={16} /> Create New Trip
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Select Trip</label>
                  <div className="space-y-2">
                    {activePlanningTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTrip(trip.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedTrip === trip.id ? 'border-indigo-500/40 bg-indigo-600/20' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
                      >
                        {trip.coverPhotoUrl && <img src={trip.coverPhotoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <div className={`font-medium text-sm ${selectedTrip === trip.id ? 'text-indigo-300' : 'text-white'}`}>{trip.name}</div>
                          <div className="text-xs text-white/40">{trip.status}</div>
                        </div>
                        {selectedTrip === trip.id && <Check size={16} className="text-indigo-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Arrival Date</label>
                    <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Departure Date</label>
                    <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddToTrip}
                    disabled={!selectedTrip || !arrivalDate || !departureDate}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add to Itinerary
                  </button>
                  <button onClick={() => setShowAddToTrip(false)} className="btn-secondary px-6">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}